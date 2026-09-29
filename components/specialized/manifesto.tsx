'use client'

import { useEffect, useRef } from 'react'
import { getGsap, ScrollTrigger, SplitText } from '@/lib/motion/gsap'
import { prefersReducedMotion } from '@/lib/motion/scroll'

/**
 * Scene 2 — the statement. Every word sits in a box locked to its heaviest width; scrolling
 * scrubs the weight axis word by word (ink "filling in"), so the paragraph never reflows.
 */
export function Manifesto({ statement, principles }: { statement: string; principles: string[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const gsap = getGsap()
    const section = sectionRef.current
    const text = textRef.current
    if (!section || !text || prefersReducedMotion()) return

    let split: SplitText | null = null
    let ctx: gsap.Context | null = null
    let disposed = false

    const build = () => {
      ctx?.revert()
      split?.revert()
      split = SplitText.create(text, { type: 'words', wordsClass: 'mf-word' })
      const words = split.words as HTMLElement[]
      // lock each word to its final (heaviest) advance width
      words.forEach((w) => {
        w.style.display = 'inline-block'
        w.style.fontWeight = '850'
      })
      const widths = words.map((w) => w.getBoundingClientRect().width)
      words.forEach((w, i) => {
        w.style.width = `${widths[i]}px`
      })
      ctx = gsap.context(() => {
        gsap.fromTo(
          words,
          { fontWeight: 200, opacity: 0.22 },
          {
            fontWeight: 850,
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: {
              trigger: text,
              start: 'top 82%',
              end: 'bottom 45%',
              scrub: true,
            },
          }
        )
      }, section)
    }

    document.fonts.ready.then(() => {
      if (!disposed) build()
    })

    // Re-lock word widths when the measure changes (debounced, width only: ignores mobile URL-bar jitter)
    let lastW = window.innerWidth
    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (Math.abs(window.innerWidth - lastW) < 2) return
        lastW = window.innerWidth
        build()
        ScrollTrigger.refresh()
      }, 200)
    }
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
      ctx?.revert()
      split?.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} aria-labelledby="manifesto-label" className="relative py-24 md:py-40">
      <div className="shell grid-poster gap-y-8">
        <p id="manifesto-label" className="label col-span-4 md:col-span-2">
          <span className="text-signal">(02)</span> Statement
        </p>
        <p
          ref={textRef}
          className="col-span-4 text-[clamp(1.9rem,4.6vw,4.4rem)] leading-[1.02] font-[850] tracking-[-0.02em] [font-stretch:112.5%] md:col-span-10"
        >
          {statement}
        </p>
        <ul className="col-span-4 flex flex-wrap gap-2 md:col-span-10 md:col-start-3">
          {principles.map((p) => (
            <li key={p} className="label bg-foreground text-background px-3 py-2">
              {p}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
