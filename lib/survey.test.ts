import { describe, it, expect } from 'vitest'
import { hashString, surveyPoint } from '@/lib/survey'

describe('hashString', () => {
  it('is deterministic and unsigned 32-bit', () => {
    expect(hashString('clean-core-rap')).toBe(hashString('clean-core-rap'))
    expect(hashString('a')).not.toBe(hashString('b'))
    const h = hashString('event-driven')
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThan(2 ** 32)
  })
})

describe('surveyPoint', () => {
  it('numbers points and keeps them inside the sheet', () => {
    const slugs = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    slugs.forEach((slug, i) => {
      const p = surveyPoint(slug, i, slugs.length)
      expect(p.label).toBe(`SP ${String(i + 1).padStart(2, '0')}`)
      expect(p.u).toBeGreaterThan(0.1)
      expect(p.u).toBeLessThan(0.9)
      expect(p.v).toBeGreaterThan(0.05)
      expect(p.v).toBeLessThan(0.95)
      expect(p.easting).toMatch(/^E \d{3} \d{3}$/)
      expect(p.northing).toMatch(/^N \d \d{3} \d{3}$/)
    })
  })

  it('orders points top to bottom by index', () => {
    const a = surveyPoint('x', 0, 4)
    const b = surveyPoint('y', 3, 4)
    expect(a.v).toBeLessThan(b.v)
  })
})
