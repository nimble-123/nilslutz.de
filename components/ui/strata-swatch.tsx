import { useId } from 'react'
import { cn } from '@/lib/utils'

type Pattern = 'laminae' | 'stipple' | 'hatch' | 'bedrock'

const index: Record<Pattern, number> = { laminae: 1, stipple: 2, hatch: 3, bedrock: 4 }

/** Geological legend swatch — the same lithology patterns the block diagram prints on its cut faces. */
export function StrataSwatch({ pattern, className }: { pattern: Pattern; className?: string }) {
  const id = useId().replace(/:/g, '')
  const n = index[pattern]
  const fill = `var(--stratum-${n})`
  const ink = `var(--stratum-${n}-ink)`

  return (
    <svg
      className={cn('block shadow-[0_0_0_1px_var(--foreground)]', className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {pattern === 'laminae' && (
          <pattern id={id} width="40" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 3 Q10 2 20 3 T40 3" fill="none" stroke={ink} strokeWidth="0.8" opacity="0.7" />
          </pattern>
        )}
        {pattern === 'stipple' && (
          <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.9" fill={ink} />
            <circle cx="5.5" cy="5" r="0.9" fill={ink} />
          </pattern>
        )}
        {pattern === 'hatch' && (
          <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={ink} strokeWidth="0.9" opacity="0.8" />
          </pattern>
        )}
        {pattern === 'bedrock' && (
          <pattern id={id} width="16" height="8" patternUnits="userSpaceOnUse">
            <path d="M0 0.5 H16 M0 4.5 H16 M4 0.5 V4.5 M12 4.5 V8.5" stroke={ink} strokeWidth="0.9" fill="none" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={fill} />
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
