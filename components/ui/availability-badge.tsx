import { cn } from '@/lib/utils'

export function AvailabilityBadge({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'shadow-border bg-card/70 inline-flex items-center gap-3 rounded-full py-2 pr-4 pl-3 text-[0.95rem]',
        className
      )}
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-600/40 motion-reduce:hidden dark:bg-emerald-400/40" />
        <span className="relative size-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
      </span>
      Open for Inhouse & Consulting (BTP / Architecture)
    </p>
  )
}
