import * as THREE from 'three'

/**
 * LIQUID TYPE
 * The wordmark is drawn into a 2D canvas (white glyph mask), uploaded as a texture and shown
 * through a full-bleed shader plane. A low-res ping-pong buffer holds a damped spring field:
 *   rg = displacement (uv units), ba = velocity.
 * Each step the field self-advects (viscous smear), diffuses, is pulled back to rest by a spring
 * (letters spring back with a small overshoot) and receives splats from the pointer / finger.
 * The display pass samples the glyph mask along the displacement (motion-smear taps) and adds
 * a chromatic split: the leading/trailing edges of moving ink print in the signal colour.
 */

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const simFragment = /* glsl */ `
precision highp float;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform vec2 uPointer;
uniform vec2 uPrevPointer;
uniform vec2 uPointerVel;
uniform float uAspect;
uniform float uRadius;
uniform float uStiffness;
uniform float uDamping;
uniform float uAdvect;
uniform float uDiffuse;
uniform float uScroll;
uniform float uTime;
varying vec2 vUv;

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  vec4 s = texture2D(uState, vUv);
  // self-advection: the field is carried along its own velocity -> viscous, fluid-ish trails
  vec2 back = vUv - s.ba * uAdvect;
  vec4 a = texture2D(uState, back);
  vec4 n = texture2D(uState, back + vec2(uTexel.x, 0.0))
         + texture2D(uState, back - vec2(uTexel.x, 0.0))
         + texture2D(uState, back + vec2(0.0, uTexel.y))
         + texture2D(uState, back - vec2(0.0, uTexel.y));
  a = mix(a, n * 0.25, uDiffuse);

  vec2 disp = a.rg;
  vec2 vel = a.ba;

  // spring back to rest
  vel -= disp * uStiffness;
  vel *= uDamping;

  // pointer splat along the segment travelled since the last frame (no gaps on fast strokes)
  vec2 p = vUv; p.x *= uAspect;
  vec2 pa = uPrevPointer; pa.x *= uAspect;
  vec2 pb = uPointer; pb.x *= uAspect;
  float d = segDist(p, pa, pb);
  float f = exp(-(d * d) / (uRadius * uRadius));
  vel += uPointerVel * f;

  // scroll velocity: a vertical, wavy drag through the whole sheet
  float wave = 0.6 + 0.4 * sin(vUv.x * 9.0 + uTime * 1.3);
  vel.y += uScroll * wave * 0.00018;

  disp += vel;

  // keep the sheet edges pinned so nothing tears at the border
  vec2 edge = smoothstep(0.0, 0.04, vUv) * smoothstep(0.0, 0.04, 1.0 - vUv);
  disp *= edge.x * edge.y;

  gl_FragColor = vec4(clamp(disp, -0.25, 0.25), clamp(vel, -0.05, 0.05));
}
`

const displayFragment = /* glsl */ `
precision highp float;
uniform sampler2D uText;
uniform sampler2D uState;
uniform vec3 uInk;
uniform vec3 uSignal;
uniform float uSplit;
uniform float uReveal;
varying vec2 vUv;

float mask(vec2 uv) {
  return texture2D(uText, uv).r;
}

void main() {
  vec4 s = texture2D(uState, vUv);
  vec2 disp = s.rg;
  float speed = length(s.ba);

  // viscous smear: average taps along the displacement vector
  float m = 0.0;
  m += mask(vUv - disp);
  m += mask(vUv - disp * 0.82);
  m += mask(vUv - disp * 0.64);
  m += mask(vUv - disp * 1.12);
  m *= 0.25;
  m = smoothstep(0.08, 0.92, m);

  // chromatic split along the flow direction, stronger while moving
  vec2 sp = disp * uSplit + s.ba * 6.0;
  float lead = mask(vUv - disp - sp);
  float trail = mask(vUv - disp * 0.7 + sp * 0.6);
  float fringe = clamp(max(lead, trail) - m, 0.0, 1.0) * clamp(length(disp) * 90.0 + speed * 400.0, 0.0, 1.0);

  vec3 col = uInk * m + uSignal * fringe * (1.0 - m);
  float alpha = m + fringe * (1.0 - m);
  // THREE.Color uniforms are linear: convert the straight colour to the output space, then premultiply
  vec3 straight = col / max(alpha, 1e-4);
  vec4 outCol = linearToOutputTexel(vec4(straight, 1.0));
  gl_FragColor = vec4(outCol.rgb * alpha, alpha) * uReveal;
}
`

export type LiquidOptions = {
  coarse: boolean
  dpr: number
  ink: string
  signal: string
}

