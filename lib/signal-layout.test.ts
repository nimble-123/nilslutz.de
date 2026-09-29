import { describe, expect, it } from 'vitest'
import {
  coreLayout,
  decodeEntities,
  satellitePosition,
  screenToWorld,
  shortTitle,
  topologyLayout,
  worldSize,
  worldToScreen,
} from './signal-layout'

describe('signal layout', () => {
  it('maps screen ↔ world round-trip on the z=0 plane', () => {
    const world = worldSize(1440, 900)
    const [x, y] = screenToWorld(200, 700, 1440, 900, world)
    const [px, py] = worldToScreen(x, y, 1440, 900, world)
    expect(px).toBeCloseTo(200)
    expect(py).toBeCloseTo(700)
  })

  it('center of the viewport is the world origin', () => {
    const world = worldSize(390, 844)
    expect(screenToWorld(195, 422, 390, 844, world)).toEqual([0, -0])
    expect(world.vertical).toBe(true)
  })

  it('keeps satellites on the orbit ring', () => {
    const core = coreLayout(worldSize(1440, 900))
    for (let i = 0; i < 5; i++) {
      const p = satellitePosition(i, 12.3, core)
      const d = Math.hypot(p[0] - core.center[0], p[1] - core.center[1], p[2] - core.center[2])
      expect(d).toBeCloseTo(core.ringRadius)
    }
  })

  it('lays out the topology with the broker between producers and consumers', () => {
    const wide = topologyLayout(worldSize(1440, 900), 3, 4)
    expect(wide.producers).toHaveLength(3)
    expect(wide.consumers).toHaveLength(4)
    expect(wide.producers[0][0]).toBeLessThan(wide.broker[0])
    expect(wide.consumers[0][0]).toBeGreaterThan(wide.broker[0])

    const tall = topologyLayout(worldSize(390, 844), 3, 4)
    expect(tall.producers[0][1]).toBeGreaterThan(tall.broker[1])
    expect(tall.consumers[0][1]).toBeLessThan(tall.broker[1])
  })

  it('shortens titles and decodes entities', () => {
    expect(shortTitle('CAPture Time: Enterprise Zeiterfassungssystem')).toBe('CAPture Time')
    expect(shortTitle('Event-Driven Architecture with Event Mesh', 20)).toBe('Event-Driven…')
    expect(decodeEntities('&lt; 200ms')).toBe('< 200ms')
  })
})
