import { describe, expect, it } from 'vitest'
import { fitLine, stretchKeyword } from './type-fit'

describe('stretchKeyword', () => {
  it('maps axis values to the nearest CSS keyword', () => {
    expect(stretchKeyword(50)).toBe('ultra-condensed')
    expect(stretchKeyword(100)).toBe('normal')
    expect(stretchKeyword(124)).toBe('expanded')
    expect(stretchKeyword(150)).toBe('extra-expanded')
  })
})

describe('fitLine', () => {
  const measured = { 50: 400, 75: 600, 100: 800, 125: 1000, 150: 1200 }

  it('chooses the widest stretch that fits and scales up to the target', () => {
    expect(fitLine(measured, 1100)).toEqual({ stretch: 125, scale: 1.1 })
  })

  it('falls back to the narrowest stretch and scales down when nothing fits', () => {
    expect(fitLine(measured, 200)).toEqual({ stretch: 50, scale: 0.5 })
  })

  it('caps the upscale so short lines do not explode', () => {
    expect(fitLine(measured, 5000, 1.25)).toEqual({ stretch: 150, scale: 1.25 })
  })

  it('handles empty input', () => {
    expect(fitLine({}, 100)).toEqual({ stretch: 100, scale: 1 })
  })
})
