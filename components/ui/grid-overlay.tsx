import { cn } from '@/lib/utils'

/**
 * The visible 12-column grid (4 on phones) every poster is set on.
 * Pure decoration: hairline column edges behind all content.
 */
export function GridOverlay() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="shell grid-poster h-full">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-full shadow-[inset_1px_0_0_var(--grid-line),inset_-1px_0_0_var(--grid-line)]',
              i >= 4 && 'hidden md:block'
            )}
          />
        ))}
      </div>
    </div>
  )
}
