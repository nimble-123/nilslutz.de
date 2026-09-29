/**
 * CSS font-stretch keywords and the `wdth` axis value each one maps to.
 * The poster wordmark only uses these widths so the DOM text and the 2D canvas
 * that feeds the WebGL texture (ctx.fontStretch only takes keywords) render identical glyphs.
 */
export const STRETCH_KEYWORDS = [
  { keyword: 'ultra-condensed', value: 50 },
  { keyword: 'extra-condensed', value: 62.5 },
  { keyword: 'condensed', value: 75 },
  { keyword: 'semi-condensed', value: 87.5 },
  { keyword: 'normal', value: 100 },
  { keyword: 'semi-expanded', value: 112.5 },
  { keyword: 'expanded', value: 125 },
  { keyword: 'extra-expanded', value: 150 },
] as const

export type StretchKeyword = (typeof STRETCH_KEYWORDS)[number]['keyword']

export function stretchKeyword(value: number): StretchKeyword {
  let best: (typeof STRETCH_KEYWORDS)[number] = STRETCH_KEYWORDS[0]
  for (const s of STRETCH_KEYWORDS) {
    if (Math.abs(s.value - value) < Math.abs(best.value - value)) best = s
  }
  return best.keyword
}

/**
 * Picks the widest stretch whose measured line width still fits the target width,
 * then the font-size scale that makes the line land exactly on the target (justified poster line).
 * `measured` maps a stretch value (50..150) to the line width at the base font size.
 * `maxScale` keeps a short line from blowing up vertically.
 */
export function fitLine(
  measured: Record<number, number>,
  target: number,
  maxScale = 1.25
): { stretch: number; scale: number } {
  const entries = Object.entries(measured)
    .map(([k, w]) => ({ stretch: Number(k), width: w }))
    .filter((e) => e.width > 0)
    .sort((a, b) => a.stretch - b.stretch)
  if (!entries.length || target <= 0) return { stretch: 100, scale: 1 }

  const fitting = entries.filter((e) => e.width <= target)
  const pick = fitting.length ? fitting[fitting.length - 1] : entries[0]
  const scale = Math.min(target / pick.width, maxScale)
  return { stretch: pick.stretch, scale: Math.round(scale * 1000) / 1000 }
}
