import { describe, it, expect } from 'vitest'
import { pointAt, rolled, flat, mix, TAU, extensionSegment, snapY, type Sample } from './geometry'
import { StringSim } from './string-sim'

const s = (): Sample => ({ x: 0, y: 0, nx: 0, ny: 0 })

describe('line geometry', () => {
  it('a flat shape is a horizontal rule with a downward normal', () => {
    const shape = flat(100, 0, 500)
    const p = pointAt(shape, 250, s())
    expect(p).toEqual({ x: 250, y: 100, nx: 0, ny: 1 })
  })

  it('a fully rolled shape closes into a circle centred on (cx, y − R)', () => {
    const R = 100
    const shape = rolled(1, 400, 300, R, -2)
    expect(shape.roll).toBeCloseTo(TAU * R)
    // every curled point lies on the circle
    for (let k = 0; k <= 16; k++) {
      const p = pointAt(shape, shape.L - shape.roll + (k / 16) * shape.roll, s())
      expect(Math.hypot(p.x - 400, p.y - (300 - R))).toBeCloseTo(R, 6)
    }
    // the line ends where the circle meets the straight part
    const end = pointAt(shape, shape.L, s())
    expect(end.x).toBeCloseTo(400, 6)
    expect(end.y).toBeCloseTo(300, 6)
  })

  it('rolling is pure: the contact point moves exactly as much as the curl grows', () => {
    const a = rolled(0.25, 400, 300, 80, 0)
    const b = rolled(0.75, 400, 300, 80, 0)
    const contactA = a.L - a.roll
    const contactB = b.L - b.roll
    expect(contactA - contactB).toBeCloseTo(b.roll - a.roll, 6)
  })

  it('mix interpolates component-wise and clamps', () => {
    const a = flat(0, 0, 100)
    const b = flat(100, 50, 60, 7)
    expect(mix(a, b, 0)).toBe(a)
    expect(mix(a, b, 1)).toBe(b)
    const m = mix(a, b, 0.5)
    expect(m.ay).toBe(50)
    expect(m.L).toBe(55)
    expect(m.width).toBe(4)
  })

  it('extensions are tangent to the circle', () => {
    const seg = extensionSegment(0, 0, 100, -40, 1)
    const radial = { x: seg.x0 / 100, y: seg.y0 / 100 }
    const dir = { x: seg.x1 - seg.x0, y: seg.y1 - seg.y0 }
    expect(radial.x * dir.x + radial.y * dir.y).toBeCloseTo(0, 6)
  })

  it('snaps hairlines to device pixel centres', () => {
    expect(snapY(10.2, 1)).toBe(10.5)
    expect(snapY(10.2, 2)).toBe(10.25)
  })
})

describe('string simulation', () => {
  it('keeps its ends fixed and rings down after a pluck', () => {
    const sim = new StringSim(129)
    sim.pin(0.3, 40)
    sim.step(0.25)
    sim.release()
    const e0 = sim.energy()
    expect(e0).toBeGreaterThan(0)
    sim.step(1 / 60)
    for (let i = 0; i < 180; i++) sim.step(1 / 60)
    expect(sim.d[0]).toBe(0)
    expect(sim.d[sim.n - 1]).toBe(0)
    expect(sim.energy()).toBeLessThan(e0 * 0.05)
  })

  it('holds a pinned point where the finger is', () => {
    const sim = new StringSim(65)
    sim.pin(0.5, -24)
    sim.step(0.5)
    expect(sim.displacementAt(0.5)).toBeCloseTo(-24, 3)
    // a statically pulled string forms a triangle: halfway to the pin is roughly half the pull
    expect(sim.displacementAt(0.25)).toBeLessThan(-6)
  })
})
