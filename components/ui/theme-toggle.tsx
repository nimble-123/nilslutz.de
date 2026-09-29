'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

/** Day tide / night tide switch. Icon swap per the contextual-icon rule (spring, bounce 0). */
export function ModeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Mount guard for SSR-safe theme rendering; intentional one-shot setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      className={cn(
        'text-foreground/80 hover:text-foreground hover:bg-foreground/[0.06] relative inline-flex size-10 items-center justify-center rounded-full',
        'transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96]',
        className
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      title={isDark ? 'Day tide' : 'Night tide'}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className="inline-flex"
        >
          {isDark ? (
            <Moon className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Sun className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
