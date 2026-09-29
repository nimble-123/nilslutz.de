/**
 * Fracture geometry for the glass monolith.
 *
 * The front face of the slab (width W, height H) is partitioned into a 2D Voronoi diagram.
 * Every cell is a convex polygon, extruded through the slab depth into a prism. The cell whose
 * seed sits at the centre is the "Clean Core" — it never leaves its place.
 *
 * Pure math, no three.js import, so it can be unit-tested in Node.
 */

export type Vec2 = [number, number]

export type Cell = {
  /** Seed point the cell was grown from */
  seed: Vec2
  /** Convex polygon, counter-clockwise, in slab coordinates (x centred, y from floor) */
  polygon: Vec2[]
  /** Area centroid of the polygon */
  centroid: Vec2
  area: number
  isCore: boolean
}

export const SLAB = { width: 1.1, height: 2.6, depth: 0.5 }

/** Hand-placed seeds (then gently jittered) — composed, not random. Index 0 is the core. */
const BASE_SEEDS: Vec2[] = [
  [0, 1.32], // core
  // inner ring — defines the core's silhouette
  [-0.5, 1.36],
  [0.5, 1.28],
  [-0.3, 2.02],
  [0.32, 1.98],
  [-0.28, 0.66],
  [0.3, 0.7],
  // outer ring — edges, crown and plinth
  [-0.42, 2.45],
  [0.2, 2.52],
  [0.55, 2.3],
  [-0.56, 0.2],
  [0.05, 0.12],
  [0.52, 0.25],
  [-0.62, 1.85],
  [0.64, 0.9],
]

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seeds(jitter = 0.04, seed = 7): Vec2[] {
  const rand = mulberry32(seed)
  const x0 = SLAB.width / 2
  return BASE_SEEDS.map(([x, y], i) => {
    if (i === 0) return [x, y] as Vec2
    const jx = (rand() - 0.5) * 2 * jitter
    const jy = (rand() - 0.5) * 2 * jitter
    return [Math.max(-x0 * 1.2, Math.min(x0 * 1.2, x + jx)), y + jy] as Vec2
  })
}

/** Sutherland–Hodgman clip against the half-plane closer to `a` than to `b`. */
export function clipToBisector(poly: Vec2[], a: Vec2, b: Vec2): Vec2[] {
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  const nx = b[0] - a[0]
  const ny = b[1] - a[1]
  const side = (p: Vec2) => (p[0] - mx) * nx + (p[1] - my) * ny // <= 0 → keep
  const out: Vec2[] = []
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    const sp = side(p)
    const sq = side(q)
    if (sp <= 0) out.push(p)
    if ((sp <= 0) !== (sq <= 0)) {
      const t = sp / (sp - sq)
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t])
    }
  }
  return out
}

export function polygonArea(poly: Vec2[]): number {
  let a = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    a += x1 * y2 - x2 * y1
  }
  return a / 2
}

export function polygonCentroid(poly: Vec2[]): Vec2 {
  const a = polygonArea(poly)
  let cx = 0
  let cy = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    const f = x1 * y2 - x2 * y1
    cx += (x1 + x2) * f
    cy += (y1 + y2) * f
  }
  return [cx / (6 * a), cy / (6 * a)]
}

export function fractureSlab(width = SLAB.width, height = SLAB.height, pts: Vec2[] = seeds()): Cell[] {
  const hw = width / 2
  const rect: Vec2[] = [
    [-hw, 0],
    [hw, 0],
    [hw, height],
    [-hw, height],
  ]
  const cells: Cell[] = []
  pts.forEach((seed, i) => {
    let poly = rect
    pts.forEach((other, j) => {
      if (i !== j && poly.length) poly = clipToBisector(poly, seed, other)
    })
    // drop degenerate slivers
    const area = poly.length >= 3 ? polygonArea(poly) : 0
    if (area < 1e-5) return
    cells.push({ seed, polygon: poly, centroid: polygonCentroid(poly), area, isCore: i === 0 })
  })
  return cells
}

/** Distance from point p to the infinite line through a→b */
export function distToLine(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  return Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / len
}

export type PrismBuffers = {
  position: Float32Array
  normal: Float32Array
  /** Per-vertex edge data: see shader — min(e.x, e.z-e.x, e.y, e.w-e.y) is the distance to the nearest face edge */
  edge: Float32Array
}

const BIG = 1000

/**
 * Extrude a convex CCW polygon (given relative to its centroid) into a prism of depth `depth`,
 * returning non-indexed flat-shaded buffers.
 */
export function extrudePrism(poly: Vec2[], depth: number): PrismBuffers {
  const pos: number[] = []
  const nor: number[] = []
  const edg: number[] = []
  const zf = depth / 2
  const zb = -depth / 2

  const push = (
    v: [number, number, number][],
    n: [number, number, number],
    e: [number, number, number, number][]
  ) => {
    // make winding agree with the normal
    const [a, b, c] = v
    const ux = b[0] - a[0],
      uy = b[1] - a[1],
      uz = b[2] - a[2]
    const vx = c[0] - a[0],
      vy = c[1] - a[1],
      vz = c[2] - a[2]
    const cx = uy * vz - uz * vy
    const cy = uz * vx - ux * vz
    const cz = ux * vy - uy * vx
    const order = cx * n[0] + cy * n[1] + cz * n[2] >= 0 ? [0, 1, 2] : [0, 2, 1]
    for (const k of order) {
      pos.push(...v[k])
      nor.push(...n)
      edg.push(...e[k])
    }
  }

  // caps (triangle fan from the centroid = origin)
  const n = poly.length
  for (let i = 0; i < n; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % n]
    const h = distToLine([0, 0], p, q)
    const centre: [number, number, number, number] = [h, BIG, 2 * BIG, 2 * BIG]
    const rim: [number, number, number, number] = [0, BIG, 2 * BIG, 2 * BIG]
    push(
      [
        [0, 0, zf],
        [p[0], p[1], zf],
        [q[0], q[1], zf],
      ],
      [0, 0, 1],
      [centre, rim, rim]
    )
    push(
      [
        [0, 0, zb],
        [q[0], q[1], zb],
        [p[0], p[1], zb],
      ],
      [0, 0, -1],
      [centre, rim, rim]
    )
  }

  // sides
  for (let i = 0; i < n; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % n]
    const dx = q[0] - p[0]
    const dy = q[1] - p[1]
    const L = Math.hypot(dx, dy)
    const nn: [number, number, number] = [dy / L, -dx / L, 0]
    const pf: [number, number, number] = [p[0], p[1], zf]
    const qf: [number, number, number] = [q[0], q[1], zf]
    const qb: [number, number, number] = [q[0], q[1], zb]
    const pb: [number, number, number] = [p[0], p[1], zb]
    const e = (u: number, v: number): [number, number, number, number] => [u, v, L, depth]
    push([pf, qf, qb], nn, [e(0, depth), e(L, depth), e(L, 0)])
    push([pf, qb, pb], nn, [e(0, depth), e(L, 0), e(0, 0)])
  }

  return { position: new Float32Array(pos), normal: new Float32Array(nor), edge: new Float32Array(edg) }
}