export class LiquidTypeEngine {
  private renderer: THREE.WebGLRenderer
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad: THREE.Mesh
  private simMaterial: THREE.ShaderMaterial
  private displayMaterial: THREE.ShaderMaterial
  private targets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget]
  private textTexture: THREE.CanvasTexture
  private simScale: number
  private width = 1
  private height = 1
  private pointer = new THREE.Vector2(-10, -10)
  private prevPointer = new THREE.Vector2(-10, -10)
  private pendingVel = new THREE.Vector2()
  private hasPointer = false
  private time = 0
  private lastInput = 0
  reveal = 0

  constructor(
    private canvas: HTMLCanvasElement,
    textCanvas: HTMLCanvasElement,
    private opts: LiquidOptions
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(opts.dpr)
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.autoClear = true

    // lower sim resolution on phones
    this.simScale = opts.coarse ? 0.2 : 0.25

    const rtOpts = {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    }
    this.targets = [new THREE.WebGLRenderTarget(4, 4, rtOpts), new THREE.WebGLRenderTarget(4, 4, rtOpts)]

    this.textTexture = new THREE.CanvasTexture(textCanvas)
    this.textTexture.minFilter = THREE.LinearFilter
    this.textTexture.magFilter = THREE.LinearFilter
    this.textTexture.generateMipmaps = false

    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: simFragment,
      uniforms: {
        uState: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uPointer: { value: this.pointer },
        uPrevPointer: { value: this.prevPointer },
        uPointerVel: { value: new THREE.Vector2() },
        uAspect: { value: 1 },
        uRadius: { value: opts.coarse ? 0.09 : 0.065 },
        uStiffness: { value: 0.022 },
        uDamping: { value: 0.925 },
        uAdvect: { value: 0.9 },
        uDiffuse: { value: 0.22 },
        uScroll: { value: 0 },
        uTime: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    })

    this.displayMaterial = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: displayFragment,
      uniforms: {
        uText: { value: this.textTexture },
        uState: { value: null },
        uInk: { value: new THREE.Color(opts.ink) },
        uSignal: { value: new THREE.Color(opts.signal) },
        uSplit: { value: 0.55 },
        uReveal: { value: 0 },
      },
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
    })

    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simMaterial)
    this.quad.frustumCulled = false
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    this.renderer.setSize(this.width, this.height, false)
    const sw = Math.max(32, Math.round(this.width * this.simScale))
    const sh = Math.max(32, Math.round(this.height * this.simScale))
    this.targets.forEach((t) => t.setSize(sw, sh))
    // clear the field
    this.targets.forEach((t) => {
      this.renderer.setRenderTarget(t)
      this.renderer.clear()
    })
    this.renderer.setRenderTarget(null)
    this.simMaterial.uniforms.uTexel.value.set(1 / sw, 1 / sh)
    this.simMaterial.uniforms.uAspect.value = this.width / this.height
    this.lastInput = performance.now()
  }

  updateText() {
    this.textTexture.needsUpdate = true
    this.lastInput = performance.now()
  }

  setColors(ink: string, signal: string) {
    this.displayMaterial.uniforms.uInk.value.set(ink)
    this.displayMaterial.uniforms.uSignal.value.set(signal)
    this.lastInput = performance.now()
  }

  /** Pointer in CSS px relative to the canvas. */
  move(x: number, y: number) {
    const u = x / this.width
    const v = 1 - y / this.height
    if (!this.hasPointer) {
      this.pointer.set(u, v)
      this.prevPointer.set(u, v)
      this.hasPointer = true
      return
    }
    this.pendingVel.x += u - this.pointer.x
    this.pendingVel.y += v - this.pointer.y
    this.pointer.set(u, v)
    this.lastInput = performance.now()
  }

  leave() {
    this.hasPointer = false
  }

  /** Is anything still moving? Lets the caller stop rendering a sheet at rest. */
  isAwake(now: number) {
    return now - this.lastInput < 2600
  }

  wake() {
    this.lastInput = performance.now()
  }

  render(dt: number, scrollVelocity: number) {
    const steps = Math.min(3, Math.max(1, Math.round(dt * 60)))
    // phones: narrower sheet in uv space and scroll-by-swipe, so both couplings are gentler
    const gain = this.opts.coarse ? 0.38 : 0.42
    const vel = this.pendingVel.clone().multiplyScalar(gain / steps)
    const maxV = 0.02
    if (vel.length() > maxV) vel.setLength(maxV)
    this.pendingVel.set(0, 0)

    const u = this.simMaterial.uniforms
    u.uScroll.value = Math.max(-80, Math.min(80, scrollVelocity)) * (this.opts.coarse ? 0.15 : 1)
    if (Math.abs(scrollVelocity) > 0.5) this.lastInput = performance.now()

    this.quad.material = this.simMaterial
    for (let i = 0; i < steps; i++) {
      this.time += 1 / 60
      u.uTime.value = this.time
      u.uState.value = this.targets[0].texture
      u.uPointerVel.value.copy(i === 0 ? vel : vel.clone().multiplyScalar(0.5))
      this.renderer.setRenderTarget(this.targets[1])
      this.renderer.render(this.quad, this.camera)
      this.targets.reverse()
      u.uPrevPointer.value.copy(this.pointer)
    }

    this.quad.material = this.displayMaterial
    this.displayMaterial.uniforms.uState.value = this.targets[0].texture
    this.displayMaterial.uniforms.uReveal.value = this.reveal
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.quad, this.camera)
  }

  dispose() {
    this.targets.forEach((t) => t.dispose())
    this.textTexture.dispose()
    this.simMaterial.dispose()
    this.displayMaterial.dispose()
    this.quad.geometry.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
