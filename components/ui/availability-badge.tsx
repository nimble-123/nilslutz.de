/** Availability as a map-legend status line. Themed purely through CSS tokens. */
export function AvailabilityBadge() {
  return (
    <p className="marginalia bg-background text-foreground inline-flex min-h-10 items-center gap-2.5 rounded-[3px] px-3 shadow-[var(--shadow-border)]">
      <span className="relative flex size-2" aria-hidden="true">
        <span className="bg-primary absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping" />
        <span className="bg-primary relative inline-flex size-2 rounded-full" />
      </span>
      Open for Inhouse &amp; Consulting (BTP / Architecture)
    </p>
  )
}
