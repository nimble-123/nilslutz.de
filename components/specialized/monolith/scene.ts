import * as THREE from 'three'
import { SLAB, extrudePrism, fractureSlab, type Cell } from './fracture'
import {
  floorFragment,
  glassFragment,
  glassVertex,
  postFragment,
  postVertex,
  roomVertex,
  wallFragment,
} from './shaders'
import { EXHIBIT_COUNT, assembled, exhibitWeight, smooth } from './story'

export type MonolithOptions = {
  reduced: boolean
  mobile: boolean
  displayFont: string
  night: boolean
}

export type Anchor = { x: number; y: number; side: 1 | -1; depth: number }

export type MonolithScene = {
  setProgress: (p: number) => void
  setPointer: (x: number, y: number) => void
  setNight: (night: boolean) => void
  resize: (width: number, height: number) => void
  frame: (dt: number) => void
  anchor: (exhibit: number) => Anchor
  progress: () => number
  dispose: () => void
}

const WALL_Z = -2.3
const WORD_RECT = { x: -3.6, y: 1.12, w: 7.2, h: 1.35 }

const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

function mulberry(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function wordmarkTexture(font: string, mobile: boolean) {
  const w = mobile ? 1536 : 2048
  const h = Math.round((w * WORD_RECT.h) / WORD_RECT.w)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const size = h * 0.82
  ctx.font = `400 ${size}px ${font}`
  // letter-spacing via manual layout for older canvas implementations
  const text = 'Nils Lutz'
  const tracking = size * 0.02
  const widths = [...text].map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (text.length - 1)
  let x = (w - total) / 2
  ctx.textAlign = 'left'
  ctx.filter = `blur(${Math.round(w / 700)}px)`
  ;[...text].forEach((ch, i) => {
    ctx.fillText(ch, x, h * 0.8)
    x += widths[i] + tracking
  })
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  tex.minFilter = THREE.LinearFilter
  tex.generateMipmaps = false
  return { tex, texel: new THREE.Vector2(1.5 / w, 1.5 / h) }
}

type Shard = {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  cell: Cell
  home: THREE.Vector3
  drift: THREE.Vector3
  spin: THREE.Euler
  phase: number
}

export function createMonolithScene(canvas: HTMLCanvasElement, opts: MonolithOptions): MonolithScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !opts.mobile,
    alpha: false,
    powerPreference: 'high-performance',
  })
  const dprCap = opts.mobile ? 1.5 : 2
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
  renderer.autoClear = false

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60)
  const lookAt = new THREE.Vector3(0, 1.25, 0)

  // ————— shared uniforms —————
  const uLight = { value: new THREE.Vector3(2, 3.2, 3) }
  const uNight = { value: opts.night ? 1 : 0 }
  const uTime = { value: 0 }
  const uAssembled = { value: 1 }
  const uBreath = { value: 1 }
  const uRes = { value: new THREE.Vector2(1, 1) }

  // ————— room —————
  const room = new THREE.Scene()
  const word = wordmarkTexture(opts.displayFont, opts.mobile)
  const roomShared = {
    uLight,
    uNight,
    uTime,
    uAssembled,
    uBreath,
    uSlabH: { value: SLAB.height },
    uSlabHalf: { value: new THREE.Vector2(SLAB.width / 2, SLAB.depth / 2) },
    uWallZ: { value: WALL_Z },
  }
  const wallMat = new THREE.ShaderMaterial({
    vertexShader: roomVertex,
    fragmentShader: wallFragment,
    uniforms: {
      ...roomShared,
      uWord: { value: word.tex },
      uWordTexel: { value: word.texel },
      uWordRect: { value: new THREE.Vector4(WORD_RECT.x, WORD_RECT.y, WORD_RECT.w, WORD_RECT.h) },
    },
  })
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(22, 9), wallMat)
  wall.position.set(0, 4.5, WALL_Z)
  room.add(wall)

  const floorMat = new THREE.ShaderMaterial({
    vertexShader: roomVertex,
    fragmentShader: floorFragment,
    uniforms: { ...roomShared },
  })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 14), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, WALL_Z + 7)
  room.add(floor)

  // ————— render targets —————
  const rtOpts = { type: THREE.HalfFloatType, depthBuffer: true }
  const bgRT = new THREE.WebGLRenderTarget(1, 1, {
    ...rtOpts,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
  })
  const compRT = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, samples: opts.mobile ? 0 : 4 })

  // ————— glass —————
  const glass = new THREE.Scene()
  const group = new THREE.Group()
  glass.add(group)

  // fullscreen copy of the room behind the glass
  const quadGeo = new THREE.PlaneGeometry(2, 2)
  const copyMat = new THREE.ShaderMaterial({
    vertexShader: postVertex,
    fragmentShader: /* glsl */ `uniform sampler2D uTex; varying vec2 vUv; void main(){ gl_FragColor = texture2D(uTex, vUv); }`,
    uniforms: { uTex: { value: bgRT.texture } },
    depthTest: false,
    depthWrite: false,
  })
  const copyQuad = new THREE.Mesh(quadGeo, copyMat)
  copyQuad.frustumCulled = false
  copyQuad.renderOrder = -1
  glass.add(copyQuad)

  const cells = fractureSlab()
  const rand = mulberry(11)
  const shards: Shard[] = cells.map((cell) => {
    const local = cell.polygon.map(([x, y]) => [x - cell.centroid[0], y - cell.centroid[1]] as [number, number])
    const { position, normal, edge } = extrudePrism(local, SLAB.depth)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
    geo.setAttribute('aEdge', new THREE.BufferAttribute(edge, 4))
    const mat = new THREE.ShaderMaterial({
      vertexShader: glassVertex,
      fragmentShader: glassFragment,
      uniforms: {
        uBg: { value: bgRT.texture },
        uRes,
        uLight,
        uNight,
        uTime,
        uThickness: { value: cell.isCore ? 0.5 : 0.36 },
        uFocus: { value: 0 },
        uCore: { value: cell.isCore ? 1 : 0 },
        uReveal: { value: 1 },
      },
    })
    const mesh = new THREE.Mesh(geo, mat)
    const home = new THREE.Vector3(cell.centroid[0], cell.centroid[1], 0)
    mesh.position.copy(home)
    group.add(mesh)

    const core = cells[0].centroid
    const dx = cell.centroid[0] - core[0]
    const dy = cell.centroid[1] - core[1]
    const len = Math.hypot(dx, dy) || 1
    const reach = 0.65 + rand() * 0.45
    // shards levitate: those below the core barely sink, so nothing passes through the floor
    const up = dy / len
    const drift = cell.isCore
      ? new THREE.Vector3(0, 0, 0)
      : new THREE.Vector3((dx / len) * reach * 1.25, up * reach * (up < 0 ? 0.16 : 0.3) + 0.06, (rand() - 0.62) * 0.9)
    const spin = new THREE.Euler((rand() - 0.5) * 0.6, (rand() - 0.5) * 0.9, (rand() - 0.5) * 0.45)
    return { mesh, cell, home, drift, spin, phase: rand() * Math.PI * 2 }
  })

  // exhibits: 0 → the core, 1..7 → outer shards chosen clockwise from the top
  const core = shards.find((s) => s.cell.isCore)!
  const outer = shards
    .filter((s) => !s.cell.isCore)
    .map((s) => ({
      s,
      a: Math.atan2(s.cell.centroid[0] - core.cell.centroid[0], s.cell.centroid[1] - core.cell.centroid[1]),
      r: s.cell.area,
    }))
    .sort((a, b) => a.a - b.a)
  const pickOrder = [0.6, 1.5, 2.4, -2.5, -1.6, -0.8, 0.05]
  const taken = new Set<Shard>()
  const exhibits: Shard[] = [core]
  for (const target of pickOrder) {
    let best = outer[0]
    let bestD = Infinity
    for (const o of outer) {
      if (taken.has(o.s)) continue
      const d = Math.abs(Math.atan2(Math.sin(o.a - target), Math.cos(o.a - target))) - o.r * 0.6
      if (d < bestD) {
        bestD = d
        best = o
      }
    }
    taken.add(best.s)
    exhibits.push(best.s)
  }

  // ————— post —————
  const post = new THREE.Scene()
  const postMat = new THREE.ShaderMaterial({
    vertexShader: postVertex,
    fragmentShader: postFragment
      .replace('gl_FragColor = vec4(col, 1.0);', 'col *= uExposure; gl_FragColor = vec4(col, 1.0);')
      .replace('uniform vec2 uRes;', 'uniform vec2 uRes;\n  uniform float uExposure;'),
    uniforms: {
      uScene: { value: compRT.texture },
      uTime,
      uNight,
      uRes,
      uExposure: { value: opts.reduced ? 1 : 0 },
    },
    depthTest: false,
    depthWrite: false,
  })
  const postQuad = new THREE.Mesh(quadGeo, postMat)
  postQuad.frustumCulled = false
  post.add(postQuad)

  // ————— state —————
  let width = 1
  let height = 1
  let aspect = 1
  let targetP = 0
  let p = 0
  let nightTarget = opts.night ? 1 : 0
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
  let clock = 0
  let intro = opts.reduced ? 1 : 0
  const focus = new Array(EXHIBIT_COUNT).fill(0)
  const tmp = new THREE.Vector3()
  const camPos = new THREE.Vector3()
  const lookTarget = new THREE.Vector3()

  function layout(dt: number) {
    const reduced = opts.reduced
    p = targetP
    pointer.x = damp(pointer.x, pointer.tx, 2.2, dt)
    pointer.y = damp(pointer.y, pointer.ty, 2.2, dt)
    uNight.value = reduced ? nightTarget : damp(uNight.value, nightTarget, 2.4, dt)

    const asm = assembled(p)
    const e = 1 - asm
    uAssembled.value = asm
    const breath = reduced ? 1 : 1 + Math.sin(clock * 0.55) * 0.0035
    uBreath.value = breath

    // portrait screens: spread shards vertically, pull the camera back
    const portrait = aspect < 1
    const sx = portrait ? Math.max(0.35, aspect * 0.9) : 1
    const sy = portrait ? 1.7 : 1

    for (let i = 0; i < EXHIBIT_COUNT; i++) focus[i] = e > 0.5 ? exhibitWeight(i, p) : 0

    shards.forEach((s) => {
      const exIdx = exhibits.indexOf(s)
      const f = exIdx >= 0 ? focus[exIdx] : 0
      const sway = reduced ? 0 : Math.sin(clock * 0.35 + s.phase) * 0.035 * e
      const m = s.mesh
      m.position.set(
        s.home.x + s.drift.x * e * sx,
        s.home.y + s.drift.y * e * sy + sway,
        s.home.z + s.drift.z * e + f * (s.cell.isCore ? 0.3 : 0.45)
      )
      const calm = 1 - f * 0.75
      m.rotation.set(
        s.spin.x * e * calm + sway * 0.8,
        s.spin.y * e * calm + (s.cell.isCore ? e * Math.sin(clock * 0.18) * 0.35 : 0),
        s.spin.z * e * calm
      )
      m.scale.setScalar(1)
      const mat = m.material
      mat.uniforms.uFocus.value = damp(mat.uniforms.uFocus.value, f, 5, dt)
    })

    // the whole object breathes and turns gently toward the visitor's hand
    group.scale.set(1, breath, 1)
    group.rotation.y = pointer.x * 0.16 + (reduced ? 0 : Math.sin(clock * 0.12) * 0.025)
    group.rotation.x = pointer.y * 0.02

    // light orbits with the pointer; sweeps in during the page-load
    const introEase = 1 - Math.pow(1 - intro, 3)
    const a = -1.55 + introEase * 1.0 + pointer.x * 0.85
    const lr = 3.6
    uLight.value.set(Math.sin(a) * lr, 3.0 + pointer.y * 0.7, 1.1 + Math.cos(a) * lr * 0.75)
    postMat.uniforms.uExposure.value = smooth(0, 0.5, intro)

    // ————— camera choreography —————
    const fovY = (camera.fov * Math.PI) / 180
    const need = 1.05 / (Math.tan(fovY / 2) * aspect)
    const base = Math.max(6.2, need)
    let dist = base
    let yaw = 0
    let camY = 1.32
    lookTarget.set(0, 1.25, 0)

    const into = smooth(0.08, 0.24, p)
    dist = base - into * (portrait ? 0.0 : 0.35)
    camY += into * 0.18
    // orbit across the exhibits
    const orbit = smooth(0.2, 0.8, p)
    yaw = (orbit - 0.5) * 0.62 * into

    // lean towards the focused exhibit
    let fw = 0
    const lean = new THREE.Vector3()
    focus.forEach((w, i) => {
      if (w > 0) {
        lean.addScaledVector(exhibits[i].mesh.getWorldPosition(tmp), w)
        fw += w
      }
    })
    if (fw > 0) {
      lean.divideScalar(fw)
      lookTarget.lerp(lean, Math.min(1, fw) * (portrait ? 0.55 : 0.32))
    }

    // reassembly → contact framing
    const out = smooth(0.84, 0.98, p)
    dist += out * (portrait ? 0.9 : 0.6)
    camY += out * 0.12
    if (portrait) lookTarget.y += out * -0.55
    else lookTarget.x += out * 0.95
    yaw = yaw * (1 - out) + out * -0.12

    camPos.set(Math.sin(yaw) * dist, camY + pointer.y * 0.06, Math.cos(yaw) * dist)
    camera.position.copy(camPos)
    lookAt.lerp(lookTarget, 1)
    camera.lookAt(lookAt)
  }

  function render() {
    renderer.setRenderTarget(bgRT)
    renderer.clear()
    renderer.render(room, camera)
    renderer.setRenderTarget(compRT)
    renderer.clear()
    renderer.render(glass, camera)
    renderer.setRenderTarget(null)
    renderer.clear()
    renderer.render(post, camera)
  }

  const api: MonolithScene = {
    setProgress(v) {
      targetP = v
    },
    setPointer(x, y) {
      pointer.tx = x
      pointer.ty = y
    },
    setNight(n) {
      nightTarget = n ? 1 : 0
    },
    resize(w, h) {
      width = Math.max(1, w)
      height = Math.max(1, h)
      aspect = width / height
      renderer.setSize(width, height, false)
      const buf = renderer.getDrawingBufferSize(new THREE.Vector2())
      uRes.value.copy(buf)
      bgRT.setSize(buf.x, buf.y)
      compRT.setSize(buf.x, buf.y)
      // portrait: set the carved wordmark smaller so it stays readable (and still behind the glass)
      const ws = aspect < 1 ? 0.5 : 1
      wallMat.uniforms.uWordRect.value.set(
        WORD_RECT.x * ws,
        aspect < 1 ? 1.5 : WORD_RECT.y,
        WORD_RECT.w * ws,
        WORD_RECT.h * ws
      )
      camera.aspect = aspect
      camera.fov = aspect < 1 ? 40 : 34
      camera.updateProjectionMatrix()
    },
    frame(dt) {
      if (!opts.reduced) {
        clock += dt
        uTime.value = clock
      }
      if (!opts.reduced) intro = Math.min(1, intro + Math.min(dt, 0.25) / 3.2)
      layout(Math.min(dt, 0.1))
      render()
    },
    anchor(i) {
      const s = exhibits[i]
      s.mesh.getWorldPosition(tmp)
      const depth = tmp.distanceTo(camera.position)
      tmp.project(camera)
      const side: 1 | -1 = tmp.x >= 0 ? 1 : -1
      return {
        x: (tmp.x * 0.5 + 0.5) * width,
        y: (-tmp.y * 0.5 + 0.5) * height,
        side,
        depth,
      }
    },
    progress: () => p,
    dispose() {
      shards.forEach((s) => {
        s.mesh.geometry.dispose()
        s.mesh.material.dispose()
      })
      wall.geometry.dispose()
      floor.geometry.dispose()
      quadGeo.dispose()
      wallMat.dispose()
      floorMat.dispose()
      copyMat.dispose()
      postMat.dispose()
      word.tex.dispose()
      bgRT.dispose()
      compRT.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
  return api
}
