'use client'

import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

/**
 * Dark mode is an exact inversion, so the toggle is a half-filled disc that turns over.
 * Pure CSS state (no mount guard needed): the rotation follows the `dark` class on <html>.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <button
      type="button"
      className={cn(
        'text-foreground relative inline-flex size-10 items-center justify-center transition-transform duration-150 ease-out active:scale-[0.96]',
        className
      )}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] dark:rotate-180"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
      </svg>
    </button>
  )
}
