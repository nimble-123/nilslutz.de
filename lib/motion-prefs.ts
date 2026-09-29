/** True when the visitor asked the OS for reduced motion. Safe on the server (returns false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Coarse pointer or narrow viewport: treat as a phone-class device. */
export function isMobileClass(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}
