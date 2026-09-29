'use client'

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { cn } from '@/lib/utils'

/**
 * A wall text whose lines are revealed once, like lettering being set onto a gallery wall.
 * Lines rise out of a mask when the text first enters the viewport. Reduced motion: static.
 */
export function WallText({
  as: Tag = 'p',
  className,
  children,
  start = 'top 82%',
}: {
  as?: ElementType
  className?: string
  children: ReactNode
  start?: string
}) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger, SplitText)
    let split: SplitText | undefined
    const ctx = gsap.context(() => {
      split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        linesClass: 'wall-line',
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 105,
            duration: 1.5,
            ease: 'expo.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start, once: true },
          }),
      })
    }, el)
    return () => {
      ctx.revert()
      split?.revert()
    }
  }, [start])

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  )
}
