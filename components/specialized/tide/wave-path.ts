/** Deterministic, gently irregular wrack line (viewBox 0 0 1000 H). */
export function wavePath(seed: number, height = 24, points = 14): string {
  let s = (seed + 1) * 9301
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  const mid = height / 2
  const pts: Array<[number, number]> = []
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * 1000
    const swell = Math.sin(i * 0.9 + seed * 1.7) * height * 0.22
    const jitter = (rand() - 0.5) * height * 0.35
    pts.push([x, mid + swell + jitter])
  }
  // Catmull-Rom → cubic Bézier for a soft, hand-laid line
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

/** Y of the path's control polyline at x (0..1) — good enough to seat salt grains on the line. */
export function seededGrains(seed: number, count: number): Array<{ x: number; r: number; s: number }> {
  let s = (seed + 7) * 7919
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  return Array.from({ length: count }, () => ({ x: 0.05 + rand() * 0.9, r: rand() * 90, s: 3 + rand() * 4 }))
}
