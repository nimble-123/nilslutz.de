'use client'

import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { NOISE_GLSL, CONTOUR_GLSL } from '@/lib/glsl'
import { readPalette, onThemeChange, hasWebGL, prefersReducedMotion, isCoarsePointer } from './palette'

const MAX_PEAKS = 8

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uRise;
uniform float uLift;
uniform vec2 uMouse;
uniform float uWordAmt;
uniform sampler2D uWord;
uniform float uLevels;
uniform float uScale;
uniform float uSeed;
uniform float uDark;
uniform float uGrid;
uniform vec3 uPeaks[${MAX_PEAKS}];
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uContour;
uniform vec3 uOchre;
uniform vec3 uSurvey;

varying vec2 vUv;

${NOISE_GLSL}
${CONTOUR_GLSL}

float terrain(vec2 p) {
  vec2 s = vec2(uSeed * 3.7, uSeed * 1.9);
  float t = uTime;
  vec2 q = vec2(
    fbm3(p * 0.8 + s + vec2(0.0, t * 0.010)),
    fbm3(p * 0.8 + s + vec2(5.2, 1.3) - vec2(t * 0.008, 0.0))
  );
  return fbm4(p * 0.72 + s + 1.15 * q + vec2(t * 0.004, 0.0));
}

void main() {
  vec2 frag = vUv * uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * uScale;

  float h = terrain(p) * uRise;

  // the cursor / finger pushes a mountain up from below
  vec2 dm = p - uMouse;
  float r2 = dot(dm, dm);
  h += uLift * (0.42 * exp(-r2 * 7.0) + 0.26 * exp(-r2 * 1.4));

  // survey points sit on small summits
  for (int i = 0; i < ${MAX_PEAKS}; i++) {
    vec3 pk = uPeaks[i];
    vec2 d = p - pk.xy;
    h += pk.z * exp(-dot(d, d) * 14.0);
  }

  // wordmark embossed as a plateau: G = tight ramp (outline at 0.5, bevel, inset contour), B = wide footing
  vec4 wt = texture2D(uWord, vUv);
  float wA = step(0.02, uWordAmt);
  // AA'd plateau mask from the smooth ramp: its 0.5 level sits on the glyph outline
  float fwG = max(fwidth(wt.g), 1e-4);
  float plate = smoothstep(0.5 - fwG * 0.75, 0.5 + fwG * 0.75, wt.g) * uWordAmt;
  float shoulder = wt.b * uWordAmt;

  // terrain rises into the letters' footings, so contours crowd around them like an escarpment
  h += shoulder * 0.16 * (1.0 - plate);

  float lv = h * uLevels;
  float minor = isoLine(lv, 1.0);
  float index = isoLine(lv, 2.1) * isIndexContour(lv, 5.0);

  // hillshade from screen-space derivatives (light from the north-west, as on printed maps)
  float px = uScale / uRes.y;
  vec2 g = vec2(dFdx(h), dFdy(h)) / px;
  vec3 n = normalize(vec3(-g * 0.32, 1.0));
  float sh = dot(n, normalize(vec3(-0.55, 0.6, 0.62)));

  vec3 col = uPaper;
  // hypsometric hint: survey green in the lowlands, ochre on the heights
  col = mix(col, uSurvey, (0.10 + 0.06 * uDark) * smoothstep(0.0, -0.45, h));
  col = mix(col, uOchre, (0.09 + 0.05 * uDark) * smoothstep(0.18, 0.62, h));
  col *= mix(0.86, 1.05, clamp(sh, 0.0, 1.0)) + uDark * 0.04;

  // kilometre grid, survey green
  vec2 gp = p / uGrid;
  float grid = max(isoLine(gp.x, 1.0), isoLine(gp.y, 1.0));
  col = mix(col, uSurvey, grid * (0.13 + 0.07 * uDark));

  // contours stop at the plateau edge
  float open = 1.0 - smoothstep(0.05, 0.5, plate);
  col = mix(col, uContour, minor * (0.55 + 0.15 * uDark) * open);
  col = mix(col, mix(uContour, uInk, 0.3), index * 0.92 * open);

  // the plateau: flat, clean paper, bevel lit from the north-west (texture-space gradient of the shoulder)
  vec2 tx = 1.5 / uRes;
  float gx = texture2D(uWord, vUv + vec2(tx.x, 0.0)).g - texture2D(uWord, vUv - vec2(tx.x, 0.0)).g;
  float gy = texture2D(uWord, vUv + vec2(0.0, tx.y)).g - texture2D(uWord, vUv - vec2(0.0, tx.y)).g;
  float bevel = dot(vec2(gx, gy), normalize(vec2(0.7, -0.7))) * 3.2 * uWordAmt;
  vec3 plateCol = mix(uPaper, uOchre, 0.07 + 0.10 * uDark) * (1.04 - uDark * 0.03);
  plateCol *= 1.0 + clamp(bevel, -0.12, 0.07);
  col = mix(col, plateCol, plate);

  // cast shadow on the lowland side (south-east)
  float castSh = texture2D(uWord, vUv + vec2(-0.0035, 0.0035 * uRes.x / uRes.y)).g * uWordAmt;
  col *= 1.0 - 0.10 * castSh * (1.0 - plate);

  // a single inset plateau contour and the cliff hairline in ink
  float edge = 1.0 - smoothstep(0.35, 1.25, abs(wt.g - 0.5) / fwG);
  float inset = (1.0 - smoothstep(0.3, 1.1, abs(wt.g - 0.86) / fwG)) * plate;
  col = mix(col, uInk, edge * 0.85 * wA * uWordAmt);
  col = mix(col, uContour, inset * 0.7);

  // paper fibre
  col += (hash12(floor(frag)) - 0.5) * 0.028;

  gl_FragColor = vec4(col, 1.0);
}
`

export type Peak = { x: number; y: number; amp: number }

export type TerrainHandle = {
  /** peaks in canvas UV space (0..1, y up) */
  setPeaks: (peaks: Peak[]) => void
  /** uv (0..1, y down like the DOM) → lifts terrain there */
  intro: () => gsap.core.Timeline | null
}

type Props = {
  className?: string
  mode: 'hero' | 'map'
  wordmark?: string
  seed?: number
  levels?: number
  scale?: number
  grid?: number
  /** fires with the WebGL availability once known */
  onSupport?: (ok: boolean) => void
  /** DOM readout elements (hero) */
  readoutRef?: React.RefObject<HTMLElement | null>
  crosshairRef?: React.RefObject<HTMLElement | null>
  handleRef?: Ref<TerrainHandle>
}

function srgb(c: THREE.Color) {
  return c.clone().convertLinearToSRGB()
}

/**
 * Rasterises the wordmark into two channels at CSS resolution:
 * G = tight blur (its 0.5 level is the glyph outline; also drives bevel + inset contour),
 * B = wide blur (the terrain footing the letters rise out of).
 */
function drawWordmark(canvas: HTMLCanvasElement, text: string, w: number, h: number) {
  const k = Math.min(1, 2048 / Math.max(w, h))
  canvas.width = Math.max(2, Math.round(w * k))
  canvas.height = Math.max(2, Math.round(h * k))
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width
  const H = canvas.height
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)

  const family = getComputedStyle(document.body).getPropertyValue('--font-grotesk').trim() || 'sans-serif'
  const narrow = W / H < 0.9
  const lines = narrow ? text.split(' ') : [text]
  ctx.font = `700 100px ${family}`
  ctx.letterSpacing = '-4px'
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width))
  let size = (100 * (W * (narrow ? 0.84 : 0.78))) / widest
  size = Math.min(size, (H * (narrow ? 0.24 : 0.36)) / (lines.length * 0.82))
  ctx.font = `700 ${size}px ${family}`
  ctx.letterSpacing = `${-size * 0.04}px`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const lineH = size * 0.9
  const cy = H * (narrow ? 0.4 : 0.43)
  const y0 = cy - ((lines.length - 1) * lineH) / 2
  const draw = () => lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lineH))

  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = '#0000ff'
  ctx.filter = `blur(${Math.max(2, size * 0.14)}px)`
  draw()
  ctx.fillStyle = '#00ff00'
  ctx.filter = `blur(${Math.max(1, size * 0.022)}px)`
  draw()
  ctx.filter = 'none'
  ctx.globalCompositeOperation = 'source-over'
}

export function TerrainCanvas({
  className,
  mode,
  wordmark,
  seed = 0,
  levels = 16,
  scale = 3.2,
  grid = 0.5,
  onSupport,
  readoutRef,
  crosshairRef,
  handleRef,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<TerrainHandle | null>(null)

  useImperativeHandle(handleRef, () => ({
    setPeaks: (peaks) => apiRef.current?.setPeaks(peaks),
    intro: () => apiRef.current?.intro() ?? null,
  }))

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    if (!hasWebGL()) {
      onSupport?.(false)
      return
    }

    const reduced = prefersReducedMotion()
    const coarse = isCoarsePointer()
    const animated = mode === 'hero' && !reduced
    const maxDpr = coarse ? 1.5 : 2
    let pixelRatio = Math.min(window.devicePixelRatio || 1, maxDpr)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' })
    } catch {
      onSupport?.(false)
      return
    }
    renderer.setPixelRatio(pixelRatio)
    const canvas = renderer.domElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.setAttribute('aria-hidden', 'true')
    wrap.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const wordCanvas = document.createElement('canvas')
    const wordTex = new THREE.CanvasTexture(wordCanvas)
    wordTex.minFilter = THREE.LinearFilter
    wordTex.magFilter = THREE.LinearFilter
    wordTex.generateMipmaps = false

    const peaks = Array.from({ length: MAX_PEAKS }, () => new THREE.Vector3(0, 0, 0))

    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uRise: { value: mode === 'hero' && !reduced ? 0 : 1 },
      uLift: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uWordAmt: { value: mode === 'hero' && wordmark ? (reduced ? 1 : 0) : 0 },
      uWord: { value: wordTex },
      uLevels: { value: levels },
      uScale: { value: coarse ? scale * 0.8 : scale },
      uSeed: { value: seed },
      uDark: { value: 0 },
      uGrid: { value: grid },
      uPeaks: { value: peaks },
      uPaper: { value: new THREE.Color() },
      uInk: { value: new THREE.Color() },
      uContour: { value: new THREE.Color() },
      uOchre: { value: new THREE.Color() },
      uSurvey: { value: new THREE.Color() },
    }

    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms })
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const applyPalette = () => {
      const pal = readPalette()
      uniforms.uPaper.value.copy(srgb(pal.paper))
      uniforms.uInk.value.copy(srgb(pal.ink))
      uniforms.uContour.value.copy(srgb(pal.contour))
      uniforms.uOchre.value.copy(srgb(pal.ochre))
      uniforms.uSurvey.value.copy(srgb(pal.survey))
      uniforms.uDark.value = pal.dark
    }
    applyPalette()

    let cssW = 1
    let cssH = 1
    let dirty = true

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      cssW = Math.max(1, r.width)
      cssH = Math.max(1, r.height)
      renderer.setSize(cssW, cssH, false)
      const buf = renderer.getDrawingBufferSize(new THREE.Vector2())
      uniforms.uRes.value.copy(buf)
      if (mode === 'hero' && wordmark) {
        drawWordmark(wordCanvas, wordmark, cssW, cssH)
        wordTex.needsUpdate = true
      }
      applyPeakTargets()
      dirty = true
    }

    // ── peaks (map mode) ────────────────────────────────────────────────
    let peakTargets: Peak[] = []
    const peakAmp = new Float32Array(MAX_PEAKS)
    const applyPeakTargets = () => {
      const aspect = cssW / cssH
      const s = uniforms.uScale.value
      peakTargets.forEach((pk, i) => {
        if (i >= MAX_PEAKS) return
        peaks[i].x = (pk.x - 0.5) * aspect * s
        peaks[i].y = (0.5 - pk.y) * s
      })
    }

    // ── pointer (hero mode) ─────────────────────────────────────────────
    const target = { x: 0, y: 0, lift: 0 }
    const current = { x: 0.6, y: -0.2, lift: 0 }
    let pointerInside = false
    let pressed = false
    let lastPointer = -10

    const toP = (clientX: number, clientY: number) => {
      const r = wrap.getBoundingClientRect()
      const u = (clientX - r.left) / r.width
      const v = (clientY - r.top) / r.height
      const aspect = r.width / r.height
      const s = uniforms.uScale.value
      return { x: (u - 0.5) * aspect * s, y: (0.5 - v) * s, u, v }
    }

    const section = wrap.closest('section') ?? wrap
    const onMove = (e: PointerEvent) => {
      const p = toP(e.clientX, e.clientY)
      target.x = p.x
      target.y = p.y
      pointerInside = p.u >= 0 && p.u <= 1 && p.v >= 0 && p.v <= 1
      lastPointer = performance.now() / 1000
      if (crosshairRef?.current) {
        crosshairRef.current.style.opacity = pointerInside && e.pointerType === 'mouse' ? '1' : '0'
      }
      if (reduced) {
        current.x = target.x
        current.y = target.y
        current.lift = pointerInside ? 0.8 : 0
        dirty = true
      }
    }
    const onDown = (e: PointerEvent) => {
      pressed = true
      onMove(e)
    }
    const onUp = () => {
      pressed = false
    }
    const onLeave = () => {
      pointerInside = false
      pressed = false
      if (crosshairRef?.current) crosshairRef.current.style.opacity = '0'
      if (reduced) {
        current.lift = 0
        dirty = true
      }
    }
    if (mode === 'hero') {
      section.addEventListener('pointermove', onMove as EventListener, { passive: true })
      section.addEventListener('pointerdown', onDown as EventListener, { passive: true })
      window.addEventListener('pointerup', onUp, { passive: true })
      section.addEventListener('pointerleave', onLeave)
      section.addEventListener('pointercancel', onUp)
    }

    // ── render loop, from gsap.ticker so it shares the Lenis/ScrollTrigger tick ──
    let visible = true
    let pageVisible = document.visibilityState === 'visible'
    let running = false
    const t0 = performance.now() / 1000
    let slowFrames = 0
    let frames = 0

    const fmtDMS = (deg: number) => {
      const d = Math.floor(deg)
      const mFloat = (deg - d) * 60
      const m = Math.floor(mFloat)
      const s = Math.floor((mFloat - m) * 60)
      return `${String(d).padStart(2, '0')}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″`
    }

    const tick = (_time: number, deltaTime: number) => {
      const now = performance.now() / 1000
      const dt = Math.min(deltaTime / 1000, 0.05)

      if (mode === 'hero' && !reduced) {
        uniforms.uTime.value = now - t0
        // idle: when nobody touches the sheet, a slow survey drone wanders it
        const idle = now - lastPointer > 2.5
        if (idle) {
          const t = now * 0.18
          const s = uniforms.uScale.value
          const aspect = cssW / cssH
          target.x = Math.sin(t * 1.3) * 0.36 * aspect * s
          target.y = Math.sin(t * 0.9 + 1.2) * 0.26 * s - 0.08 * s
        }
        target.lift = pressed ? 1.35 : pointerInside ? 0.9 : idle ? 0.55 : 0
        const kPos = 1 - Math.exp(-dt * 7)
        const kLift = 1 - Math.exp(-dt * (target.lift > current.lift ? 4 : 2.2))
        current.x += (target.x - current.x) * kPos
        current.y += (target.y - current.y) * kPos
        current.lift += (target.lift - current.lift) * kLift
        dirty = true
      }

      if (mode === 'map') {
        let moving = false
        peakTargets.forEach((pk, i) => {
          if (i >= MAX_PEAKS) return
          const k = reduced ? 1 : 1 - Math.exp(-dt * 6)
          const next = peakAmp[i] + (pk.amp - peakAmp[i]) * k
          if (Math.abs(next - peakAmp[i]) > 0.0005) moving = true
          peakAmp[i] = next
          peaks[i].z = next
        })
        if (moving) dirty = true
      }

      uniforms.uMouse.value.set(current.x, current.y)
      uniforms.uLift.value = current.lift

      if (mode === 'hero') {
        const r = readoutRef?.current
        if (r) {
          const s = uniforms.uScale.value
          const lat = 53.1383 + (current.y / s) * 0.05
          const lon = 8.2138 + (current.x / s) * 0.08
          r.textContent = `N ${fmtDMS(lat)}  E ${fmtDMS(lon)}  ·  UPLIFT +${String(Math.round(current.lift * 410)).padStart(3, '0')} M`
        }
        const ch = crosshairRef?.current
        if (ch) {
          const s = uniforms.uScale.value
          const aspect = cssW / cssH
          const u = target.x / (aspect * s) + 0.5
          const v = 0.5 - target.y / s
          ch.style.transform = `translate3d(${u * cssW}px, ${v * cssH}px, 0)`
        }
      }

      if (!dirty) return
      dirty = false
      renderer.render(scene, camera)

      // adaptive resolution: drop the pixel ratio if frames are consistently slow
      if (animated) {
        frames++
        if (deltaTime > 24) slowFrames++
        if (frames >= 90) {
          if (slowFrames > 45 && pixelRatio > 0.75) {
            pixelRatio = Math.max(0.75, pixelRatio - 0.25)
            renderer.setPixelRatio(pixelRatio)
            resize()
          }
          frames = 0
          slowFrames = 0
        }
      }
    }

    const start = () => {
      if (running || !visible || !pageVisible) return
      running = true
      gsap.ticker.add(tick)
    }
    const stop = () => {
      if (!running) return
      running = false
      gsap.ticker.remove(tick)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) {
          dirty = true
          start()
        } else stop()
      },
      { rootMargin: '100px' }
    )
    io.observe(wrap)

    const onVis = () => {
      pageVisible = document.visibilityState === 'visible'
      if (pageVisible) {
        dirty = true
        start()
      } else stop()
    }
    document.addEventListener('visibilitychange', onVis)

    const ro = new ResizeObserver(() => resize())
    ro.observe(wrap)

    const offTheme = onThemeChange(() => {
      applyPalette()
      dirty = true
    })

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      stop()
    })

    apiRef.current = {
      setPeaks: (next) => {
        peakTargets = next.slice(0, MAX_PEAKS)
        applyPeakTargets()
        dirty = true
      },
      intro: () => {
        if (mode !== 'hero' || reduced) return null
        const tl = gsap.timeline()
        tl.to(uniforms.uRise, { value: 1, duration: 2.6, ease: 'power3.out' }, 0)
        tl.to(uniforms.uWordAmt, { value: 1, duration: 2.0, ease: 'power2.inOut' }, 0.55)
        return tl
      },
    }

    // wait for the display face so the wordmark is set in the right type
    const fontReady = document.fonts?.ready ?? Promise.resolve()
    resize()
    fontReady.then(() => {
      resize()
      onSupport?.(true)
    })
    start()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      offTheme()
      document.removeEventListener('visibilitychange', onVis)
      if (mode === 'hero') {
        section.removeEventListener('pointermove', onMove as EventListener)
        section.removeEventListener('pointerdown', onDown as EventListener)
        window.removeEventListener('pointerup', onUp)
        section.removeEventListener('pointerleave', onLeave)
        section.removeEventListener('pointercancel', onUp)
      }
      apiRef.current = null
      geometry.dispose()
      material.dispose()
      wordTex.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, wordmark, seed, levels, scale, grid])

  return <div ref={wrapRef} className={className} />
}
