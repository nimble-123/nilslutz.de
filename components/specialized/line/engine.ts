import * as THREE from 'three'
import { pointAt, type Sample, type Shape } from './geometry'
import { StringSim } from './string-sim'

/**
 * Renders "the line": one anti-aliased ribbon in an orthographic, CSS-pixel space.
 *
 * - Coverage is computed analytically per fragment (box-filtered distance to the centre line),
 *   so a 1px hairline is exactly one CSS pixel wide at any DPR, with round caps.
 * - A CPU string simulation displaces the line along its normal; the cursor or a finger can
 *   catch it and let go (a pluck). Normal velocity widens the ribbon by a fraction of a pixel
 *   and lowers its opacity accordingly — the tiniest possible motion blur.
 */

const VERT = /* glsl */ `
attribute vec2 aEdge;   // x: distance beyond the cap (px), y: signed distance across (px)
attribute float aHalf;  // half width incl. blur (px)
attribute float aAtt;   // blur attenuation
varying vec2 vEdge;
varying float vHalf;
varying float vAtt;
void main() {
  vEdge = aEdge;
  vHalf = aHalf;
  vAtt = aAtt;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uDpr;
varying vec2 vEdge;
varying float vHalf;
varying float vAtt;
void main() {
  float d = length(vec2(max(vEdge.x, 0.0), vEdge.y)) * uDpr;
  float h = vHalf * uDpr;
  float a = clamp(h + 0.5 - d, 0.0, 1.0) * vAtt * uOpacity;
  if (a <= 0.0) discard;
  gl_FragColor = vec4(uColor * a, a);
}
`

type Ribbon = {
  mesh: THREE.Mesh
  geo: THREE.BufferGeometry
  pos: Float32Array
  edge: Float32Array
  half: Float32Array
  att: Float32Array
  capacity: number
}

export type Segment = { x0: number; y0: number; x1: number; y1: number }

export type LineFrame = {
  shape: Shape
  /** extra tangent strokes (the side-by-side extensions) */
  segments: Segment[]
  /** 0 = ink, 1 = signal */
  signal: number
  /** whether the pointer may catch the line */
  pluckable: boolean
}

type RGB = [number, number, number]

