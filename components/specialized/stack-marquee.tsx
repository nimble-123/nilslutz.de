'use client'

import { useEffect, useRef } from 'react'
import { getGsap } from '@/lib/motion/gsap'
import { getScrollVelocity, prefersReducedMotion } from '@/lib/motion/scroll'

/**
 * Scene 4 — the tech stack as two opposing marquee bands. Base drift is slow; scroll velocity
 * (Lenis) accelerates the bands and flips their direction with the scroll direction.
 */
export function StackMarquee({ stack }: { stack: string[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const rowA = useRef<HTMLDivElement>(null)
  const rowB = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const gsap = getGsap()
    const section = sectionRef.current
    const a = rowA.current
    const b = rowB.current
    if (!section || !a || !b || prefersReducedMotion()) return

    let visible = false
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' })
    io.observe(section)

    let xa = 0
    let xb = 0
    let dir = 1
    let boost = 0
    const setA = gsap.quickSetter(a, 'x', 'px')
    const setB = gsap.quickSetter(b, 'x', 'px')

    const tick = (_t: number, deltaMs: number) => {
      if (!visible || document.hidden) return
      const f = Math.min(deltaMs, 50) / 16.67
      const v = getScrollVelocity()
      if (Math.abs(v) > 0.2) dir = Math.sign(v)
      boost += (Math.min(Math.abs(v), 60) - boost) * 0.1
      const speed = (0.6 + boost * 0.55) * dir * f
      const wa = a.scrollWidth / 2
      const wb = b.scrollWidth / 2
      xa -= speed
      xb += speed
      if (wa > 0) xa = ((xa % wa) - wa) % wa
      if (wb > 0) xb = ((xb % wb) - wb) % wb
      setA(xa)
      setB(xb)
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      io.disconnect()
    }
  }, [])

  const row = (outline: boolean) =>
    [...stack, ...stack].map((tech, i) => (
      <span key={`${tech}-${i}`} className="flex items-center">
        <span className={outline ? 'text-outline' : undefined}>{tech}</span>
        <span className="text-signal mx-[0.35em] text-[0.55em]">✱</span>
      </span>
    ))

  return (
    <section ref={sectionRef} aria-labelledby="stack-label" className="relative overflow-hidden py-20 md:py-32">
      <div className="shell grid-poster mb-8 md:mb-12">
        <h2 id="stack-label" className="label col-span-2 md:col-span-3">
          <span className="text-signal">(04)</span> Tech Stack
        </h2>
        <p className="label text-muted-foreground col-span-2 text-right md:col-span-4 md:col-start-9">
          Speed follows your scroll
        </p>
      </div>
      <div aria-hidden="true" className="type-display space-y-2 text-[clamp(2.8rem,9vw,9rem)] whitespace-nowrap">
        <div ref={rowA} className="flex w-max will-change-transform">
          {row(false)}
        </div>
        <div ref={rowB} className="flex w-max will-change-transform">
          {row(true)}
        </div>
      </div>
      <ul className="sr-only">
        {stack.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  )
}
