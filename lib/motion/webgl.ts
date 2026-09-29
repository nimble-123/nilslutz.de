/** Cheap capability probe so we can keep the DOM poster when WebGL2 is not available. */
export function hasWebGL2() {
  if (typeof document === 'undefined') return false
  try {
    const c = document.createElement('canvas')
    const gl = c.getContext('webgl2')
    const ok = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}

export function isCoarsePointer() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
}

/** DPR cap from the brief: <= 1.5 on phones, <= 2 on desktop. */
export function cappedDpr() {
  if (typeof window === 'undefined') return 1
  return Math.min(window.devicePixelRatio || 1, isCoarsePointer() ? 1.5 : 2)
}

/** Reads a colour token (hex) from :root / .dark so WebGL follows the theme. */
export function readToken(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) ? v : fallback
}

/** Calls `cb` whenever next-themes flips the class on <html>. Returns an unsubscribe. */
export function onThemeChange(cb: () => void) {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => mo.disconnect()
}
