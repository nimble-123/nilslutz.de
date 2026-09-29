import { describe, expect, it } from 'vitest'
import { EXHIBIT_COUNT, assembled, exhibitCentre, exhibitWeight, roomAt } from './story'

describe('scroll story timeline', () => {
  it('shows every exhibit fully at its centre', () => {
    for (let i = 0; i < EXHIBIT_COUNT; i++) expect(exhibitWeight(i, exhibitCentre(i))).toBe(1)
  })

  it('always has a label on view between the first and last exhibit', () => {
    for (let p = exhibitCentre(0); p <= exhibitCentre(EXHIBIT_COUNT - 1); p += 0.002) {
      const total = Array.from({ length: EXHIBIT_COUNT }, (_, i) => exhibitWeight(i, p)).reduce((a, b) => a + b, 0)
      expect(total).toBeGreaterThan(0.2)
    }
  })

  it('never shows two exhibits at full strength', () => {
    for (let p = 0; p <= 1; p += 0.002) {
      const full = Array.from({ length: EXHIBIT_COUNT }, (_, i) => exhibitWeight(i, p)).filter((w) => w > 0.99)
      expect(full.length).toBeLessThanOrEqual(1)
    }
  })

  it('is intact at the entrance and reassembled at the end', () => {
    expect(assembled(0)).toBe(1)
    expect(assembled(0.5)).toBe(0)
    expect(assembled(1)).toBe(1)
    expect(roomAt(0)).toBe(0)
    expect(roomAt(1)).toBe(3)
  })
})
