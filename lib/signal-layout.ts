/**
 * Pure layout math shared by the WebGL event mesh (GLSL mirrors these formulas)
 * and the HTML label overlay. World units: the z = 0 plane of a perspective camera.
 */

export const CAMERA_FOV = 35
export const CAMERA_Z = 10

/** Orbit constants — must match the uniforms fed to the vertex shader. */
export const ORBIT_SPEED = 0.11
export const ORBIT_TILT = 0.42
export const SATELLITE_COUNT = 5

export type Vec2 = [number, number]
export type Vec3 = [number, number, number]

export type World = { w: number; h: number; vertical: boolean }

/** Visible world size of the z = 0 plane for a viewport in CSS px. */
export function worldSize(viewW: number, viewH: number, fov = CAMERA_FOV, camZ = CAMERA_Z): World {
  const h = 2 * camZ * Math.tan(((fov / 2) * Math.PI) / 180)
  const aspect = viewW / Math.max(1, viewH)
  return { w: h * aspect, h, vertical: aspect < 0.9 }
}

/** CSS px (viewport space) → world units on the z = 0 plane. */
export function screenToWorld(px: number, py: number, viewW: number, viewH: number, world: World): Vec2 {
  return [((px - viewW / 2) / viewH) * world.h, (-(py - viewH / 2) / viewH) * world.h]
}

/** World units on the z = 0 plane → CSS px. */
export function worldToScreen(x: number, y: number, viewW: number, viewH: number, world: World): Vec2 {
  return [(x / world.h) * viewH + viewW / 2, (-y / world.h) * viewH + viewH / 2]
}

export type CoreLayout = { center: Vec3; radius: number; ringRadius: number }

/** The Clean Core sphere: right of the copy on wide screens, above it on phones. */
export function coreLayout(world: World): CoreLayout {
  if (world.vertical) {
    const radius = Math.min(world.w * 0.19, world.h * 0.12)
    return { center: [0, world.h * 0.22, 0], radius, ringRadius: radius * 1.75 }
  }
  const radius = Math.min(world.h * 0.155, world.w * 0.1)
  return { center: [world.w * 0.165, -world.h * 0.01, 0], radius, ringRadius: radius * 1.8 }
}

function rotateX([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x, y * c - z * s, y * s + z * c]
}

/** Position of satellite `i` (an extension orbiting the core) at `time` seconds. */
export function satellitePosition(i: number, time: number, core: CoreLayout, count = SATELLITE_COUNT): Vec3 {
  const a = (i / count) * Math.PI * 2 + time * ORBIT_SPEED
  const ring = rotateX([Math.cos(a) * core.ringRadius, 0, Math.sin(a) * core.ringRadius], ORBIT_TILT)
  return [core.center[0] + ring[0], core.center[1] + ring[1], core.center[2] + ring[2]]
}

export type TopologyLayout = { producers: Vec2[]; broker: Vec2; consumers: Vec2[] }

function spread(n: number, span: number): number[] {
  if (n <= 1) return [0]
  return Array.from({ length: n }, (_, i) => -span / 2 + (span * i) / (n - 1))
}

/** producers → broker → consumers. Horizontal on desktop, stacked on phones. */
export function topologyLayout(world: World, nProducers: number, nConsumers: number): TopologyLayout {
  if (world.vertical) {
    const pxs = spread(nProducers, world.w * 0.66)
    const cxs = spread(nConsumers, world.w * 0.74)
    return {
      producers: pxs.map((x) => [x, world.h * 0.1] as Vec2),
      broker: [0, -world.h * 0.08],
      consumers: cxs.map((x) => [x, -world.h * 0.27] as Vec2),
    }
  }
  const oy = -world.h * 0.07
  const pys = spread(nProducers, world.h * 0.4)
  const cys = spread(nConsumers, world.h * 0.48)
  return {
    producers: pys.map((y) => [-world.w * 0.24, oy - y] as Vec2),
    broker: [0, oy],
    consumers: cys.map((y) => [world.w * 0.24, oy - y] as Vec2),
  }
}

/** Short label for a case study title: text before a colon, capped in length. */
export function shortTitle(title: string, max = 34): string {
  const head = title.split(':')[0].trim()
  if (head.length <= max) return head
  const cut = head.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')).trim() + '…'
}

/** Decode the few HTML entities that appear in content frontmatter (e.g. `&lt;`). */
export function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
}
