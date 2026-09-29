'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Mark = { label: string; at: number }

/**
 * A borehole depth gauge on the right margin of the home page.
 * The reading is scroll-linked; section marks come from `[data-depth]` elements.
 */
export function DepthGauge() {
  const markerRef = useRef<HTMLSpanElement>(null)
  const readingRef = useRef<HTMLSpanElement>(null)
  const [marks, setMarks] = useState<Mark[]>([])

  useEffect(() => {
    const measure = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-depth]'))
      setMarks(
        els.map((el) => ({
          label: el.dataset.depth ?? '',
          at: Math.min(1, (el.getBoundingClientRect().top + window.scrollY) / max),
        }))
      )
    }

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const p = self.progress
        if (markerRef.current) markerRef.current.style.transform = `translate3d(0, ${p * 100}cqh, 0)`
        if (readingRef.current) readingRef.current.textContent = String(Math.round(p * 1200)).padStart(4, '0')
      },
      onRefresh: measure,
    })
    measure()
    return () => st.kill()
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-24 right-4 bottom-10 z-40 hidden w-16 min-[1560px]:block"
      style={{ containerType: 'size' }}
    >
      <span className="bg-foreground/50 absolute inset-y-0 right-0 w-px" />
      {Array.from({ length: 25 }, (_, i) => (
        <span
          key={i}
          className="bg-foreground/40 absolute right-0 h-px"
          style={{ top: `${(i / 24) * 100}%`, width: i % 4 === 0 ? 10 : 5 }}
        />
      ))}
      {marks.map((m) => (
        <span
          key={m.label}
          className="marginalia text-muted-foreground absolute right-3 -translate-y-1/2 text-[0.625rem] whitespace-nowrap"
          style={{ top: `${m.at * 100}%` }}
        >
          {m.label}
        </span>
      ))}
      <span ref={markerRef} className="absolute top-0 right-0 block will-change-transform">
        <span className="bg-ochre absolute right-0 block h-[2px] w-5 -translate-y-1/2" />
        <span className="marginalia text-foreground bg-background absolute top-2 right-0 px-1 tabular-nums">
          −<span ref={readingRef}>0000</span> m
        </span>
      </span>
    </div>
  )
}
