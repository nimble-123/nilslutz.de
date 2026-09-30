import { cn } from '@/lib/utils'

/** The page's one signal dot. */
export function AvailabilityBadge({ className }: { className?: string }) {
  return (
    <p className={cn('inline-flex items-center gap-2.5 text-[0.8125rem]', className)}>
      <span className="bg-signal size-1.5 shrink-0 rounded-full" aria-hidden="true" />
      Open for Inhouse &amp; Consulting (BTP / Architecture)
    </p>
  )
}
