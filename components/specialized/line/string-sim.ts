/**
 * A 1D damped string (wave equation) with fixed ends, integrated on the CPU.
 *
 *   ∂²d/∂t² = c² ∂²d/∂x² − 2γ ∂d/∂t + ν ∂²(∂d/∂t)/∂x²
 *
 * γ damps every mode equally, ν damps higher harmonics progressively faster — which is
 * what makes a plucked string sound (and here: look) like a string: the bright kink of
 * the pluck melts within a few periods while the fundamental rings on.
 *
 * Displacements are in CSS px along the line's normal; x is the node index.
 */
export class StringSim {
  readonly n: number
  readonly d: Float32Array
  readonly v: Float32Array
  private readonly a: Float32Array
  /** wave speed in nodes / s */
  private readonly c: number
  private readonly gamma: number
  private readonly nu: number
  private acc = 0
  private readonly h: number
  pinIndex = -1
  pinTarget = 0

  constructor(n: number, { fundamental = 3.2, decay = 0.85, brightDamping = 900 } = {}) {
    this.n = n
    this.d = new Float32Array(n)
    this.v = new Float32Array(n)
    this.a = new Float32Array(n)
    // f1 = c / (2 (n − 1))
    this.c = 2 * (n - 1) * fundamental
    this.gamma = 1 / decay
    // keep the harmonic damping resolution-independent
    this.nu = brightDamping * Math.pow((n - 1) / 383, 2)
    // Symplectic Euler is stable for the highest mode (λ = 4) while 4c²h² + 2bh ≤ 4,
    // with b = 2γ + 4ν. Solve for h with a 10% margin.
    const b = 2 * this.gamma + 4 * this.nu
    const c2 = this.c * this.c
    this.h = (-2 * b + Math.sqrt(4 * b * b + 4 * 4 * c2 * 3.6)) / (8 * c2)
  }

  /** Advance by dt seconds (fixed internal sub-steps). */
  step(dt: number) {
    this.acc += Math.min(dt, 1 / 20)
    const { n, d, v, a, h } = this
    const c2 = this.c * this.c
    const g2 = 2 * this.gamma
    const nu = this.nu
    while (this.acc >= h) {
      this.acc -= h
      for (let i = 1; i < n - 1; i++) {
        a[i] = c2 * (d[i - 1] - 2 * d[i] + d[i + 1]) - g2 * v[i] + nu * (v[i - 1] - 2 * v[i] + v[i + 1])
      }
      for (let i = 1; i < n - 1; i++) {
        v[i] += a[i] * h
        d[i] += v[i] * h
      }
      if (this.pinIndex > 0 && this.pinIndex < n - 1) {
        const p = this.pinIndex
        d[p] = this.pinTarget
        v[p] = 0
      }
    }
  }

  pin(u: number, target: number) {
    this.pinIndex = Math.round(u * (this.n - 1))
    this.pinTarget = target
  }

  release() {
    this.pinIndex = -1
  }

  /** Total mechanical energy (arbitrary units) — used to decide when the string is at rest. */
  energy() {
    const { n, d, v } = this
    const c2 = this.c * this.c
    let e = 0
    for (let i = 1; i < n; i++) {
      const s = d[i] - d[i - 1]
      e += v[i] * v[i] + c2 * s * s
    }
    return e / (c2 * n)
  }

  /** Max |displacement| in px. */
  amplitude() {
    let m = 0
    for (let i = 0; i < this.n; i++) m = Math.max(m, Math.abs(this.d[i]))
    return m
  }

  /** Extra, non-physical damping (factor per call) — used while the line changes shape. */
  dampen(k: number) {
    const f = Math.min(Math.max(k, 0), 1)
    for (let i = 0; i < this.n; i++) {
      this.d[i] *= f
      this.v[i] *= f
    }
  }

  reset() {
    this.d.fill(0)
    this.v.fill(0)
    this.acc = 0
  }

  private interp(arr: Float32Array, u: number) {
    const x = Math.min(Math.max(u, 0), 1) * (this.n - 1)
    const i = Math.floor(x)
    const f = x - i
    if (i >= this.n - 1) return arr[this.n - 1]
    return arr[i] * (1 - f) + arr[i + 1] * f
  }

  displacementAt(u: number) {
    return this.interp(this.d, u)
  }

  velocityAt(u: number) {
    return this.interp(this.v, u)
  }
}
