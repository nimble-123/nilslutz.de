'use client'

import * as THREE from 'three'
import { NOISE_GLSL, CONTOUR_GLSL } from '@/lib/glsl'
import { readPalette, isCoarsePointer } from './palette'

/**
 * A geological block diagram: four strata, each a displaced box whose top and
 * bottom follow wavy boundary surfaces. The top of the column is the same
 * contour-lined terrain as the hero, so looking straight down it reads as a map
 * sheet; tilting the camera turns it into a cross-section.
 */

const SURFACE_GLSL = /* glsl */ `
float surf(vec2 xz, float base, float amp, float seed, float warp) {
  vec2 p = xz * 1.2 + vec2(seed, seed * 0.7);
  if (warp > 0.5) {
    vec2 q = vec2(fbm3(p * 0.9), fbm3(p * 0.9 + vec2(5.2, 1.3)));
    return base + amp * fbm4(p + q * 1.1);
  }
  return base + amp * fbm3(p * 0.8);
}
`

const VERT = /* glsl */ `
uniform float uTopBase;
uniform float uTopAmp;
uniform float uTopSeed;
uniform float uTopWarp;
uniform float uBotBase;
uniform float uBotAmp;
uniform float uBotSeed;
uniform float uOffset;

varying vec3 vPos;
varying vec3 vWorld;
varying vec3 vN;
varying float vT;

${NOISE_GLSL}
${SURFACE_GLSL}

void main() {
  vec3 p = position;
  float top = surf(p.xz, uTopBase, uTopAmp, uTopSeed, uTopWarp);
  float bot = uBotAmp > 0.0 ? surf(p.xz, uBotBase, uBotAmp, uBotSeed, 0.0) : uBotBase;
  float t = p.y + 0.5;
  p.y = mix(bot, top, t);
  vT = t;
  vN = normal;
  vPos = p;
  vec4 world = modelMatrix * vec4(p + vec3(0.0, uOffset, 0.0), 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

const FRAG = /* glsl */ `
precision highp float;

uniform float uIdx;
uniform float uFocus;
uniform float uLevels;
uniform float uDark;
uniform vec3 uColor;
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uContour;
uniform vec3 uPatternInk;
uniform float uTopBase;
uniform float uTopAmp;
uniform float uTopSeed;
uniform float uTopWarp;

varying vec3 vPos;
varying vec3 vWorld;
varying vec3 vN;
varying float vT;

${NOISE_GLSL}
${CONTOUR_GLSL}
${SURFACE_GLSL}

float aaLine(float d, float px) {
  // d is a distance measured in "pixels"
  return 1.0 - smoothstep(px * 0.5 - 0.5, px * 0.5 + 0.75, d);
}

float dots(vec2 uv, float r) {
  vec2 id = floor(uv);
  vec2 c = fract(uv) - 0.5 - hash22(id) * 0.2;
  float d = length(c);
  float fw = fwidth(uv.x) * 0.9;
  return 1.0 - smoothstep(r - fw, r + fw, d);
}

float pattern(vec2 uv) {
  if (uIdx < 0.5) {
    // laminae: fine, slightly wavy bedding planes
    return isoLine(uv.y * 58.0 + 0.35 * gnoise(vec2(uv.x * 3.0, uv.y * 12.0)), 0.9) * 0.55;
  } else if (uIdx < 1.5) {
    // stipple: sandstone dots
    return dots(uv * 30.0, 0.14) * 0.75;
  } else if (uIdx < 2.5) {
    // shale: diagonal hatching over bedding
    return max(isoLine((uv.x + uv.y) * 24.0, 0.9) * 0.55, isoLine(uv.y * 12.0, 0.9) * 0.3);
  }
  // bedrock: limestone blocks
  float row = floor(uv.y * 10.0);
  float h = isoLine(uv.y * 10.0, 1.0);
  float v = isoLine(uv.x * 5.0 + row * 0.5, 1.0);
  return max(h, v) * 0.6;
}

