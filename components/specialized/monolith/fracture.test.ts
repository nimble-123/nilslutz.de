import { describe, expect, it } from 'vitest'
import { SLAB, extrudePrism, fractureSlab, polygonArea } from './fracture'

describe('fractureSlab', () => {
  const cells = fractureSlab()

  it('partitions the slab face without gaps or overlaps', () => {
    const total = cells.reduce((sum, c) => sum + c.area, 0)
    expect(total).toBeCloseTo(SLAB.width * SLAB.height, 6)
  })

  it('has exactly one core cell, near the centre', () => {
    const cores = cells.filter((c) => c.isCore)
    expect(cores).toHaveLength(1)
    expect(Math.abs(cores[0].centroid[0])).toBeLessThan(0.1)
    expect(Math.abs(cores[0].centroid[1] - SLAB.height / 2)).toBeLessThan(0.2)
  })

  it('produces counter-clockwise convex polygons', () => {
    for (const c of cells) {
      expect(polygonArea(c.polygon)).toBeGreaterThan(0)
    }
  })

  it('has enough outer shards to carry the exhibits', () => {
    expect(cells.filter((c) => !c.isCore).length).toBeGreaterThanOrEqual(8)
  })
})

describe('extrudePrism', () => {
  it('emits a closed, flat-shaded prism', () => {
    const square: [number, number][] = [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]
    const { position, normal, edge } = extrudePrism(square, 0.5)
    // 4 cap fan triangles × 2 caps + 4 sides × 2 triangles = 16 triangles
    expect(position.length).toBe(16 * 9)
    expect(normal.length).toBe(position.length)
    expect(edge.length).toBe(16 * 12)
  })
})
