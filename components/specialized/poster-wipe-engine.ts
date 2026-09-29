import * as THREE from 'three'

/**
 * POSTER WIPE
 * Paints the background colour of every poster in the horizontal sequence. Instead of hard
 * vertical seams, each boundary between two posters is a liquid, noise-displaced edge that
 * swells with scroll velocity and carries a thin misregistered signal line — a shader wipe
 * that happens as you scrub from poster to poster.
 */

const MAX_PANELS = 16

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const fragment = /* glsl */ `
precision highp float;
#define MAX_PANELS ${MAX_PANELS}
uniform vec3 uColors[MAX_PANELS];
uniform int uCount;
uniform vec2 uSize;        // css px
uniform float uOffset;     // track translate in css px (positive = scrolled)
uniform float uPanelW;     // css px
uniform float uVel;        // 0..1
uniform float uTime;
uniform vec3 uSignal;
varying vec2 vUv;

// value noise
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

vec3 panelColor(int idx) {
  vec3 c = uColors[0];
  for (int i = 0; i < MAX_PANELS; i++) {
    if (i == idx) c = uColors[i];
  }
  return c;
}

void main() {
  vec2 px = vec2(vUv.x * uSize.x, (1.0 - vUv.y) * uSize.y);
  float trackX = px.x + uOffset;

  // edge displacement: calm ripple at rest, a viscous bulge while scrubbing
  float y = px.y / uSize.y;
  float amp = mix(10.0, 90.0, uVel);
  float wave = (fbm(vec2(y * 3.0, uTime * 0.25 + floor(trackX / uPanelW + 0.5) * 7.0)) - 0.5) * 2.0;
  wave += sin(y * 6.2831 * 1.5 + uTime * 1.2) * 0.35 * uVel;
  float displaced = trackX + wave * amp;

  float fi = displaced / uPanelW;
  int idx = int(clamp(floor(fi), 0.0, float(uCount - 1)));
  vec3 col = panelColor(idx);

  // misregistered signal hairline riding the wipe edge
  float edgeDist = (fract(fi + 0.5) - 0.5) * uPanelW;   // signed px to nearest boundary
  float lineOffset = 6.0 + 18.0 * uVel;
  float line = smoothstep(1.6, 0.0, abs(edgeDist - lineOffset)) * step(0.5, fi) * step(fi, float(uCount) - 0.5);
  col = mix(col, uSignal, line * 0.9);

  gl_FragColor = vec4(col, 1.0);
}
`

export class PosterWipeEngine {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private material: THREE.ShaderMaterial
  private time = 0

  constructor(canvas: HTMLCanvasElement, dpr: number) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'default' })
    this.renderer.setPixelRatio(dpr)
    const colors = Array.from({ length: MAX_PANELS }, () => new THREE.Color('#f2f0ea'))
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uColors: { value: colors },
        uCount: { value: 1 },
        uSize: { value: new THREE.Vector2(1, 1) },
        uOffset: { value: 0 },
        uPanelW: { value: 1 },
        uVel: { value: 0 },
        uTime: { value: 0 },
        uSignal: { value: new THREE.Color('#ff4a1c') },
      },
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material)
    mesh.frustumCulled = false
    this.scene.add(mesh)
  }

  setPanels(colors: string[], signal: string) {
    const u = this.material.uniforms
    colors.slice(0, MAX_PANELS).forEach((c, i) => (u.uColors.value[i] as THREE.Color).set(c))
    u.uCount.value = Math.min(colors.length, MAX_PANELS)
    u.uSignal.value.set(signal)
  }

  resize(width: number, height: number, panelWidth: number) {
    this.renderer.setSize(width, height, false)
    this.material.uniforms.uSize.value.set(width, height)
    this.material.uniforms.uPanelW.value = panelWidth
  }

  render(dt: number, offset: number, vel: number) {
    this.time += dt
    const u = this.material.uniforms
    u.uTime.value = this.time
    u.uOffset.value = offset
    u.uVel.value = vel
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.material.dispose()
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.geometry.dispose()
    })
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }
}
