import * as THREE from 'three'
import { fragmentShader, PULSE_COUNT, vertexShader } from './shaders'
import {
  CAMERA_FOV,
  CAMERA_Z,
  coreLayout,
  ORBIT_SPEED,
  ORBIT_TILT,
  satellitePosition,
  screenToWorld,
  topologyLayout,
  worldSize,
  type CoreLayout,
  type TopologyLayout,
  type Vec3,
  type World,
} from '@/lib/signal-layout'

export type WordBox = {
  text: string
  /** left / baseline in page coordinates (scrollY already added) */
  left: number
  baseline: number
  font: string
  letterSpacing: string
}

export type EventMeshOptions = {
  count: number
  dpr: number
  producers: number
  consumers: number
}

/** Scroll-driven state, tweened by GSAP from outside. */
export type MeshState = {
  converge: number
  morph: number
  heroShift: number
  starDrift: number
}

const LANES = 13

function rand(seed: number) {
  // mulberry32
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class EventMesh {
  readonly renderer: THREE.WebGLRenderer
  readonly camera: THREE.PerspectiveCamera
  readonly scene: THREE.Scene
  readonly state: MeshState = { converge: 0, morph: 0, heroShift: 0, starDrift: 0 }

  private geometry: THREE.BufferGeometry
  private material: THREE.ShaderMaterial
  private points: THREE.Points
  private uniforms: Record<string, THREE.IUniform>
  private count: number
  private producers: number
  private consumers: number
  private world: World = { w: 1, h: 1, vertical: false }
  private viewW = 1
  private viewH = 1
  private core: CoreLayout = { center: [0, 0, 0], radius: 1, ringRadius: 2 }
  private topo: TopologyLayout = { producers: [], broker: [0, 0], consumers: [] }
  private pointerTarget = new THREE.Vector3(0, 0, 0)
  private pointer = new THREE.Vector3(0, 0, 0)
  private pointerVel = new THREE.Vector2()
  private pulseIndex = 0
  private words: WordBox[] = []
  private tmp = new THREE.Vector3()

  constructor(canvas: HTMLCanvasElement, opts: EventMeshOptions) {
    this.count = opts.count
    this.producers = opts.producers
    this.consumers = opts.consumers

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(opts.dpr)
    this.renderer.setClearColor(0x05070c, 1)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 60)
    this.camera.position.set(0, 0, CAMERA_Z)

    this.uniforms = {
      uTime: { value: 0 },
      uConverge: { value: 0 },
      uMorph: { value: 0 },
      uPixelRatio: { value: opts.dpr },
      uSize: { value: 2.2 },
      uHeroShift: { value: 0 },
      uStarDrift: { value: 0 },
      uWorld: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: this.pointer },
      uPointerVel: { value: this.pointerVel },
      uPulses: { value: Array.from({ length: PULSE_COUNT }, () => new THREE.Vector4(0, 0, -99, 0)) },
      uCoreCenter: { value: new THREE.Vector3() },
      uCoreR: { value: 1 },
      uRingR: { value: 2 },
      uTilt: { value: ORBIT_TILT },
      uOrbit: { value: ORBIT_SPEED },
    }

    this.geometry = new THREE.BufferGeometry()
    this.buildStaticAttributes()

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })

    this.points = new THREE.Points(this.geometry, this.material)
    this.points.frustumCulled = false
    this.scene.add(this.points)
  }

  /** Attributes that never change with the viewport. */
  private buildStaticAttributes() {
    const n = this.count
    const r = rand(1337)
    const flow = new Float32Array(n * 3)
    const core = new Float32Array(n * 3)
    const coreMeta = new Float32Array(n * 2)
    const star = new Float32Array(n * 3)
    const rnd = new Float32Array(n * 4)
    const textFlag = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      // topic channels: quantised lanes with a little spread
      const lane = Math.floor(r() * LANES)
      flow[i * 3] = r()
      flow[i * 3 + 1] = (lane + 0.5) / LANES + (r() - 0.5) * 0.012
      flow[i * 3 + 2] = (r() - 0.5) * 0.6

      // 76% of particles form the wordmark, 24% keep flowing as ambient events
      textFlag[i] = r() < 0.76 ? 1 : 0

      // core roles: 55% sphere, 20% satellites, 15% ring dust, 10% API traffic
      const f = r()
      let kind = 0
      let meta = 0
      if (f < 0.55) kind = 0
      else if (f < 0.75) {
        kind = 1
        meta = Math.floor(r() * 5)
      } else if (f < 0.9) {
        kind = 2
        meta = r()
      } else {
        kind = 3
        meta = Math.floor(r() * 5)
      }
      // uniform direction (sphere surface); satellites/traffic use it as a local offset
      const u = r() * 2 - 1
      const th = r() * Math.PI * 2
      const sq = Math.sqrt(1 - u * u)
      const rad = kind === 0 ? 1 : kind === 1 ? Math.cbrt(r()) : r()
      core[i * 3] = sq * Math.cos(th) * rad
      core[i * 3 + 1] = u * rad
      core[i * 3 + 2] = sq * Math.sin(th) * rad
      if (kind === 2) {
        core[i * 3] = r() * 2 - 1
        core[i * 3 + 1] = r() * 2 - 1
      }
      coreMeta[i * 2] = kind
      coreMeta[i * 2 + 1] = meta

      star[i * 3] = r() * 2 - 1
      star[i * 3 + 1] = r() * 2 - 1
      star[i * 3 + 2] = -r() * 9 + 1.5

      rnd[i * 4] = r()
      rnd[i * 4 + 1] = r()
      rnd[i * 4 + 2] = r()
      rnd[i * 4 + 3] = r()
    }

    const g = this.geometry
    g.setAttribute('position', new THREE.BufferAttribute(flow, 3))
    g.setAttribute('aTextFlag', new THREE.BufferAttribute(textFlag, 1))
    g.setAttribute('aCore', new THREE.BufferAttribute(core, 3))
    g.setAttribute('aCoreMeta', new THREE.BufferAttribute(coreMeta, 2))
    g.setAttribute('aStar', new THREE.BufferAttribute(star, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 4))
    g.setAttribute('aText', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aEdgeA', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aEdgeB', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    g.setAttribute('aEdgeMeta', new THREE.BufferAttribute(new Float32Array(n * 2), 2))
  }

  resize(viewW: number, viewH: number) {
    this.viewW = viewW
    this.viewH = viewH
    this.renderer.setSize(viewW, viewH, false)
    this.camera.aspect = viewW / viewH
    this.camera.updateProjectionMatrix()
    this.world = worldSize(viewW, viewH)
    ;(this.uniforms.uWorld.value as THREE.Vector2).set(this.world.w, this.world.h)
    this.uniforms.uSize.value = this.world.vertical ? 2.7 : 2.45

    this.core = coreLayout(this.world)
    ;(this.uniforms.uCoreCenter.value as THREE.Vector3).set(...this.core.center)
    this.uniforms.uCoreR.value = this.core.radius
    this.uniforms.uRingR.value = this.core.ringRadius

    this.topo = topologyLayout(this.world, this.producers, this.consumers)
    this.buildTopology()
    if (this.words.length) this.sampleText(this.words)
  }

  private buildTopology() {
    const n = this.count
    const r = rand(99)
    const A = this.geometry.getAttribute('aEdgeA') as THREE.BufferAttribute
    const B = this.geometry.getAttribute('aEdgeB') as THREE.BufferAttribute
    const M = this.geometry.getAttribute('aEdgeMeta') as THREE.BufferAttribute
    const { producers, broker, consumers } = this.topo
    const nodes: { p: [number, number]; broker: number }[] = [
      ...producers.map((p) => ({ p, broker: 0 })),
      { p: broker, broker: 1 },
      ...consumers.map((p) => ({ p, broker: 0 })),
    ]
    const edges: { a: [number, number]; b: [number, number] }[] = [
      ...producers.map((p) => ({ a: p, b: broker })),
      ...consumers.map((p) => ({ a: broker, b: p })),
    ]
    for (let i = 0; i < n; i++) {
      const f = r()
      if (f < 0.32) {
        // node clusters (broker gets a bigger share)
        const useBroker = r() < 0.3
        const node = useBroker ? nodes[producers.length] : nodes[Math.floor(r() * nodes.length)]
        A.setXYZ(i, node.p[0], node.p[1], 0)
        B.setXYZ(i, node.p[0], node.p[1], 0)
        M.setXY(i, 0, node.broker)
      } else {
        const e = edges[Math.floor(r() * edges.length)]
        A.setXYZ(i, e.a[0], e.a[1], 0)
        B.setXYZ(i, e.b[0], e.b[1], 0)
        M.setXY(i, 1, (r() - 0.5) * 2)
      }
    }
    A.needsUpdate = true
    B.needsUpdate = true
    M.needsUpdate = true
  }

  /** Sample the DOM wordmark (drawn with the same font, at the same place) into particle targets. */
  sampleText(words: WordBox[]) {
    this.words = words
    const scale = this.world.vertical ? 0.75 : 0.5
    const cw = Math.max(1, Math.round(this.viewW * scale))
    const ch = Math.max(1, Math.round(this.viewH * scale))
    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.scale(scale, scale)
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'alphabetic'
    for (const w of words) {
      ctx.font = w.font
      try {
        ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = w.letterSpacing
      } catch {
        /* older browsers */
      }
      ctx.fillText(w.text, w.left, w.baseline)
    }
    const data = ctx.getImageData(0, 0, cw, ch).data
    const pts: number[] = []
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        if (data[(y * cw + x) * 4 + 3] > 140) pts.push(x, y)
      }
    }
    const T = this.geometry.getAttribute('aText') as THREE.BufferAttribute
    const flag = this.geometry.getAttribute('aTextFlag') as THREE.BufferAttribute
    const r = rand(7)
    const samples = pts.length / 2
    for (let i = 0; i < this.count; i++) {
      if (!samples || flag.getX(i) < 0.5) {
        T.setXYZ(i, 0, 0, 0)
        continue
      }
      const k = Math.floor(r() * samples)
      const px = (pts[k * 2] + r()) / scale
      const py = (pts[k * 2 + 1] + r()) / scale
      const [wx, wy] = screenToWorld(px, py, this.viewW, this.viewH, this.world)
      T.setXYZ(i, wx, wy, (r() - 0.5) * 0.08)
    }
    T.needsUpdate = true
  }

  /** Pointer in CSS px. strength 0 releases the broker. */
  setPointer(px: number, py: number, strength = 1) {
    const [x, y] = screenToWorld(px, py, this.viewW, this.viewH, this.world)
    this.pointerTarget.set(x, y, strength)
  }

  releasePointer() {
    this.pointerTarget.z = 0
  }

  /** Publish a pulse from a screen point (CSS px). */
  pulse(px: number, py: number, strength = 1) {
    const [x, y] = screenToWorld(px, py, this.viewW, this.viewH, this.world)
    this.pulseWorld(x, y, strength)
  }

  pulseWorld(x: number, y: number, strength = 1) {
    const arr = this.uniforms.uPulses.value as THREE.Vector4[]
    arr[this.pulseIndex % PULSE_COUNT].set(x, y, this.uniforms.uTime.value as number, strength)
    this.pulseIndex++
  }

  /** Current world → screen for anything in the core scene (satellites can leave z = 0). */
  project(v: Vec3): [number, number] {
    this.tmp.set(v[0], v[1], v[2]).project(this.camera)
    return [(this.tmp.x * 0.5 + 0.5) * this.viewW, (-this.tmp.y * 0.5 + 0.5) * this.viewH]
  }

  satelliteScreen(i: number): [number, number] {
    return this.project(satellitePosition(i, this.uniforms.uTime.value as number, this.core))
  }

  coreScreen(): { x: number; y: number; r: number } {
    const [x, y] = this.project(this.core.center)
    return { x, y, r: (this.core.radius / this.world.h) * this.viewH }
  }

  topologyScreen(): TopologyLayout {
    const s = ([x, y]: [number, number]) => this.project([x, y, 0])
    return {
      producers: this.topo.producers.map(s),
      broker: s(this.topo.broker),
      consumers: this.topo.consumers.map(s),
    }
  }

  get brokerWorld(): [number, number] {
    return this.topo.broker
  }

  get isVertical() {
    return this.world.vertical
  }

  get time() {
    return this.uniforms.uTime.value as number
  }

  render(time: number, dt: number) {
    const u = this.uniforms
    u.uTime.value = time
    u.uConverge.value = this.state.converge
    u.uMorph.value = this.state.morph
    u.uHeroShift.value = (this.state.heroShift / this.viewH) * this.world.h
    u.uStarDrift.value = this.state.starDrift

    // Smooth the broker toward the pointer; keep a decaying velocity for drag
    const k = 1 - Math.exp(-dt * 9)
    const px = this.pointer.x
    const py = this.pointer.y
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * k
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * k
    this.pointer.z += (this.pointerTarget.z - this.pointer.z) * (1 - Math.exp(-dt * 4))
    if (dt > 0) {
      const vx = (this.pointer.x - px) / dt
      const vy = (this.pointer.y - py) / dt
      this.pointerVel.x += (Math.max(-2, Math.min(2, vx * 0.12)) - this.pointerVel.x) * 0.2
      this.pointerVel.y += (Math.max(-2, Math.min(2, vy * 0.12)) - this.pointerVel.y) * 0.2
    }

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
