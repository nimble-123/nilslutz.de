'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

/** Day survey ↔ night survey. Icon swap uses the contextual icon animation (spring, bounce 0). */
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
        'text-muted-foreground hover:text-foreground relative inline-flex size-10 items-center justify-center rounded-md transition-[color,background-color,scale] duration-150 ease-out hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] active:scale-[0.96] max-md:size-11',
        className
      )}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to day survey' : 'Switch to night survey'}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className="inline-flex"
          aria-hidden="true"
        >
          {isDark ? (
            <Moon className="size-[18px]" strokeWidth={1.5} />
          ) : (
            <Sun className="size-[18px]" strokeWidth={1.5} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
