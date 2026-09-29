import * as THREE from 'three'
import {
  bakeFrag,
  compositeFrag,
  crystalFrag,
  crystalVert,
  dropFrag,
  fullscreenVert,
  normalFrag,
  updateFrag,
} from './shaders'

export type TideEngineOptions = {
  canvas: HTMLCanvasElement
  fontFamily: string
  mobile: boolean
  reducedMotion: boolean
}

type Segment = { ax: number; ay: number; bx: number; by: number; radius: number; strength: number }

const MAX_SEGMENTS = 8
const SIM_STEP = 1 / 60

/**
 * Real-time tidal water over a clay bed, rendered with three.js.
 * No React in here: the hero component owns lifecycle, scroll and input.
 */
export class TideEngine {
  private renderer: THREE.WebGLRenderer
  private canvas: HTMLCanvasElement
  private opts: TideEngineOptions

  private quad = new THREE.PlaneGeometry(2, 2)
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private simScene = new THREE.Scene()
  private simMesh: THREE.Mesh
  private scene = new THREE.Scene()

  private simA!: THREE.WebGLRenderTarget
  private simB!: THREE.WebGLRenderTarget
  private clayTarget!: THREE.WebGLRenderTarget
  private simW = 0
  private simH = 0
  private canSimulate: boolean
  private floatTargets: boolean

  private dropMat: THREE.ShaderMaterial
  private updateMat: THREE.ShaderMaterial
  private normalMat: THREE.ShaderMaterial
  private bakeMat: THREE.ShaderMaterial
  private compositeMat: THREE.ShaderMaterial
  private crystalMat: THREE.ShaderMaterial
  private crystals: THREE.InstancedMesh | null = null
  private wordSoft: THREE.CanvasTexture | null = null
  private wordSharp: THREE.CanvasTexture | null = null
  private grooveSamples: Array<[number, number]> = []

  private segments: Segment[] = []
  private width = 1
  private height = 1
  private dpr = 1
  private maxDpr: number
  private accumulator = 0
  private time = 0
  private lastAmbient = 0
  private lastLap = 0
  private frameTimes: number[] = []

  tide = 0
  tideTarget = 0
  dark = 0
  darkTarget = 0
  intro = 0
  pointer = new THREE.Vector2(-10, -10)

