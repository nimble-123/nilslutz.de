import type Lenis from 'lenis'

/**
 * Tiny module-level store so every client component can read the shared Lenis
 * instance and the current scroll velocity without prop drilling or context re-renders.
 * The instance is owned by <SmoothScroll /> (components/ui/smooth-scroll.tsx).
 */
let lenis: Lenis | null = null
let fallbackVelocity = 0
let lastY = 0
let lastT = 0

export function setLenis(instance: Lenis | null) {
  lenis = instance
}

export function getLenis() {
  return lenis
}

/** Scroll velocity in px per frame (signed). Uses Lenis when present, otherwise native scroll deltas. */
export function getScrollVelocity() {
  if (lenis) return lenis.velocity
  if (typeof window === 'undefined') return 0
  const now = performance.now()
  const y = window.scrollY
  const dt = now - lastT
  if (dt > 0 && dt < 200) {
    const v = ((y - lastY) / dt) * 16.67
    fallbackVelocity += (v - fallbackVelocity) * 0.25
  } else {
    fallbackVelocity = 0
  }
  lastY = y
  lastT = now
  return fallbackVelocity
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
