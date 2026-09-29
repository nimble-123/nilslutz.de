/**
 * The scroll story timeline, shared by the WebGL scene and the DOM wall labels
 * so camera, shards and labels stay in lock-step. `p` is scroll progress 0..1.
 */

export const EXHIBIT_COUNT = 8
const FIRST = 0.24
const LAST = 0.78

export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export const exhibitCentre = (i: number) => FIRST + (i * (LAST - FIRST)) / (EXHIBIT_COUNT - 1)

/** 1 while exhibit `i` is on view, easing to 0 between neighbours */
export function exhibitWeight(i: number, p: number) {
  const d = Math.abs(p - exhibitCentre(i))
  return 1 - smooth(0.026, 0.0385, d)
}

/** 1 = intact monolith, 0 = fully fractured */
export const assembled = (p: number) => 1 - smooth(0.1, 0.22, p) * (1 - smooth(0.8, 0.9, p))

export const heroVisibility = (p: number) => 1 - smooth(0.025, 0.085, p)
export const introVisibility = (p: number) => smooth(0.1, 0.15, p) * (1 - smooth(0.19, 0.215, p))
export const contactVisibility = (p: number) => smooth(0.88, 0.94, p)

export const ROOMS = [
  { from: 0, label: 'Entrance' },
  { from: 0.1, label: 'The Core' },
  { from: exhibitCentre(3) - 0.04, label: 'Works' },
  { from: 0.84, label: 'Reassembly' },
] as const

export function roomAt(p: number) {
  let idx = 0
  ROOMS.forEach((r, i) => {
    if (p >= r.from) idx = i
  })
  return idx
}
