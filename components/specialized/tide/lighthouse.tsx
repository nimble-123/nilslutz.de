'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

// The Rive runtime (~1.9 MB wasm) only loads once the lighthouse is about to be seen.
const LighthouseRive = dynamic(() => import('./lighthouse-rive'), { ssr: false })

const frame = 'aspect-square w-full max-w-[22rem] rounded-[1.5rem]'

export function Lighthouse() {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '800px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={frame}>
      {near ? <LighthouseRive /> : <div aria-hidden="true" className={cn(frame, 'bg-[#c9cfd0] dark:bg-[#1c2327]')} />}
    </div>
  )
}