  constructor(opts: TideEngineOptions) {
    this.opts = opts
    this.canvas = opts.canvas
    this.maxDpr = opts.mobile ? 1.5 : 2

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    })
    this.renderer.autoClear = false
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace

    const ext = this.renderer.extensions
    this.floatTargets = ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float')
    this.canSimulate = !opts.reducedMotion && this.floatTargets

    const simUniforms = { uTex: { value: null as THREE.Texture | null }, uTexel: { value: new THREE.Vector2() } }
    this.dropMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: dropFrag,
      uniforms: {
        uTex: simUniforms.uTex,
        uAspect: { value: 1 },
        uSeg: { value: Array.from({ length: MAX_SEGMENTS }, () => new THREE.Vector4()) },
        uParam: { value: Array.from({ length: MAX_SEGMENTS }, () => new THREE.Vector2()) },
        uCount: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.updateMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: updateFrag,
      uniforms: { uTex: { value: null }, uTexel: simUniforms.uTexel, uDamping: { value: 0.986 } },
      depthTest: false,
      depthWrite: false,
    })
    this.normalMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: normalFrag,
      uniforms: { uTex: { value: null }, uTexel: simUniforms.uTexel },
      depthTest: false,
      depthWrite: false,
    })
    this.bakeMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: bakeFrag,
      uniforms: {
        uWordSoft: { value: null },
        uWordSharp: { value: null },
        uAspect: { value: 1 },
        uTexel: { value: new THREE.Vector2() },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.compositeMat = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: compositeFrag,
      uniforms: {
        uSim: { value: null },
        uClay: { value: null },
        uSimTexel: { value: new THREE.Vector2() },
        uRes: { value: new THREE.Vector2() },
        uAspect: { value: 1 },
        uTime: { value: 0 },
        uTide: { value: 0 },
        uDark: { value: 0 },
        uIntro: { value: 0 },
        uPaper: { value: new THREE.Color(0xeef0ee) },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.crystalMat = new THREE.ShaderMaterial({
      vertexShader: crystalVert,
      fragmentShader: crystalFrag,
      uniforms: {
        uRes: this.compositeMat.uniforms.uRes,
        uTide: this.compositeMat.uniforms.uTide,
        uTime: this.compositeMat.uniforms.uTime,
        uDark: this.compositeMat.uniforms.uDark,
        uIntro: this.compositeMat.uniforms.uIntro,
        uAspect: this.compositeMat.uniforms.uAspect,
        uPointer: { value: this.pointer },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })

    this.simMesh = new THREE.Mesh(this.quad, this.updateMat)
    this.simMesh.frustumCulled = false
    this.simScene.add(this.simMesh)

    const compositeMesh = new THREE.Mesh(this.quad, this.compositeMat)
    compositeMesh.frustumCulled = false
    compositeMesh.renderOrder = 0
    this.scene.add(compositeMesh)
  }

  get simulating() {
    return this.canSimulate
  }

  /** Resize everything, rebuild the carved wordmark and the clay bake. */
  async resize(width: number, height: number) {
    this.width = Math.max(1, Math.round(width))
    this.height = Math.max(1, Math.round(height))
    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr)
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(this.width, this.height, false)

    const aspect = this.width / this.height
    const bufW = Math.round(this.width * this.dpr)
    const bufH = Math.round(this.height * this.dpr)
    this.compositeMat.uniforms.uRes.value.set(bufW, bufH)
    this.compositeMat.uniforms.uAspect.value = aspect
    this.dropMat.uniforms.uAspect.value = aspect

    // Height-field simulation targets
    const base = this.opts.mobile ? 150 : 240
    this.simH = base
    this.simW = Math.max(64, Math.min(640, Math.round(base * aspect)))
    this.simA?.dispose()
    this.simB?.dispose()
    const simOpts: THREE.RenderTargetOptions = {
      type: this.canSimulate ? THREE.HalfFloatType : THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    }
    this.simA = new THREE.WebGLRenderTarget(this.simW, this.simH, simOpts)
    this.simB = new THREE.WebGLRenderTarget(this.simW, this.simH, simOpts)
    this.renderer.setRenderTarget(this.simA)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.clear()
    this.renderer.setRenderTarget(this.simB)
    this.renderer.clear()
    this.renderer.setRenderTarget(null)
    this.updateMat.uniforms.uTexel.value.set(1 / this.simW, 1 / this.simH)
    this.compositeMat.uniforms.uSimTexel.value.set(1 / this.simW, 1 / this.simH)

    await this.buildWordmark(aspect)
    this.bakeClay(aspect)
    this.buildCrystals()
  }

  /** Draw "Nils Lutz" into two canvases: a soft groove height and a crisp mask. */
  private async buildWordmark(aspect: number) {
    const scale = this.opts.mobile ? 0.6 : 0.75
    const w = Math.max(2, Math.round(this.width * this.dpr * scale))
    const h = Math.max(2, Math.round(this.height * this.dpr * scale))
    const stacked = aspect < 0.95
    const lines = stacked ? ['Nils', 'Lutz'] : ['Nils Lutz']
    const family = this.opts.fontFamily || 'Georgia, serif'

    const probe = `italic 400 100px ${family}`
    try {
      await document.fonts.load(probe, 'Nils Lutz')
    } catch {
      /* fall back to whatever is available */
    }

    const measure = document.createElement('canvas').getContext('2d')!
    measure.font = probe
    const widest = Math.max(...lines.map((l) => measure.measureText(l).width))
    const targetW = w * (stacked ? 0.8 : 0.8)
    const maxH = h * (stacked ? 0.27 : 0.4)
    const size = Math.min((targetW / widest) * 100, maxH)
    const lineH = size * 0.92
    const centerY = h * (stacked ? 0.52 : 0.54)

    const draw = (blur: number) => {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      ctx.font = `italic 400 ${size}px ${family}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const startY = centerY - ((lines.length - 1) * lineH) / 2
      if (blur > 0) {
        // shadowBlur works everywhere (ctx.filter is not universal)
        ctx.shadowColor = '#fff'
        ctx.shadowBlur = blur
        ctx.shadowOffsetX = w * 2
        ctx.fillStyle = '#fff'
        lines.forEach((l, i) => ctx.fillText(l, w / 2 - w * 2, startY + i * lineH))
        lines.forEach((l, i) => ctx.fillText(l, w / 2 - w * 2, startY + i * lineH))
      } else {
        ctx.fillStyle = '#fff'
        lines.forEach((l, i) => ctx.fillText(l, w / 2, startY + i * lineH))
      }
      return c
    }

    const soft = draw(Math.max(2, size * 0.035))
    const sharp = draw(0)

    // Salt collects on the rims of the carved letters: sample rim pixels.
    this.grooveSamples = []
    const sctx = soft.getContext('2d')!
    const step = Math.max(2, Math.round(size / 60))
    const data = sctx.getImageData(0, 0, w, h).data
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const v = data[(y * w + x) * 4] / 255
        if (v > 0.12 && v < 0.55) this.grooveSamples.push([x / w, 1 - y / h])
      }
    }

    this.wordSoft?.dispose()
    this.wordSharp?.dispose()
    this.wordSoft = new THREE.CanvasTexture(soft)
    this.wordSharp = new THREE.CanvasTexture(sharp)
    for (const t of [this.wordSoft, this.wordSharp]) {
      t.minFilter = THREE.LinearFilter
      t.magFilter = THREE.LinearFilter
      t.generateMipmaps = false
      t.colorSpace = THREE.NoColorSpace
      t.flipY = true
      t.needsUpdate = true
    }
  }

  private bakeClay(aspect: number) {
    const scale = this.opts.mobile ? 0.6 : 0.75
    const w = Math.max(2, Math.round(this.width * this.dpr * scale))
    const h = Math.max(2, Math.round(this.height * this.dpr * scale))
    this.clayTarget?.dispose()
    this.clayTarget = new THREE.WebGLRenderTarget(w, h, {
      // 8-bit normals terrace visibly on gentle clay slopes
      type: this.floatTargets ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    })
    this.bakeMat.uniforms.uWordSoft.value = this.wordSoft
    this.bakeMat.uniforms.uWordSharp.value = this.wordSharp
    this.bakeMat.uniforms.uAspect.value = aspect
    this.bakeMat.uniforms.uTexel.value.set(1 / w, 1 / h)
    this.simMesh.material = this.bakeMat
    this.renderer.setRenderTarget(this.clayTarget)
    this.renderer.render(this.simScene, this.camera)
    this.renderer.setRenderTarget(null)
    this.compositeMat.uniforms.uClay.value = this.clayTarget.texture
  }

  private buildCrystals() {
    if (this.crystals) {
      this.scene.remove(this.crystals)
      this.crystals.geometry.dispose()
      this.crystals.dispose()
    }
    const area = (this.width * this.height) / (1440 * 900)
    const count = Math.round((this.opts.mobile ? 700 : 1600) * Math.min(1.4, Math.max(0.5, area)))
    const geo = new THREE.BoxGeometry(1, 1, 1)
    const offsets = new Float32Array(count * 3)
    const seeds = new Float32Array(count * 2)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const s = new THREE.Vector3()
    const pos = new THREE.Vector3()
    const mesh = new THREE.InstancedMesh(geo, this.crystalMat, count)

    // deterministic PRNG so the salt pattern is stable between resizes
    let seed = 1337
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    // salt blooms: a few dozen patches rather than an even dusting
    const blooms: Array<[number, number]> = Array.from({ length: 34 }, () => [rand(), 0.04 + rand() * 0.9])

    for (let i = 0; i < count; i++) {
      const inGroove = this.grooveSamples.length > 0 && rand() < 0.68
      let x: number
      let y: number
      if (inGroove) {
        const g = this.grooveSamples[Math.floor(rand() * this.grooveSamples.length)]
        x = g[0] + (rand() - 0.5) * 0.004
        y = g[1] + (rand() - 0.5) * 0.004
      } else {
        // clustered: salt blooms in patches
        const [cx, cy] = blooms[Math.floor(rand() * blooms.length)]
        const r = rand() * rand() * 0.05
        const a = rand() * Math.PI * 2
        x = cx + Math.cos(a) * r
        y = cy + Math.sin(a) * r
      }
      const px = (0.8 + Math.pow(rand(), 4) * (inGroove ? 4 : 5)) * this.dpr
      offsets.set([x, y, px], i * 3)
      seeds.set([rand(), inGroove ? 1 : 0], i * 2)
      e.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI)
      q.setFromEuler(e)
      s.set(0.85 + rand() * 0.3, 0.85 + rand() * 0.3, 0.85 + rand() * 0.3)
      m.compose(pos, q, s)
      mesh.setMatrixAt(i, m)
    }
    geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3))
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 2))
    mesh.frustumCulled = false
    mesh.renderOrder = 1
    this.crystals = mesh
    this.scene.add(mesh)
  }

  /** Add a ripple stroke (uv space, origin bottom-left). */
  disturb(ax: number, ay: number, bx: number, by: number, radius = 0.028, strength = 0.012) {
    if (!this.canSimulate) return
    if (this.segments.length >= MAX_SEGMENTS) this.segments.shift()
    this.segments.push({ ax, ay, bx, by, radius, strength })
  }

  setPointer(x: number, y: number) {
    this.pointer.set(x, y)
  }

  private swap() {
    const t = this.simA
    this.simA = this.simB
    this.simB = t
  }

  private pass(mat: THREE.ShaderMaterial) {
    mat.uniforms.uTex.value = this.simA.texture
    this.simMesh.material = mat
    this.renderer.setRenderTarget(this.simB)
    this.renderer.render(this.simScene, this.camera)
    this.swap()
  }

  private stepSim() {
    if (this.segments.length) {
      const u = this.dropMat.uniforms
      this.segments.forEach((s, i) => {
        u.uSeg.value[i].set(s.ax, s.ay, s.bx, s.by)
        u.uParam.value[i].set(s.radius, s.strength)
      })
      u.uCount.value = this.segments.length
      this.pass(this.dropMat)
      this.segments = []
    }
    this.pass(this.updateMat)
    this.pass(this.updateMat)
    this.pass(this.normalMat)
  }

  private ambient() {
    // occasional drizzle + small laps along the waterline
    if (this.time - this.lastAmbient > 0.7 + Math.random() * 1.2) {
      this.lastAmbient = this.time
      const x = Math.random()
      const y = Math.random()
      this.disturb(x, y, x, y, 0.012 + Math.random() * 0.01, 0.006)
    }
    const level = 1.12 + (-0.45 - 1.12) * this.tide
    if (level > -0.05 && level < 1.05 && this.time - this.lastLap > 0.28) {
      this.lastLap = this.time
      const x = Math.random()
      const y = level - 0.015
      this.disturb(x - 0.03, y, x + 0.03, y, 0.018, 0.004)
    }
  }

  /** Advance and draw one frame. `dt` in seconds. */
  render(dt: number) {
    const clamped = Math.min(dt, 0.1)
    this.time += clamped
    const k = 1 - Math.exp(-clamped * 6)
    this.tide += (this.tideTarget - this.tide) * k
    this.dark += (this.darkTarget - this.dark) * (1 - Math.exp(-clamped * 4))

    if (this.canSimulate) {
      this.ambient()
      this.accumulator += clamped
      let steps = 0
      while (this.accumulator >= SIM_STEP && steps < 3) {
        this.stepSim()
        this.accumulator -= SIM_STEP
        steps++
      }
      if (steps === 3) this.accumulator = 0
    }

    const u = this.compositeMat.uniforms
    u.uSim.value = this.simA.texture
    u.uTime.value = this.time
    u.uTide.value = this.tide
    u.uDark.value = this.dark
    u.uIntro.value = this.intro
    ;(u.uPaper.value as THREE.Color).setRGB(
      0.933 + (0.059 - 0.933) * this.dark,
      0.941 + (0.078 - 0.941) * this.dark,
      0.933 + (0.09 - 0.933) * this.dark
    )

    this.renderer.setRenderTarget(null)
    this.renderer.render(this.scene, this.camera)

    this.adapt(dt)
  }

  /** Drop the pixel ratio if frames are consistently slow. */
  private adapt(dt: number) {
    if (!this.canSimulate) return
    this.frameTimes.push(dt)
    if (this.frameTimes.length < 90) return
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    this.frameTimes = []
    if (avg > 1 / 40 && this.dpr > 1) {
      this.maxDpr = Math.max(1, this.dpr - 0.25)
      this.dpr = this.maxDpr
      this.renderer.setPixelRatio(this.dpr)
      this.renderer.setSize(this.width, this.height, false)
      this.compositeMat.uniforms.uRes.value.set(Math.round(this.width * this.dpr), Math.round(this.height * this.dpr))
    }
  }

  dispose() {
    this.simA?.dispose()
    this.simB?.dispose()
    this.clayTarget?.dispose()
    this.wordSoft?.dispose()
    this.wordSharp?.dispose()
    this.crystals?.geometry.dispose()
    this.crystals?.dispose()
    this.quad.dispose()
    ;[this.dropMat, this.updateMat, this.normalMat, this.bakeMat, this.compositeMat, this.crystalMat].forEach((m) =>
      m.dispose()
    )
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
