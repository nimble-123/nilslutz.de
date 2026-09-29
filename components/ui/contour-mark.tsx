/** Contour-ring mark: three nested iso-lines around a summit. */
export function ContourMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 2.6c4.6-.2 9.2 3.3 9.3 8.6.1 5.6-4.3 10.3-9.6 10.2C6.3 21.3 2.6 17 2.7 12 2.8 6.6 7 2.8 12 2.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M12.3 6.4c3 0 5.4 2.2 5.2 5.5-.2 3.3-2.9 5.6-5.8 5.4-3-.1-5-2.7-4.8-5.6.2-3 2.5-5.3 5.4-5.3Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="12.4" cy="11.7" r="1.7" fill="var(--ochre)" />
    </svg>
  )
}