void main() {
  vec3 L = normalize(vec3(-0.45, 0.8, 0.35));
  vec3 col;

  if (vN.y > 0.5) {
    // top surface: printed as a contour map. Height + normal are evaluated per pixel so the
    // relief stays smooth however close the camera gets (vertex heights would facet).
    float hC = surf(vPos.xz, uTopBase, uTopAmp, uTopSeed, uTopWarp);
    const float E = 0.004;
    float hX = surf(vPos.xz + vec2(E, 0.0), uTopBase, uTopAmp, uTopSeed, uTopWarp);
    float hZ = surf(vPos.xz + vec2(0.0, E), uTopBase, uTopAmp, uTopSeed, uTopWarp);
    vec3 n = normalize(vec3(-(hX - hC) / E, 1.0, -(hZ - hC) / E));
    float sh = clamp(dot(n, L), 0.0, 1.0);
    col = mix(uPaper, uColor, uIdx < 0.5 ? 0.16 : 0.38);
    col *= mix(0.84, 1.04, sh);
    float lv = hC * uLevels;
    col = mix(col, uContour, isoLine(lv, 1.0) * 0.6);
    col = mix(col, mix(uContour, uInk, 0.3), isoLine(lv, 2.0) * isIndexContour(lv, 5.0) * 0.9);
    // neatline around the sheet
    float e = (1.0 - max(abs(vPos.x), abs(vPos.z)));
    col = mix(col, uInk, aaLine(e / max(fwidth(e), 1e-5), 1.4) * 0.9);
  } else if (vN.y < -0.5) {
    col = uColor * 0.72;
  } else {
    // cut face: the stratum's lithology pattern
    bool xFace = abs(vN.x) > 0.5;
    float u = xFace ? vPos.z : vPos.x;
    float faceShade = xFace ? 0.9 : 1.0;
    col = uColor * faceShade;
    col = mix(col, uPatternInk, pattern(vec2(u, vPos.y)));
    // stratum boundaries + block edges in ink
    float dt = min(vT, 1.0 - vT) / max(fwidth(vT), 1e-5);
    float du = (1.0 - abs(u)) / max(fwidth(u), 1e-5);
    col = mix(col, uInk, aaLine(dt, 1.5) * 0.95);
    col = mix(col, uInk, aaLine(du, 1.3) * 0.9);
  }

  // unfocused strata recede into the paper
  col = mix(mix(uPaper, col, 0.32), col, uFocus);
  gl_FragColor = vec4(col, 1.0);
}
`

type Layer = {
  topBase: number
  topAmp: number
  topSeed: number
  topWarp: number
  botBase: number
  botAmp: number
  botSeed: number
}

const LAYERS: Layer[] = [
  { topBase: 0.62, topAmp: 0.34, topSeed: 1.3, topWarp: 1, botBase: 0.18, botAmp: 0.1, botSeed: 4.1 },
  { topBase: 0.18, topAmp: 0.1, topSeed: 4.1, topWarp: 0, botBase: -0.24, botAmp: 0.12, botSeed: 7.7 },
  { topBase: -0.24, topAmp: 0.12, topSeed: 7.7, topWarp: 0, botBase: -0.62, botAmp: 0.08, botSeed: 2.9 },
  { topBase: -0.62, topAmp: 0.08, topSeed: 2.9, topWarp: 0, botBase: -1.0, botAmp: 0, botSeed: 0 },
]

const LIGHT_COLORS = ['#e2cd9c', '#cf9a48', '#6f9178', '#5c5a52']
const LIGHT_PATTERN = ['#7a5a2a', '#6b4510', '#1f3a2c', '#d8cfbd']
const DARK_COLORS = ['#6d6040', '#8a6526', '#35523f', '#3a3933']
const DARK_PATTERN = ['#c9b27a', '#e0b060', '#9cc7ad', '#908c7f']

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export type StrataBlock = {
  setProgress: (p: number) => void
  /** screen position (CSS px, relative to the container) of the active stratum's anchor */
  anchor: (i: number) => { x: number; y: number }
  render: () => void
  resize: () => void
  applyTheme: () => void
  dispose: () => void
  canvas: HTMLCanvasElement
}

export function createStrataBlock(container: HTMLElement): StrataBlock | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  const coarse = isCoarsePointer()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  const canvas = renderer.domElement
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.display = 'block'
  canvas.setAttribute('aria-hidden', 'true')
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50)
  const segs = coarse ? 96 : 144

  const shared = {
    uPaper: { value: new THREE.Color() },
    uInk: { value: new THREE.Color() },
    uContour: { value: new THREE.Color() },
    uDark: { value: 0 },
    uLevels: { value: 24 },
  }

  const meshes: THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>[] = LAYERS.map((l, i) => {
    const geo = new THREE.BoxGeometry(2, 1, 2, segs, 1, segs)
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        ...shared,
        uTopBase: { value: l.topBase },
        uTopAmp: { value: l.topAmp },
        uTopSeed: { value: l.topSeed },
        uTopWarp: { value: l.topWarp },
        uBotBase: { value: l.botBase },
        uBotAmp: { value: l.botAmp },
        uBotSeed: { value: l.botSeed },
        uOffset: { value: 0 },
        uIdx: { value: i },
        uFocus: { value: 1 },
        uColor: { value: new THREE.Color() },
        uPatternInk: { value: new THREE.Color() },
      },
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.frustumCulled = false
    scene.add(mesh)
    return mesh
  })

  const applyTheme = () => {
    const pal = readPalette()
    const s = (c: THREE.Color) => c.clone().convertLinearToSRGB()
    shared.uPaper.value.copy(s(pal.paper))
    shared.uInk.value.copy(s(pal.ink))
    shared.uContour.value.copy(s(pal.contour))
    shared.uDark.value = pal.dark
    const cols = pal.dark ? DARK_COLORS : LIGHT_COLORS
    const pats = pal.dark ? DARK_PATTERN : LIGHT_PATTERN
    meshes.forEach((m, i) => {
      m.material.uniforms.uColor.value.set(cols[i])
      m.material.uniforms.uPatternInk.value.set(pats[i])
    })
  }
  applyTheme()

  let w = 1
  let h = 1
  let progress = 0
  const state = { theta: 0.02, phi: 0, view: 2.4, explode: 0, lookY: 0, settle: 1 }

  const layout = () => {
    const narrow = w / h < 0.9
    const aspect = w / h
    let viewH = state.view
    if (narrow) viewH = Math.max(viewH, (state.view * 0.98) / aspect)
    const viewW = viewH * aspect
    // desktop: the block settles between the intro and the legend; phones: between heading and card
    const cx = narrow ? 0.5 : 0.5 + (0.43 - 0.5) * state.settle
    const cy = narrow ? 0.5 + (0.56 - 0.5) * state.settle : 0.5 + (0.47 - 0.5) * state.settle
    camera.left = -cx * viewW
    camera.right = (1 - cx) * viewW
    camera.top = (1 - cy) * viewH
    camera.bottom = -cy * viewH
    camera.updateProjectionMatrix()

    const r = 12
    const target = new THREE.Vector3(0, state.lookY, 0)
    camera.position.set(
      target.x + r * Math.sin(state.theta) * Math.sin(state.phi),
      target.y + r * Math.cos(state.theta),
      target.z + r * Math.sin(state.theta) * Math.cos(state.phi)
    )
    camera.up.set(-Math.sin(state.phi), 0, -Math.cos(state.phi))
    if (state.theta > 0.2) camera.up.set(0, 1, 0)
    camera.lookAt(target)
  }

  const offsets = [0, 0, 0, 0]

  const setProgress = (p: number) => {
    progress = p
    const tilt = smooth(0.0, 0.24, p)
    state.theta = 0.02 + tilt * 1.0
    state.phi = tilt * (Math.PI / 4 - 0.1) + p * 0.3
    // at p = 0 the sheet fills the viewport (the map continues from the hero), then recedes
    state.settle = smooth(0.0, 0.2, p)
    state.view = 1.15 + state.settle * 1.45 + tilt * 1.5 + smooth(0.24, 0.6, p) * 0.95
    state.explode = smooth(0.24, 0.62, p)
    state.lookY = state.explode * 0.42

    const activeF = Math.min(3.999, Math.max(0, ((p - 0.28) / 0.68) * 4))
    meshes.forEach((m, i) => {
      offsets[i] = state.explode * (3 - i) * 0.3
      m.material.uniforms.uOffset.value = offsets[i]
      const dist = Math.abs(activeF - (i + 0.5))
      const focus = p < 0.28 ? 1 : 1 - smooth(0.55, 0.95, dist) * 0.8
      m.material.uniforms.uFocus.value = p >= 0.995 ? 1 : focus
    })
    layout()
  }

  const anchor = (i: number) => {
    const l = LAYERS[i]
    const mid = (l.topBase + l.botBase) / 2 + offsets[i]
    const v = new THREE.Vector3(1.0, mid, 0.55).project(camera)
    return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h }
  }

  const resize = () => {
    const r = container.getBoundingClientRect()
    w = Math.max(1, r.width)
    h = Math.max(1, r.height)
    renderer.setSize(w, h, false)
    setProgress(progress)
  }

  const render = () => renderer.render(scene, camera)

  const dispose = () => {
    meshes.forEach((m) => {
      m.geometry.dispose()
      m.material.dispose()
    })
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
  }

  resize()
  return { setProgress, anchor, render, resize, applyTheme, dispose, canvas }
}
