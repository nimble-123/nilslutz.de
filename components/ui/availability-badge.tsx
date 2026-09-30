import { cn } from '@/lib/utils'

export function AvailabilityBadge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'bg-card text-foreground shadow-border inline-flex items-center gap-2.5 rounded-full py-2 pr-4 pl-3 font-mono text-xs',
        className
      )}
    >
      <span
        className="size-2 rounded-full bg-[#5f8a74] shadow-[0_0_0_3px_color-mix(in_oklch,#5f8a74_22%,transparent)]"
        aria-hidden="true"
      />
      Open for Inhouse &amp; Consulting (BTP / Architecture)
    </p>
  )
}
