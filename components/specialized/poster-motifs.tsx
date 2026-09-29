/**
 * Geometric motifs for the service posters (International Typographic Style: one idea, one shape).
 * Drawn with currentColor so they follow each poster's ink.
 */

/** Clean Core: the standard core stays untouched, extensions orbit outside it. */
export function CoreMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      {[96, 76, 56].map((r) => (
        <rect
          key={r}
          x={100 - r}
          y={100 - r}
          width={r * 2}
          height={r * 2}
          stroke="currentColor"
          strokeWidth="2"
          opacity={0.35 + (96 - r) / 80}
        />
      ))}
      <rect x="64" y="64" width="72" height="72" fill="currentColor" />
    </svg>
  )
}

/** Side-by-Side: two equal blocks next to each other, joined by a single API seam. */
export function SideBySideMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      <rect x="6" y="30" width="84" height="140" fill="currentColor" />
      <rect x="110" y="30" width="84" height="140" stroke="currentColor" strokeWidth="2" />
      <line x1="90" y1="100" x2="110" y2="100" stroke="currentColor" strokeWidth="6" />
      {[50, 70, 90, 110, 130, 150].map((y) => (
        <line key={y} x1="122" y1={y} x2="182" y2={y} stroke="currentColor" strokeWidth="2" opacity="0.5" />
      ))}
    </svg>
  )
}

/** Events: a stream of messages decoupling producer and consumer. */
export function EventMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none">
      <circle cx="26" cy="100" r="20" fill="currentColor" />
      <circle cx="174" cy="100" r="20" stroke="currentColor" strokeWidth="2" />
      {[62, 88, 114, 140].map((x, i) => (
        <circle key={x} cx={x} cy="100" r={4 + i * 1.5} fill="currentColor" opacity={0.4 + i * 0.2} />
      ))}
      <path d="M26 60 C 70 20, 130 20, 174 60" stroke="currentColor" strokeWidth="2" opacity="0.5" />
      <path d="M26 140 C 70 180, 130 180, 174 140" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    </svg>
  )
}
