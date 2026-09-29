export function AvailabilityBadge() {
  return (
    <p className="label-mono text-foreground inline-flex items-center gap-3 rounded-full py-2.5 pr-4 pl-3.5 shadow-[var(--shadow-border)]">
      <span className="relative flex size-2" aria-hidden="true">
        <span className="bg-sodium absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none" />
        <span className="bg-sodium relative inline-flex size-2 rounded-full" />
      </span>
      Open for Inhouse & Consulting (BTP / Architecture)
    </p>
  )
}
