import { EXTENSIONS, EXTENSION_LENGTH } from './geometry'

export type StudyMark = {
  slug: string
  title: string
  summary: string
  period: string
  role: string
  start: number
}

/** Chronological order for the timeline: start year, then end year, then title. */
export function toMarks(
  studies: { slug: string; title: string; summary: string; period: string; role: string }[]
): StudyMark[] {
  const years = (p: string) => (String(p).match(/\d{4}/g) ?? ['0']).map(Number)
  return studies
    .map((s) => ({ ...s, start: years(s.period)[0] }))
    .sort((a, b) => {
      const ya = years(a.period)
      const yb = years(b.period)
      return ya[0] - yb[0] || ya[ya.length - 1] - yb[yb.length - 1] || a.title.localeCompare(b.title)
    })
}

/**
 * Extension label anchors in percent of the core circle's bounding square
 * (centre 50/50, radius 50) — identical maths to `extensionSegment`.
 */
export const extensionLabels = EXTENSIONS.map((e) => {
  const a = (e.deg * Math.PI) / 180
  const tx = -Math.sin(a)
  const ty = Math.cos(a)
  const px = 50 + 50 * Math.cos(a)
  const py = 50 + 50 * Math.sin(a)
  const len = EXTENSION_LENGTH * 50
  return {
    ...e,
    x0: px,
    y0: py,
    x1: px + tx * len,
    y1: py + ty * len,
    tx,
    ty,
  }
})