export class LineEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1, 1)
  private material: THREE.ShaderMaterial
  private main: Ribbon
  private extras: Ribbon[] = []
  private sim: StringSim
  private samples: number
  // sampled base curve (no displacement) of the last frame, used for picking
  private baseX: Float32Array
  private baseY: Float32Array
  private baseNX: Float32Array
  private baseNY: Float32Array
  private baseU: Float32Array
  private baseCount = 0
  private px: Float32Array
  private py: Float32Array
  private vel: Float32Array
  private tmp: Sample = { x: 0, y: 0, nx: 0, ny: 0 }
  private W = 1
  private H = 1
  private dpr = 1
  private ink: RGB = [0.067, 0.067, 0.067]
  private signalColor: RGB = [1, 0.23, 0]
  private lastKey = ''
  private forceRender = true
  private shape: Shape | null = null
  private pluckable = false
  // pointer
  private pointer = { x: -1e4, y: -1e4, has: false }
  private prevSigned = NaN
  private grab: { u: number; touch: boolean } | null = null
  private maxPull: number
  private lastPluck = 0

  constructor(canvas: HTMLCanvasElement, { mobile }: { mobile: boolean }) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    })
    this.renderer.setClearColor(0x000000, 0)
    this.samples = mobile ? 260 : 520
    this.sim = new StringSim(mobile ? 160 : 320, { fundamental: mobile ? 3.6 : 3.2 })
    this.maxPull = mobile ? 30 : 44
    this.baseX = new Float32Array(this.samples)
    this.baseY = new Float32Array(this.samples)
    this.baseNX = new Float32Array(this.samples)
    this.baseNY = new Float32Array(this.samples)
    this.baseU = new Float32Array(this.samples)
    this.px = new Float32Array(this.samples)
    this.py = new Float32Array(this.samples)
    this.vel = new Float32Array(this.samples)

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uColor: { value: new THREE.Vector3(...this.ink) },
        uOpacity: { value: 1 },
        uDpr: { value: 1 },
      },
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.main = this.createRibbon(this.samples)
    for (let i = 0; i < 3; i++) this.extras.push(this.createRibbon(2))
  }

  private createRibbon(points: number): Ribbon {
    const capacity = points + 2
    const verts = capacity * 2
    const pos = new Float32Array(verts * 3)
    const edge = new Float32Array(verts * 2)
    const half = new Float32Array(verts)
    const att = new Float32Array(verts)
    const idx: number[] = []
    for (let j = 0; j < capacity - 1; j++) {
      const a = j * 2
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage))
    geo.setAttribute('aEdge', new THREE.BufferAttribute(edge, 2).setUsage(THREE.DynamicDrawUsage))
    geo.setAttribute('aHalf', new THREE.BufferAttribute(half, 1).setUsage(THREE.DynamicDrawUsage))
    geo.setAttribute('aAtt', new THREE.BufferAttribute(att, 1).setUsage(THREE.DynamicDrawUsage))
    geo.setIndex(idx)
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e7)
    const mesh = new THREE.Mesh(geo, this.material)
    mesh.frustumCulled = false
    this.scene.add(mesh)
    return { mesh, geo, pos, edge, half, att, capacity }
  }

  resize(W: number, H: number, dpr: number) {
    this.W = W
    this.H = H
    this.dpr = dpr
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(W, H, false)
    this.camera.left = 0
    this.camera.right = W
    this.camera.top = 0
    this.camera.bottom = H
    this.camera.updateProjectionMatrix()
    this.material.uniforms.uDpr.value = dpr
    this.forceRender = true
  }

  setColors(ink: RGB, signal: RGB) {
    this.ink = ink
    this.signalColor = signal
    this.forceRender = true
  }

  // ---------------------------------------------------------------- pointer

  pointerMove(x: number, y: number) {
    this.pointer.x = x
    this.pointer.y = y
    this.pointer.has = true
    if (this.grab || !this.pluckable || !this.shape) {
      this.prevSigned = NaN
      return
    }
    const hit = this.nearest(x, y)
    if (!hit) {
      this.prevSigned = NaN
      return
    }
    // the pointer crossed the line → it catches the string
    if (
      !Number.isNaN(this.prevSigned) &&
      Math.sign(hit.signed) !== Math.sign(this.prevSigned) &&
      Math.abs(hit.signed - this.prevSigned) < 60
    ) {
      this.grab = { u: hit.u, touch: false }
    }
    this.prevSigned = hit.signed
  }

  pointerLeave() {
    this.pointer.has = false
    this.prevSigned = NaN
    this.release()
  }

  /** Touch: catch the line if the finger lands close to it. Returns true when caught. */
  touchDown(x: number, y: number) {
    if (!this.pluckable || !this.shape) return false
    const hit = this.nearest(x, y)
    if (!hit || Math.abs(hit.signed) > 28) return false
    this.pointer.x = x
    this.pointer.y = y
    this.pointer.has = true
    this.grab = { u: hit.u, touch: true }
    return true
  }

  touchUp() {
    this.release()
  }

  private release() {
    if (this.grab) this.lastPluck = performance.now()
    this.grab = null
    this.sim.release()
  }

  private nearest(x: number, y: number) {
    let best = -1
    let bestD = Infinity
    for (let i = 0; i < this.baseCount; i++) {
      const dx = x - this.baseX[i]
      const dy = y - this.baseY[i]
      const d = dx * dx + dy * dy
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    if (best < 0 || bestD > 90 * 90) return null
    const u = this.baseU[best]
    if (u < 0.015 || u > 0.985) return null
    const signed = (x - this.baseX[best]) * this.baseNX[best] + (y - this.baseY[best]) * this.baseNY[best]
    return { u, signed }
  }

  // ---------------------------------------------------------------- frame

  /** Advance simulation and draw. Returns false when nothing changed (no GPU work). */
  frame(dt: number, f: LineFrame): boolean {
    const shape = f.shape
    this.shape = shape
    this.pluckable = f.pluckable && shape.L > 40 && shape.trimB - shape.trimA > 0.98
    if (!this.pluckable && this.grab) this.release()

    // string: pinned by the pointer while caught
    if (this.grab) {
      const p = pointAt(shape, this.grab.u * shape.L, this.tmp)
      const ox = this.pointer.x - p.x
      const oy = this.pointer.y - p.y
      const signed = ox * p.nx + oy * p.ny
      const along = Math.abs(ox * p.ny - oy * p.nx)
      const limit = this.grab.touch ? this.maxPull * 1.25 : this.maxPull
      if (!this.pointer.has || Math.abs(signed) > limit || along > 70) {
        this.release()
      } else {
        this.sim.pin(this.grab.u, signed)
      }
    }
    const active = this.grab !== null || this.sim.amplitude() > 0.02 || performance.now() - this.lastPluck < 100
    if (active) this.sim.step(dt)
    else if (this.sim.amplitude() > 0) this.sim.reset()

    const color = [
      this.ink[0] + (this.signalColor[0] - this.ink[0]) * f.signal,
      this.ink[1] + (this.signalColor[1] - this.ink[1]) * f.signal,
      this.ink[2] + (this.signalColor[2] - this.ink[2]) * f.signal,
    ]
    const key =
      `${shape.ax.toFixed(2)}|${shape.ay.toFixed(2)}|${shape.L.toFixed(2)}|${shape.roll.toFixed(2)}|` +
      `${shape.trimA.toFixed(4)}|${shape.trimB.toFixed(4)}|${shape.width.toFixed(2)}|${color.join(',')}|` +
      f.segments.map((s) => `${s.x0.toFixed(1)},${s.y0.toFixed(1)},${s.x1.toFixed(1)},${s.y1.toFixed(1)}`).join(';')
    if (!active && !this.forceRender && key === this.lastKey) return false
    this.lastKey = key
    this.forceRender = false
    ;(this.material.uniforms.uColor.value as THREE.Vector3).set(color[0], color[1], color[2])
    this.buildMain(shape, active, dt)
    for (let i = 0; i < this.extras.length; i++) {
      const seg = f.segments[i]
      const r = this.extras[i]
      if (!seg || Math.hypot(seg.x1 - seg.x0, seg.y1 - seg.y0) < 0.5) {
        r.mesh.visible = false
        continue
      }
      r.mesh.visible = true
      this.px[0] = seg.x0
      this.py[0] = seg.y0
      this.px[1] = seg.x1
      this.py[1] = seg.y1
      this.writeRibbon(r, 2, 1, null, 0)
    }
    this.renderer.render(this.scene, this.camera)
    return true
  }

  private buildMain(shape: Shape, active: boolean, dt: number) {
    const a = Math.max(0, Math.min(shape.trimA, shape.trimB))
    const b = Math.min(1, Math.max(shape.trimA, shape.trimB))
    const vel = this.vel
    // the visible range of long, mostly off-screen curves is sampled where it can be seen
    const margin = 8
    let uStart = a
    let uEnd = b
    if (shape.roll <= 0 && shape.L > 0) {
      const u0 = (-margin - shape.ax) / shape.L
      const u1 = (this.W + margin - shape.ax) / shape.L
      uStart = Math.max(a, u0)
      uEnd = Math.min(b, u1)
      if (uEnd < uStart) uEnd = uStart
    } else if (shape.L > 0) {
      const u0 = (-margin - shape.ax) / shape.L
      uStart = Math.max(a, Math.min(u0, 1 - shape.roll / shape.L))
    }
    // a line contracted to a point is drawn as a single round-capped dab
    const n = shape.L < 0.5 || (uEnd - uStart) * shape.L < 0.25 ? 2 : this.samples
    for (let i = 0; i < n; i++) {
      const u = uStart + ((uEnd - uStart) * i) / (n - 1)
      const p = pointAt(shape, u * shape.L, this.tmp)
      this.baseX[i] = p.x
      this.baseY[i] = p.y
      this.baseNX[i] = p.nx
      this.baseNY[i] = p.ny
      this.baseU[i] = u
      const d = active ? this.sim.displacementAt(u) : 0
      this.px[i] = p.x + p.nx * d
      this.py[i] = p.y + p.ny * d
      vel[i] = active ? Math.abs(this.sim.velocityAt(u)) * dt : 0
    }
    this.baseCount = n
    this.writeRibbon(this.main, n, shape.width, vel, 0.12)
  }

  /**
   * Expand a polyline (this.px/py[0..n)) into a ribbon with round caps.
   * blurK converts per-frame motion (px) into extra blur width.
   */
  private writeRibbon(r: Ribbon, n: number, width: number, motion: Float32Array | null, blurK: number) {
    const aa = 1 / this.dpr + 0.5
    const { pos, edge, half, att } = r
    const hw = width / 2
    let tx = 1
    let ty = 0
    const put = (slot: number, x: number, y: number, nx: number, ny: number, capDist: number, h: number, k: number) => {
      const ext = h + aa
      for (let side = 0; side < 2; side++) {
        const sgn = side === 0 ? -1 : 1
        const v = slot * 2 + side
        pos[v * 3] = x + nx * ext * sgn
        pos[v * 3 + 1] = y + ny * ext * sgn
        pos[v * 3 + 2] = 0
        edge[v * 2] = capDist
        edge[v * 2 + 1] = ext * sgn
        half[v] = h
        att[v] = k
      }
    }
    const blurAt = (i: number) => (motion ? Math.min(motion[i] * blurK, 1.25) : 0)

    for (let i = 0; i < n; i++) {
      const i0 = Math.max(0, i - 1)
      const i1 = Math.min(n - 1, i + 1)
      const dx = this.px[i1] - this.px[i0]
      const dy = this.py[i1] - this.py[i0]
      const len = Math.hypot(dx, dy)
      if (len > 1e-4) {
        tx = dx / len
        ty = dy / len
      }
      const b = blurAt(i)
      const h = hw + b / 2
      const k = width / (width + b)
      put(i + 1, this.px[i], this.py[i], -ty, tx, 0, h, k)
      if (i === 0) {
        const ext = h + aa
        put(0, this.px[0] - tx * ext, this.py[0] - ty * ext, -ty, tx, ext, h, k)
      }
      if (i === n - 1) {
        const ext = h + aa
        put(n + 1, this.px[i] + tx * ext, this.py[i] + ty * ext, -ty, tx, ext, h, k)
      }
    }
    r.geo.setDrawRange(0, (n + 1) * 6)
    for (const name of ['position', 'aEdge', 'aHalf', 'aAtt']) {
      const attr = r.geo.getAttribute(name) as THREE.BufferAttribute
      attr.needsUpdate = true
    }
  }

  dispose() {
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose()
    })
    this.material.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}

export function hexToRgb(hex: string): RGB {
  const h = hex.trim().replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const n = parseInt(full.slice(0, 6), 16)
  if (Number.isNaN(n)) return [0.067, 0.067, 0.067]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
