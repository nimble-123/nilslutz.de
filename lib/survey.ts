/**
 * Deterministic "survey point" placement for case studies. Coordinates are
 * decorative map furniture derived from the slug — stable across builds.
 */

export function hashString(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export type SurveyPoint = {
  /** "SP 01" */
  label: string
  /** horizontal position on the sheet, 0..1 */
  u: number
  /** vertical position on the sheet, 0..1 (top → bottom) */
  v: number
  easting: string
  northing: string
}

const group = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export function surveyPoint(slug: string, index: number, total: number): SurveyPoint {
  const h = hashString(slug)
  const j1 = (h & 0xffff) / 0xffff
  const j2 = ((h >>> 16) & 0xffff) / 0xffff
  const count = Math.max(1, total)
  const u = 0.16 + ((index * 0.618034 + j1 * 0.25) % 1) * 0.68
  const v = 0.14 + ((index + 0.5) / count) * 0.72 + (j2 - 0.5) * (0.4 / count)
  const easting = 446000 + Math.round(u * 4000)
  const northing = 5893400 - Math.round(v * 3000)
  return {
    label: `SP ${String(index + 1).padStart(2, '0')}`,
    u,
    v,
    easting: `E ${group(easting)}`,
    northing: `N ${group(northing)}`,
  }
}
