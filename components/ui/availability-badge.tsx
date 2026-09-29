import { cn } from '@/lib/utils'

export function AvailabilityBadge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'bg-foreground text-background inline-flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-wide uppercase',
        className
      )}
    >
      <span className="relative flex size-2.5" aria-hidden="true">
        <span className="bg-signal absolute inset-0 animate-ping opacity-60 motion-reduce:animate-none" />
        <span className="bg-signal relative size-2.5" />
      </span>
      Open for Inhouse & Consulting (BTP / Architecture)
    </p>
  )
}
