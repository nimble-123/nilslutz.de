'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function AvailabilityBadge() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by showing light theme until mounted
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        isDark ? 'border-green-900/50 bg-green-900/30 text-green-300' : 'border-zinc-200 bg-zinc-100 text-zinc-900'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', isDark ? 'bg-green-400' : 'bg-emerald-500')} aria-hidden="true" />
      Open for Inhouse & Consulting (BTP / Architecture)
    </div>
  )
}
