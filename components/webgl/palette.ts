'use client'

import * as THREE from 'three'

export type Palette = {
  paper: THREE.Color
  paperDeep: THREE.Color
  ink: THREE.Color
  contour: THREE.Color
  ochre: THREE.Color
  survey: THREE.Color
  rule: THREE.Color
  dark: number
}

function cssColor(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const c = new THREE.Color()
  try {
    c.setStyle(v || fallback, THREE.SRGBColorSpace)
  } catch {
    c.setStyle(fallback, THREE.SRGBColorSpace)
  }
  return c
}

/** Reads the live CSS theme tokens so the shaders print in the same inks as the DOM. */
export function readPalette(): Palette {
  const dark = document.documentElement.classList.contains('dark') ? 1 : 0
  return {
    paper: cssColor('--background', '#eee7d8'),
    paperDeep: cssColor('--paper-deep', '#e4dbc8'),
    ink: cssColor('--foreground', '#25241f'),
    contour: cssColor('--contour', '#9a6a3a'),
    ochre: cssColor('--ochre', '#b8801f'),
    survey: cssColor('--survey', '#2b5944'),
    rule: cssColor('--border', '#d3c8b1'),
    dark,
  }
}

/** Calls `cb` whenever next-themes flips the `dark` class on <html>. */
export function onThemeChange(cb: () => void) {
  const obs = new MutationObserver(() => cb())
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => obs.disconnect()
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isCoarsePointer() {
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}
