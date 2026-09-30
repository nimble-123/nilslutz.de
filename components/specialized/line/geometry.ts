/**
 * Geometry of "the line".
 *
 * The line is always one continuous curve of arc length `L`, starting at (ax, ay) heading right.
 * Its last `roll` pixels are curled upward with radius `R` — like a tape that rolls itself up.
 * With roll = 0 it is a straight rule, with roll = 2πR it ends in a closed circle sitting on
 * the line. Rolling in / unrolling is therefore just a change of `roll` (and of the contact
 * point), which keeps every intermediate frame physically plausible: length is conserved
 * locally, nothing is squashed or cross-faded.
 */

export type Shape = {
  /** start point (CSS px, viewport space) */
  ax: number
  ay: number
  /** total arc length in px */
  L: number
  /** curled length at the end of the line (0 … 2πR) */
  roll: number
  /** curl radius */
  R: number
  /** visible sub-range of the line in [0, 1] (used for the draw-in) */
  trimA: number
  trimB: number
  /** stroke width in CSS px (1 = hairline) */
  width: number
}

export const TAU = Math.PI * 2

export type Sample = { x: number; y: number; nx: number; ny: number }

/** Point + unit normal at arc length s (0 ≤ s ≤ L). Normal points "down" on the flat part. */
export function pointAt(shape: Shape, s: number, out: Sample): Sample {
  const { ax, ay, L, R } = shape
  const roll = Math.min(Math.max(shape.roll, 0), L)
  const sc = L - roll
  if (s <= sc || roll <= 0 || R <= 0) {
    out.x = ax + s
    out.y = ay
    out.nx = 0
    out.ny = 1
    return out
  }
  const phi = (s - sc) / R
  const sin = Math.sin(phi)
  const cos = Math.cos(phi)
  out.x = ax + sc + R * sin
  out.y = ay - R * (1 - cos)
  // tangent = (cos φ, −sin φ) → normal = (sin φ, cos φ) (rotated +90° in y-down space)
  out.nx = sin
  out.ny = cos
  return out
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
/** Remap t from [a, b] to [0, 1], clamped. */
export const range = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export function flat(y: number, x0: number, x1: number, width = 1): Shape {
  return { ax: x0, ay: y, L: Math.max(0, x1 - x0), roll: 0, R: 1, trimA: 0, trimB: 1, width }
}

/**
 * Rolling a circle of radius R in from the right (r: 0 → 1) or out to the right (reverse).
 * Pure rolling: the contact point travels exactly as much as the curled length changes.
 * `contactY` is the y of the straight part; the circle centre ends at (cx, contactY − R).
 */
export function rolled(r: number, cx: number, contactY: number, R: number, x0: number, travel = TAU * R): Shape {
  const C = TAU * R
  const roll = clamp01(r) * C
  // `travel` ≥ C lets the circle clear very wide viewports (pure rolling when travel = C)
  const contactX = cx + (1 - clamp01(r)) * Math.max(travel, C)
  return { ax: x0, ay: contactY, L: contactX - x0 + roll, roll, R, trimA: 0, trimB: 1, width: 1 }
}

/** Component-wise blend of two shapes (used for the straight-line phases). */
export function mix(a: Shape, b: Shape, t: number): Shape {
  if (t <= 0) return a
  if (t >= 1) return b
  return {
    ax: lerp(a.ax, b.ax, t),
    ay: lerp(a.ay, b.ay, t),
    L: lerp(a.L, b.L, t),
    roll: lerp(a.roll, b.roll, t),
    R: lerp(a.R, b.R, t),
    trimA: lerp(a.trimA, b.trimA, t),
    trimB: lerp(a.trimB, b.trimB, t),
    width: lerp(a.width, b.width, t),
  }
}

/**
 * Tangent "extensions" leaving the core circle. Angles are measured in screen space
 * (y down) from the circle centre; each tangent runs clockwise away from its contact point.
 * Shared with the DOM fallback (percentages of the circle's bounding square).
 */
export const EXTENSIONS = [
  { deg: -140, label: 'Fiori' },
  { deg: -90, label: 'CAP' },
  { deg: -40, label: 'Events' },
] as const
/** tangent length as a multiple of R */
export const EXTENSION_LENGTH = 1.05

export function extensionSegment(cx: number, cy: number, R: number, deg: number, grow: number) {
  const a = (deg * Math.PI) / 180
  const px = cx + R * Math.cos(a)
  const py = cy + R * Math.sin(a)
  const tx = -Math.sin(a)
  const ty = Math.cos(a)
  const len = EXTENSION_LENGTH * R * clamp01(grow)
  return { x0: px, y0: py, x1: px + tx * len, y1: py + ty * len }
}

/** Snap a horizontal hairline to the centre of a device pixel row, so 1px stays 1px. */
export function snapY(y: number, dpr: number) {
  return (Math.round(y * dpr - 0.5) + 0.5) / dpr
}
