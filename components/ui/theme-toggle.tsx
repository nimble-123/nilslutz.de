'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const subscribe = () => () => {}

/** "After hours" switch: daylight travertine ↔ basalt gallery at night. */
export function ModeToggle({ className, showLabel = true }: { className?: string; showLabel?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  const night = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className={cn(
        'group text-muted-foreground hover:text-foreground relative inline-flex h-11 items-center gap-2 rounded-full pr-3 pl-2.5 transition-[color,scale] duration-150 ease-out active:scale-[0.96]',
        className
      )}
      onClick={() => setTheme(night ? 'light' : 'dark')}
      aria-label="Toggle theme"
      aria-pressed={night}
      title={night ? 'Lights on' : 'After hours'}
    >
      <span className="relative grid size-5 place-items-center" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={night ? 'moon' : 'sun'}
            className="grid place-items-center"
            initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          >
            {night ? <Moon className="size-4" strokeWidth={1.5} /> : <Sun className="size-4" strokeWidth={1.5} />}
          </motion.span>
        </AnimatePresence>
      </span>
      {showLabel && (
        <span className="label-caps hidden tabular-nums lg:inline" aria-hidden="true">
          {mounted ? (night ? 'After hours' : 'Daylight') : 'Daylight'}
        </span>
      )}
    </button>
  )
}
