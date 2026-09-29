'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { strata } from '@/content/strata'
import { cn } from '@/lib/utils'
import { StrataSwatch } from '@/components/ui/strata-swatch'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pinned scene: the map sheet tilts into a block diagram and the column
 * separates stratum by stratum — Fiori/UI5 → CAP/RAP → BTP → Clean Core bedrock.
 */
export function StrataSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const progressRef = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(-1)
  const [reduced, setReduced] = useState(false)
  const [webgl, setWebgl] = useState(true)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduced(isReduced)

    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const [{ createStrataBlock }, { onThemeChange, hasWebGL }] = await Promise.all([
        import('@/components/webgl/strata-block'),
        import('@/components/webgl/palette'),
      ])
      if (disposed) return
      if (!hasWebGL()) {
        setWebgl(false)
        return
      }
      const block = createStrataBlock(stage)
      if (!block) {
        setWebgl(false)
        return
      }

      let target = isReduced ? 1 : 0
      let current = target
      let dirty = true
      let lastActive = -2

      const updateLeader = () => {
        const path = pathRef.current
        const dot = dotRef.current
        const idx = Math.min(3, Math.max(0, Math.floor(((current - 0.28) / 0.68) * 4)))
        const show = !isReduced && current > 0.3 && current < 0.995
        if (!path || !dot) return
        const item = itemRefs.current[idx]
        if (!show || !item) {
          path.style.opacity = '0'
          dot.style.opacity = '0'
          return
        }
        const a = block.anchor(idx)
        const sr = stage.getBoundingClientRect()
        const ir = item.getBoundingClientRect()
        const narrow = sr.width / sr.height < 0.9
        let d: string
        if (narrow) {
          const ty = (item.closest('ol') ?? item).getBoundingClientRect().top - sr.top
          d = `M${a.x},${a.y} L${a.x + 16},${a.y} L${a.x + 16},${ty}`
        } else {
          const tx = ir.left - sr.left - 12
          const ty = ir.top - sr.top + 22
          const bend = Math.max(a.x + 28, tx - 60)
          d = `M${a.x},${a.y} L${bend},${a.y} L${tx - 16},${ty} L${tx},${ty}`
        }
        path.setAttribute('d', d)
        dot.setAttribute('cx', String(a.x))
        dot.setAttribute('cy', String(a.y))
        path.style.opacity = '1'
        dot.style.opacity = '1'
      }

      const syncActive = () => {
        const idx = current < 0.28 ? -1 : Math.min(3, Math.floor(((current - 0.28) / 0.68) * 4))
        const next = isReduced ? -1 : idx
        if (next !== lastActive) {
          lastActive = next
          setActive(next)
        }
        if (progressRef.current) {
          progressRef.current.textContent = String(Math.round(current * 1200)).padStart(4, '0')
        }
      }

      const tick = (_t: number, deltaTime: number) => {
        const dt = Math.min(deltaTime / 1000, 0.05)
        const k = 1 - Math.exp(-dt * 9)
        if (Math.abs(target - current) > 0.0004) {
          current += (target - current) * k
          dirty = true
        } else if (current !== target) {
          current = target
          dirty = true
        }
        if (!dirty) return
        dirty = false
        block.setProgress(current)
        block.render()
        syncActive()
        updateLeader()
      }

      let running = false
      const start = () => {
        if (running) return
        running = true
        gsap.ticker.add(tick)
      }
      const stop = () => {
        if (!running) return
        running = false
        gsap.ticker.remove(tick)
      }

      let st: ScrollTrigger | null = null
      if (!isReduced) {
        st = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3.4}`,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            target = self.progress
          },
          onToggle: (self) => {
            if (self.isActive) start()
          },
        })
      }

      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            dirty = true
            start()
          } else stop()
        },
        { rootMargin: '200px' }
      )
      io.observe(section)

      const ro = new ResizeObserver(() => {
        block.resize()
        dirty = true
      })
      ro.observe(stage)
      const offTheme = onThemeChange(() => {
        block.applyTheme()
        dirty = true
        start()
      })

      block.setProgress(current)
      block.render()
      syncActive()
      ScrollTrigger.refresh()

      cleanup = () => {
        stop()
        st?.kill()
        io.disconnect()
        ro.disconnect()
        offTheme()
        block.dispose()
      }
    })()

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="strata"
      aria-labelledby="strata-title"
      className={cn(
        'relative w-full overflow-hidden',
        reduced ? 'h-auto lg:h-[100svh] lg:min-h-[640px]' : 'h-[100svh] min-h-[640px]'
      )}
    >
      <div
        ref={stageRef}
        className={cn(reduced ? 'relative h-[56svh] lg:absolute lg:inset-0 lg:h-auto' : 'absolute inset-0')}
      />

      {!webgl && (
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center p-10 lg:justify-start">
          <div className="flex w-full max-w-md flex-col lg:ml-[12%]">
            {strata.map((s) => (
              <StrataSwatch key={s.numeral} pattern={s.pattern} className="h-20 w-full" />
            ))}
          </div>
        </div>
      )}

      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <path
          ref={pathRef}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="1"
          style={{ opacity: 0, transition: 'opacity 200ms ease-out' }}
        />
        <circle
          ref={dotRef}
          r="3.5"
          fill="var(--background)"
          stroke="var(--foreground)"
          strokeWidth="1.2"
          style={{ opacity: 0, transition: 'opacity 200ms ease-out' }}
        />
      </svg>

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1400px] flex-col px-5 pt-20 pb-6 md:px-8 md:pt-24 lg:pb-10">
        <div className="max-w-md">
          <p className="marginalia text-muted-foreground">II · Section A–A′ · Borehole NL-1</p>
          <h2
            id="strata-title"
            className="font-display mt-2 text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.02] font-semibold tracking-[-0.03em]"
          >
            A cross-section
            <br />
            of the practice
          </h2>
          <p className="text-muted-foreground mt-3 hidden max-w-[19rem] font-serif text-lg leading-snug text-pretty md:block">
            Every solution sits on something. Read the column from the surface people touch down to the bedrock it rests
            on.
          </p>
        </div>

        <ol
          className={cn(
            'pointer-events-auto mt-auto w-full space-y-1 lg:absolute lg:top-1/2 lg:right-8 lg:mt-0 lg:w-[min(28rem,33vw)] lg:-translate-y-1/2',
            'bg-[color-mix(in_oklab,var(--background)_86%,transparent)] max-lg:rounded-[15px] max-lg:bg-[color-mix(in_oklab,var(--background)_94%,transparent)] max-lg:p-3 max-lg:shadow-[var(--shadow-border)]'
          )}
        >
          {strata.map((s, i) => {
            const isActive = reduced || active === i
            const collapsedOnMobile = !reduced && active !== i && active !== -1
            return (
              <li
                key={s.numeral}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                data-active={isActive ? 'true' : 'false'}
                className={cn(
                  'group relative border-t border-[var(--rule)] py-3 transition-opacity duration-300 ease-out max-lg:border-t-0 max-lg:py-1',
                  isActive || active === -1 ? 'opacity-100' : 'opacity-45',
                  collapsedOnMobile && 'max-lg:hidden',
                  active === -1 && !reduced && 'max-lg:[&:not(:first-child)]:hidden'
                )}
              >
                <div className="flex items-center gap-3">
                  <StrataSwatch pattern={s.pattern} className="h-7 w-10 shrink-0 rounded-[3px]" />
                  <div className="min-w-0 flex-1">
                    <p className="marginalia text-muted-foreground">
                      {s.numeral} · {s.era} · <span className="tabular-nums">{s.depth}</span>
                    </p>
                    <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{s.name}</h3>
                  </div>
                </div>
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-[var(--ease-survey)]',
                    isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="text-muted-foreground pt-2 font-serif text-[1.02rem] leading-snug">{s.text}</p>
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 pt-2">
                      {s.stack.map((t) => (
                        <li key={t} className="marginalia text-foreground">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="marginalia text-muted-foreground mt-3 hidden items-center justify-between lg:absolute lg:bottom-8 lg:left-8 lg:flex lg:gap-4">
          <span>Depth</span>
          <span className="text-foreground tabular-nums">
            <span ref={progressRef}>0000</span> m
          </span>
        </div>
      </div>
    </section>
  )
}
