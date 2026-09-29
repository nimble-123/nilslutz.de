'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

/** A vertical rule that is drawn by the reader's scroll, like a pen run down the margin. */
export function ScrubRule({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.fromTo(
      el,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top 75%', end: 'bottom 60%', scrub: true },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return <span ref={ref} aria-hidden="true" className={cn('origin-top', className)} />
}
