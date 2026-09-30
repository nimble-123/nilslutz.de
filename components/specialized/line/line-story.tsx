'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { cn } from '@/lib/utils'
import { LineEngine, hexToRgb, type Segment } from './engine'
import {
  EXTENSIONS,
  TAU,
  easeInOut,
  extensionSegment,
  flat,
  lerp,
  mix,
  range,
  rolled,
  snapY,
  type Shape,
} from './geometry'
import { extensionLabels, type StudyMark } from './story-data'

/** Scroll choreography of the pinned story, in timeline progress (0 … 1). */
const P = {
  heroOut: 0.015,
  rollIn: [0.06, 0.34],
  coreIn: 0.35,
  extIn: [0.4, 0.49],
  coreOut: 0.56,
  unroll: [0.61, 0.8],
  timeIn: 0.8,
} as const

const PAD = 2
/** the one orchestrated page load happens once per visit */
let introPlayed = false

type Props = { marks: StudyMark[]; name: string; role: string }

export function LineStory({ marks, name, role }: Props) {
  const storyRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<LineEngine | null>(null)
  const [live, setLive] = useState(false)
  const [active, setActive] = useState(marks.length - 1)
  const pointerType = useRef('mouse')

  // 1 — decide presentation: WebGL line (live) or the static poster
  useEffect(() => {
    const root = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canvas = canvasRef.current
    if (reduced || !canvas) {
      root.dataset.line = 'static'
      return
    }
    let engine: LineEngine
    try {
      engine = new LineEngine(canvas, { mobile: window.matchMedia('(max-width: 767px), (pointer: coarse)').matches })
    } catch {
      root.dataset.line = 'static'
      return
    }
    engineRef.current = engine
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLive(true)
    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  // 2 — the live story: pinned scroll scenes, Lenis-synced ticker, pointer plucks
  useEffect(() => {
    const engine = engineRef.current
    const story = storyRef.current
    if (!live || !engine || !story) return
    gsap.registerPlugin(ScrollTrigger, SplitText)
    const root = document.documentElement
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const q = (sel: string) => document.querySelector<HTMLElement>(sel)

    // sizing
    let dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
      engine.resize(window.innerWidth, window.innerHeight, dpr)
    }
    resize()

    // ink follows the theme (exact inversion in dark mode)
    const readColors = () => {
      const cs = getComputedStyle(root)
      engine.setColors(hexToRgb(cs.getPropertyValue('--foreground')), hexToRgb(cs.getPropertyValue('--signal')))
    }
    readColors()
    const themeObserver = new MutationObserver(readColors)
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] })

    // the one orchestrated page load: a point, the line draws out, the name appears
    const intro = { i: 1 }
    const introItems = gsap.utils.toArray<HTMLElement>('.intro-item')
    const firstVisit = !introPlayed && window.scrollY < 10
    introPlayed = true
    if (firstVisit) {
      intro.i = 0
      gsap.set(introItems, { autoAlpha: 0, y: 6, filter: 'blur(4px)' })
    }
    root.dataset.line = 'live'
    const introTl = gsap.timeline({ paused: !firstVisit })
    if (firstVisit) {
      introTl
        .to(intro, { i: 1, duration: 1.7, ease: 'expo.inOut' }, 0.45)
        .to(
          introItems,
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', stagger: 0.1 },
          1.45
        )
        .set(introItems, { clearProps: 'filter' })
    }

    // scroll story
    let storyTl: gsap.core.Timeline | null = null
    let notesST: ScrollTrigger | null = null
    let contactST: ScrollTrigger | null = null
    let ctx: gsap.Context | null = null

    const build = () => {
      ctx = gsap.context(() => {
        const core = story.querySelector<HTMLElement>('[data-scene="core"]')!
        const time = story.querySelector<HTMLElement>('[data-scene="time"]')!
        gsap.set([core, time], { autoAlpha: 0 })

        const coreSplit = SplitText.create(story.querySelectorAll('[data-scene="core"] [data-split]'), {
          type: 'lines',
          mask: 'lines',
        })
        const timeSplit = SplitText.create(story.querySelectorAll('[data-scene="time"] [data-split]'), {
          type: 'lines',
          mask: 'lines',
        })

        const tl = gsap.timeline({ defaults: { ease: 'none' } })
        tl.to(story.querySelectorAll('.hero-copy'), { autoAlpha: 0, y: -8, duration: 0.05 }, P.heroOut)
          .to(core, { autoAlpha: 1, duration: 0.001 }, P.coreIn - 0.02)
          .from(core.querySelectorAll('.core-label'), { autoAlpha: 0, duration: 0.04 }, P.coreIn)
          .from(coreSplit.lines, { yPercent: 105, duration: 0.07, stagger: 0.018, ease: 'power3.out' }, P.coreIn + 0.01)
          .from(core.querySelectorAll('.core-center'), { autoAlpha: 0, duration: 0.04 }, P.coreIn + 0.02)
          .from(
            core.querySelectorAll('.core-ext'),
            { autoAlpha: 0, duration: 0.04, stagger: 0.015 },
            P.extIn[0] + 0.035
          )
          .to(coreSplit.lines, { yPercent: -105, duration: 0.04, stagger: 0.008, ease: 'power2.in' }, P.coreOut)
          .to(
            core.querySelectorAll('.core-label, .core-center, .core-ext'),
            { autoAlpha: 0, duration: 0.035 },
            P.coreOut
          )
          .to(core, { autoAlpha: 0, duration: 0.001 }, P.unroll[0])
          .to(time, { autoAlpha: 1, duration: 0.001 }, P.timeIn - 0.02)
          .from(timeSplit.lines, { yPercent: 105, duration: 0.06, stagger: 0.015, ease: 'power3.out' }, P.timeIn)
          .from(
            time.querySelectorAll('.tick-grow'),
            { scaleY: 0, duration: 0.05, stagger: 0.012, ease: 'power2.out' },
            P.timeIn + 0.02
          )
          .from(time.querySelectorAll('.time-fade'), { autoAlpha: 0, duration: 0.035, stagger: 0.003 }, P.timeIn + 0.04)
          .to({}, { duration: 0.001 }, 1)
        storyTl = tl

        ScrollTrigger.create({
          trigger: story,
          start: 'top top',
          end: () => '+=' + window.innerHeight * (mobile ? 4.5 : 5),
          pin: true,
          scrub: true,
          animation: tl,
          invalidateOnRefresh: true,
        })

        const rule = q('[data-anchor="rule"]')
        if (rule) notesST = ScrollTrigger.create({ trigger: rule, start: 'top bottom', end: 'top 62%' })
        const point = q('[data-anchor="point"]')
        if (point) contactST = ScrollTrigger.create({ trigger: point, start: 'top 88%', end: 'top 58%' })

        // the few statements outside the story reveal line by line, once
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 1.1,
                stagger: 0.09,
                ease: 'expo.out',
                scrollTrigger: { trigger: el, start: 'top 82%', once: true },
              }),
          })
        })
      })
    }

    let built = false
    let lastWidth = window.innerWidth
    let rebuildTimer = 0
    const onResize = () => {
      resize()
      if (Math.abs(window.innerWidth - lastWidth) < 2) return
      lastWidth = window.innerWidth
      window.clearTimeout(rebuildTimer)
      rebuildTimer = window.setTimeout(() => {
        ctx?.revert()
        build()
        ScrollTrigger.refresh()
      }, 200)
    }
    window.addEventListener('resize', onResize)
    document.fonts.ready.then(() => {
      if (built) return
      built = true
      build()
      ScrollTrigger.refresh()
      introTl.play()
    })

    // anchors (DOM elements the line settles into)
    const anchor = {
      hero: story.querySelector<HTMLElement>('[data-anchor="hero-line"]')!,
      core: story.querySelector<HTMLElement>('[data-anchor="core"]')!,
      axis: story.querySelector<HTMLElement>('[data-anchor="axis"]')!,
      rule: q('[data-anchor="rule"]'),
      point: q('[data-anchor="point"]'),
    }

    const segs: Segment[] = []
    const frameState = () => {
      const W = window.innerWidth
      const p = storyTl ? storyTl.progress() : 0
      const x0 = -PAD
      const x1 = W + PAD
      segs.length = 0
      let shape: Shape
      let pluckable = false

      const heroY = snapY(anchor.hero.getBoundingClientRect().top + 0.5, dpr)
      if (p <= P.rollIn[0]) {
        shape = flat(heroY, x0, x1)
        const i = intro.i
        shape.trimA = 0.5 - 0.5 * i
        shape.trimB = 0.5 + 0.5 * i
        shape.width = lerp(3, 1, range(i, 0, 0.35))
        pluckable = i >= 1 && p < 0.05
      } else {
        const c = anchor.core.getBoundingClientRect()
        const R = c.width / 2
        const cx = c.left + R
        const cy = c.top + R
        const travel = Math.max(TAU * R, x1 + 4 - cx)
        const axisY = snapY(anchor.axis.getBoundingClientRect().top + 0.5, dpr)
        if (p < P.rollIn[1]) {
          const r = easeInOut(range(p, P.rollIn[0], P.rollIn[1]))
          shape = rolled(r, cx, lerp(heroY, cy + R, r), R, x0, travel)
        } else if (p < P.unroll[0]) {
          shape = rolled(1, cx, cy + R, R, x0, travel)
          const out = range(p, P.coreOut, P.coreOut + 0.04)
          EXTENSIONS.forEach((e, k) => {
            const grow = easeInOut(range(p, P.extIn[0] + k * 0.015, P.extIn[1] - 0.03 + k * 0.015)) * (1 - out)
            segs.push(extensionSegment(cx, cy, R, e.deg, grow))
          })
          pluckable = p > P.coreIn + 0.02 && p < P.coreOut
        } else if (p < P.unroll[1]) {
          const u = easeInOut(range(p, P.unroll[0], P.unroll[1]))
          shape = rolled(1 - u, cx, lerp(cy + R, axisY, u), R, x0, travel)
        } else {
          shape = rolled(0, cx, axisY, R, x0, travel)
          pluckable = true
        }
      }

      let signal = 0
      const n = notesST?.progress ?? 0
      if (n > 0 && anchor.rule) {
        const r = anchor.rule.getBoundingClientRect()
        const ruleShape = flat(snapY(r.top + 0.5, dpr), r.left, r.right)
        const cBlend = contactST?.progress ?? 0
        if (cBlend > 0 && anchor.point) {
          const d = anchor.point.getBoundingClientRect()
          const px = d.left + d.width / 2
          const py = d.top + d.height / 2
          const e = easeInOut(cBlend)
          shape = mix(ruleShape, flat(py, px, px), e)
          shape.width = lerp(1, 6, range(cBlend, 0.82, 1))
          signal = range(cBlend, 0.9, 1)
          pluckable = false
        } else {
          const e = easeInOut(n)
          shape = mix(shape, ruleShape, e)
          pluckable = n >= 1
        }
      }
      // straight hairlines sit exactly on a device-pixel row
      if (shape.roll <= 0) shape.ay = snapY(shape.ay, dpr)
      return { shape, segments: segs, signal, pluckable }
    }

    const tick = (_time: number, deltaTime: number) => {
      engine.frame(Math.min(deltaTime, 50) / 1000, frameState())
    }
    gsap.ticker.add(tick)

    // mouse / pen: crossing the line catches it
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      engine.pointerMove(e.clientX, e.clientY)
    }
    const onLeave = () => engine.pointerLeave()
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.clearTimeout(rebuildTimer)
      themeObserver.disconnect()
      introTl.kill()
      ctx?.revert()
      gsap.set(introItems, { clearProps: 'all' })
    }
  }, [live])

  // touch: a thin band over the hero line lets a finger catch and pluck it
  const band = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse') return
      if (engineRef.current?.touchDown(e.clientX, e.clientY)) e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse') return
      engineRef.current?.pointerMove(e.clientX, e.clientY)
    },
    onPointerUp: () => engineRef.current?.touchUp(),
    onPointerCancel: () => engineRef.current?.touchUp(),
  }

  const scene = live ? 'absolute inset-0' : 'relative h-svh'
  const current = marks[active]
  const lastYear = Math.max(...marks.map((m) => Number(m.period.match(/\d{4}/g)?.pop() ?? m.start)))

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 size-full" />
      <section
        ref={storyRef}
        aria-label="Introduction"
        className={cn(
          'relative [--R:25vw] [--cx:40%] [--cy:33%] [--yA:60%] [--yH:60%]',
          'md:[--R:clamp(7rem,20vmin,12.5rem)] md:[--cx:50%] md:[--cy:47%] md:[--yA:62%] md:[--yH:62%]',
          live && 'h-svh overflow-hidden'
        )}
      >
        {/* ── Hero: the name, set small, above one full-width hairline ─────────── */}
        <div data-scene="hero" className={cn(scene, 'min-h-[32rem]')}>
          <div className="hero-copy frame absolute inset-x-0" style={{ top: 'calc(var(--yH) - 3.75rem)' }}>
            <h1 className="intro-item text-[0.8125rem] leading-5 font-medium tracking-[-0.005em]">{name}</h1>
            <p className="intro-item text-muted-foreground text-[0.8125rem] leading-5">{role}</p>
          </div>
          <div
            data-anchor="hero-line"
            className="line-fallback bg-foreground absolute inset-x-0 h-px"
            style={{ top: 'var(--yH)' }}
          />
          {live && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 h-10 -translate-y-1/2 touch-none"
              style={{ top: 'var(--yH)' }}
              {...band}
            />
          )}
        </div>

        {/* ── Clean Core: the line rolls itself into a circle ─────────────────── */}
        <div data-scene="core" className={cn(scene, 'min-h-[40rem]')}>
          <div
            className="line-fallback bg-foreground absolute left-0 h-px"
            style={{ top: 'calc(var(--cy) + var(--R))', width: 'var(--cx)' }}
          />
          <div
            data-anchor="core"
            className="absolute"
            style={{
              left: 'calc(var(--cx) - var(--R))',
              top: 'calc(var(--cy) - var(--R))',
              width: 'calc(var(--R) * 2)',
              height: 'calc(var(--R) * 2)',
            }}
          >
            <svg
              className="line-fallback text-foreground absolute inset-0 size-full overflow-visible"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {extensionLabels.map((e) => (
                <line
                  key={e.label}
                  x1={e.x0}
                  y1={e.y0}
                  x2={e.x1}
                  y2={e.y1}
                  stroke="currentColor"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <span className="core-center label absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              S/4HANA
            </span>
            {extensionLabels.map((e) => (
              <span
                key={e.label}
                className="core-ext label text-foreground absolute whitespace-nowrap"
                style={{
                  left: `${e.x1}%`,
                  top: `${e.y1}%`,
                  transform: `translate(calc(${e.tx >= 0 ? '0%' : '-100%'} + ${(e.tx * 8).toFixed(1)}px), calc(${
                    e.ty < -0.3 ? '-100%' : e.ty > 0.3 ? '0%' : '-50%'
                  } + ${(e.ty * 8).toFixed(1)}px))`,
                }}
              >
                {e.label}
              </span>
            ))}
          </div>
          <div
            className={cn(
              'absolute left-(--gutter) w-[min(19rem,calc(100%-2*var(--gutter)))]',
              'top-[calc(var(--cy)+var(--R)+2.75rem)] md:top-[calc(var(--cy)-var(--R))]'
            )}
          >
            <h2 className="core-label label">Clean Core</h2>
            <p data-split className="mt-3 text-[0.9375rem] leading-[1.6] tracking-[-0.005em]">
              Strict separation of standard and custom code. Extensions run side-by-side on BTP, or via released APIs
              on-stack.
            </p>
          </div>
        </div>

        {/* ── Work: the circle unrolls into a time axis ───────────────────────── */}
        <div data-scene="time" className={cn(scene, 'min-h-[40rem]')}>
          <div className="frame absolute inset-x-0 top-[calc(var(--yA)-18rem)] md:top-[calc(var(--yA)-15rem)]">
            <div className="grid-line gap-y-6">
              <div className="col-span-2 md:col-span-1">
                <h2 className="label">
                  <span data-split className="block">
                    Case studies, {marks[0]?.start}–{lastYear}
                  </span>
                </h2>
              </div>
              <div className="time-fade col-span-2 min-h-[8.5rem]" aria-live="polite">
                <AnimatePresence mode="popLayout" initial={false}>
                  {current && (
                    <motion.div
                      key={current.slug}
                      initial={{ opacity: 0, y: 4, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -4, filter: 'blur(2px)', transition: { duration: 0.12, ease: 'easeOut' } }}
                      transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                    >
                      <p className="label tabular-nums">
                        {current.period} · {current.role}
                      </p>
                      <p className="text-muted-foreground mt-2 line-clamp-3 max-w-[34rem]">{current.summary}</p>
                      <Link
                        href={`/work/${current.slug}`}
                        className="ink-link mt-3 inline-block text-[0.8125rem]"
                        aria-label={`Read case study: ${current.title}`}
                      >
                        Read the case study
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="time-fade hidden justify-self-end md:block">
                <Link href="/work" className="ink-link label hover:text-foreground">
                  All case studies
                </Link>
              </div>
            </div>
          </div>

          <div
            data-anchor="axis"
            className="line-fallback bg-foreground absolute inset-x-0 h-px"
            style={{ top: 'var(--yA)' }}
          />
          <ol
            aria-label="Case studies timeline"
            className="absolute inset-x-[calc(var(--gutter)+0.5rem)] h-0"
            style={{ top: 'var(--yA)' }}
          >
            {marks.map((m, i) => {
              const isActive = i === active
              const showYear = i === 0 || marks[i - 1].start !== m.start
              const leftHalf = i < marks.length / 2
              return (
                <li
                  key={m.slug}
                  className="absolute top-0"
                  style={{ left: `${(i / Math.max(1, marks.length - 1)) * 100}%` }}
                >
                  <Link
                    href={`/work/${m.slug}`}
                    className="absolute bottom-0 left-0 flex h-14 w-11 -translate-x-1/2 items-end justify-center"
                    onPointerDown={(e) => (pointerType.current = e.pointerType)}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={(e) => {
                      // first tap on touch selects, second tap opens
                      if (pointerType.current !== 'mouse' && !isActive) {
                        e.preventDefault()
                        setActive(i)
                      }
                    }}
                  >
                    <span className="tick-grow block origin-bottom">
                      <motion.span
                        className="bg-foreground block h-3 w-px origin-bottom"
                        initial={false}
                        animate={{ scaleY: isActive ? 3 : 1 }}
                        transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.2 }}
                      />
                    </span>
                    <span className="sr-only">
                      {m.title}, {m.period}
                    </span>
                  </Link>
                  {showYear && (
                    <span className="time-fade label absolute top-3 -translate-x-1/2 tabular-nums">{m.start}</span>
                  )}
                  <span className="time-fade">
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.span
                          aria-hidden="true"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.12 } }}
                          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                          className={cn(
                            'pointer-events-none absolute bottom-[3.25rem] w-max max-w-[min(22rem,70vw)] text-[0.8125rem] leading-5 text-balance',
                            leftHalf ? 'left-0 -ml-px' : 'right-0 -mr-px text-right'
                          )}
                        >
                          {m.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                </li>
              )
            })}
          </ol>
          <div className="time-fade frame absolute inset-x-0 top-[calc(var(--yA)+3.5rem)] md:hidden">
            <Link href="/work" className="ink-link label">
              All case studies
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
