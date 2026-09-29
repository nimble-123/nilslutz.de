/** Triangulation-point map symbol. Outline by default, filled when active. */
export function TrigPoint({ active, className }: { active?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 16 15" className={className} aria-hidden="true">
      <path
        d="M8 1.2 L14.8 13.6 H1.2 Z"
        fill={active ? 'currentColor' : 'var(--background)'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="9.4" r="1.5" fill={active ? 'var(--background)' : 'currentColor'} />
    </svg>
  )
}
