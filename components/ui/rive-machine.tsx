'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { prefersReducedMotion } from '@/lib/motion/scroll'
import { cn } from '@/lib/utils'

const RiveMachineCanvas = dynamic(() => import('@/components/ui/rive-machine-canvas'), { ssr: false })

/**
 * An interactive Rive vector machine: press "Insert data" and it gets to work.
 * The runtime (WASM) is only fetched once the frame scrolls near the viewport.
 */
export function RiveMachine({ className, caption }: { className?: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [fire, setFire] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(prefersReducedMotion())
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '300px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <figure ref={ref} className={cn('bg-paper text-ink flex flex-col shadow-[0_0_0_1px_oklch(0_0_0/0.1)]', className)}>
      <div className="relative aspect-[4/3] w-full">{near && <RiveMachineCanvas fire={fire} reduced={reduced} />}</div>
      <figcaption className="flex items-center justify-between gap-3 p-2 pl-3 shadow-[0_-1px_0_rgb(18_18_17/0.14)]">
        <span className="label opacity-70">{caption ?? 'Fig. 1 — Enterprise data machine'}</span>
        <button
          type="button"
          onClick={() => setFire((f) => f + 1)}
          className="press bg-ink text-paper hover:bg-signal hover:text-ink inline-flex h-10 items-center px-4 text-xs font-bold tracking-wide uppercase"
        >
          Insert data
        </button>
      </figcaption>
    </figure>
  )
}
