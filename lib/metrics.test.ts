import { describe, expect, it } from 'vitest'
import { decodeEntities, parseMetric } from './metrics'

describe('parseMetric', () => {
  it('splits a percentage metric', () => {
    expect(parseMetric('-40% TCO')).toEqual({ value: '-40%', label: 'TCO' })
  })

  it('decodes HTML entities used in frontmatter', () => {
    expect(parseMetric('&lt; 200ms API Latency')).toEqual({ value: '< 200ms', label: 'API Latency' })
    expect(parseMetric('&lt; 2 sec Event Processing')).toEqual({ value: '< 2 sec', label: 'Event Processing' })
  })

  it('handles plain counts and decimals', () => {
    expect(parseMetric('99.95% Delivery Rate')).toEqual({ value: '99.95%', label: 'Delivery Rate' })
    expect(parseMetric('10 Design Patterns')).toEqual({ value: '10', label: 'Design Patterns' })
  })

  it('returns text-only metrics without a value', () => {
    expect(parseMetric('Global Rollout (20+ countries)')).toEqual({
      value: null,
      label: 'Global Rollout (20+ countries)',
    })
    expect(parseMetric('S/4HANA Upgrade Enabled')).toEqual({ value: null, label: 'S/4HANA Upgrade Enabled' })
  })
})

describe('decodeEntities', () => {
  it('leaves unknown entities alone', () => {
    expect(decodeEntities('a &copy; b &lt; c')).toBe('a &copy; b < c')
  })
})
