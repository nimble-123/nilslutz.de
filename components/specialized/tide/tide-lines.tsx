'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { seededGrains, wavePath } from './wave-path'

gsap.registerPlugin(ScrollTrigger)

export type TideLineItem = {
  slug: string
  title: string
  period: string
  role: string
}

/**
 * Scene 2 — every case study is a tide line: the mark a high water leaves.
 * Pinned; each line is drawn in turn as you scroll, most recent tide first.
 */
export function TideLines({ items }: { items: TideLineItem[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const periodRef = useRef<HTMLSpanElement>(null)
  const total = items.length

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const rows = gsap.utils.toArray<HTMLElement>('[data-line-row]', section)
      gsap.set(section.querySelectorAll('[data-line-glow]'), { opacity: 1 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(1, rows.length) * 55}%`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const n = Math.min(total, Math.max(1, Math.ceil(self.progress * total)))
            if (counterRef.current) counterRef.current.textContent = String(n).padStart(2, '0')
            if (periodRef.current && items[n - 1]) periodRef.current.textContent = items[n - 1].period
          },
        },
      })
      tl.fromTo(
        '[data-lines-intro]',
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6 },
        0
      )
      rows.forEach((row, i) => {
        const at = 0.3 + i
        const paths = row.querySelectorAll('[data-line-path]')
        const glow = row.querySelector('[data-line-glow]')
        const body = row.querySelector('[data-line-body]')
        const grains = row.querySelectorAll('[data-grain]')
        tl.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8 }, at)
          .fromTo(
            body,
            { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0.2 },
            { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 0.7 },
            at + 0.05
          )
          .fromTo(grains, { scale: 0 }, { scale: 1, duration: 0.25, stagger: 0.05 }, at + 0.55)
        if (glow && i < rows.length - 1) tl.to(glow, { opacity: 0, duration: 0.5 }, at + 1)
      })
      tl.to({}, { duration: 0.4 })
    })
    return () => mm.revert()
  }, [total, items])

  return (
    <section
      ref={sectionRef}
      data-after-hero
      aria-labelledby="tide-lines-title"
      className="bg-background relative w-full"
    >
      <div className="mx-auto grid min-h-[100svh] max-w-[1440px] grid-cols-12 content-center gap-x-6 gap-y-6 px-4 py-20 md:px-8 md:py-16">
        <div data-lines-intro className="col-span-12 lg:col-span-4">
          <p className="eyebrow text-muted-foreground">
            02 — Tide lines · <span ref={counterRef}>{String(total).padStart(2, '0')}</span> /{' '}
            {String(total).padStart(2, '0')}
          </p>
          <h2
            id="tide-lines-title"
            className="opsz-display mt-3 text-[2.6rem] leading-[0.95] font-light tracking-[-0.035em] md:text-[4.5rem]"
          >
            Each tide leaves a line.
          </h2>
          <p className="text-muted-foreground mt-4 hidden max-w-sm text-lg leading-snug md:block">
            Case studies, the most recent high water on top. Follow a line to read what shaped it.
          </p>
          <Link
            href="/work"
            className="text-foreground hover:text-oxide mt-5 hidden h-10 items-center gap-2 font-mono text-[0.8125rem] transition-colors duration-150 lg:inline-flex"
          >
            All case studies
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </Link>
          {/* High-water mark: the period of the line currently being laid down */}
          <p aria-hidden="true" className="mt-16 hidden lg:block">
            <span className="eyebrow text-muted-foreground block">High water</span>
            <span
              ref={periodRef}
              className="opsz-display text-clay mt-1 block text-[5.5rem] leading-[0.9] font-light tracking-[-0.04em] whitespace-nowrap italic tabular-nums"
            >
              {items[0]?.period}
            </span>
          </p>
        </div>

        <ol className="col-span-12 lg:col-span-8">
          {items.map((item, i) => {
            const d = wavePath(i, 24)
            return (
              <li key={item.slug} data-line-row className="relative">
                <Link
                  href={`/work/${item.slug}`}
                  className="group relative block pt-3 pb-1 md:pt-4"
                  aria-label={`${item.title} (${item.period})`}
                >
                  <div
                    data-line-body
                    className="grid grid-cols-[4.75rem_1fr] items-baseline gap-x-4 md:grid-cols-[6rem_1fr_auto]"
                  >
                    <span className="text-muted-foreground font-mono text-xs tabular-nums">{item.period}</span>
                    <span className="opsz-headline group-hover:text-oxide text-[1.05rem] leading-tight tracking-[-0.01em] transition-colors duration-150 md:text-[1.45rem]">
                      {item.title}
                    </span>
                    <span className="eyebrow text-muted-foreground hidden md:inline">{item.role}</span>
                  </div>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 1000 24"
                    preserveAspectRatio="none"
                    className="mt-1 block h-5 w-full overflow-visible md:h-6"
                  >
                    <path
                      data-line-path
                      d={d}
                      pathLength={1}
                      fill="none"
                      className="stroke-foreground/25 group-hover:stroke-foreground/50 transition-[stroke] duration-150"
                      strokeWidth={1.25}
                      strokeDasharray="1"
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      data-line-path
                      data-line-glow
                      d={d}
                      pathLength={1}
                      fill="none"
                      className="stroke-oxide"
                      strokeWidth={1.5}
                      strokeDasharray="1"
                      vectorEffect="non-scaling-stroke"
                      style={{ opacity: i === 0 ? 1 : 0 }}
                    />
                  </svg>
                  {seededGrains(i, 6).map((g, k) => (
                    <span
                      key={k}
                      data-grain
                      aria-hidden="true"
                      className="bg-card shadow-border absolute bottom-2.5 block md:bottom-3"
                      style={{
                        left: `${g.x * 100}%`,
                        width: g.s,
                        height: g.s,
                        transform: `rotate(${g.r}deg)`,
                      }}
                    />
                  ))}
                </Link>
              </li>
            )
          })}
        </ol>
        <Link
          href="/work"
          className="text-foreground hover:text-oxide col-span-12 inline-flex h-10 items-center gap-2 font-mono text-[0.8125rem] transition-colors duration-150 lg:hidden"
        >
          All case studies
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
