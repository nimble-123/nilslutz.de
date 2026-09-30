'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'
import type { TideEngine } from './tide-engine'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * The hero IS water: a GPU height-field over a clay bed with the name carved
 * into it. Scrolling drains the tide; salt crystallises on the drying clay.
 */
export function TideHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gaugeRef = useRef<HTMLSpanElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches

    let engine: TideEngine | null = null
    let disposed = false
    let visible = true
    let pageVisible = document.visibilityState === 'visible'
    let ready = false
    const cleanups: Array<() => void> = []

    const ctx = gsap.context(() => {}, section)

    const renderOnce = () => engine && ready && engine.render(1 / 60)

    const tick = (_time: number, deltaMs: number) => {
      if (!engine || !ready || !pageVisible) return
      const r = section.getBoundingClientRect()
      visible = r.bottom > 0 && r.top < window.innerHeight
      if (!visible) return
      engine.render(deltaMs / 1000)
    }

    const setGauge = (p: number) => {
      if (gaugeRef.current) gaugeRef.current.textContent = String(Math.round(p * 100)).padStart(2, '0')
    }

    let played = false
    /** The one orchestrated page load: water settles, then the copy arrives. */
    const playIntro = (eng: TideEngine | null) => {
      if (reduced) return
      if (played) {
        if (eng) eng.intro = 1
        return
      }
      played = true
      ctx.add(() => {
        gsap.set('[data-hero-line]', { visibility: 'visible' })
        const split = SplitText.create('[data-hero-line]', { type: 'lines', mask: 'lines' })
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        if (eng) {
          tl.to(eng, { intro: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
            .call(() => eng.disturb(0.5, 0.53, 0.5, 0.53, 0.07, 0.06), [], 0.35)
            .call(() => eng.disturb(0.36, 0.47, 0.36, 0.47, 0.03, 0.025), [], 0.9)
        }
        const t0 = eng ? 0.9 : 0.1
        tl.fromTo(
          '[data-hero-eyebrow]',
          { autoAlpha: 0, y: 12, filter: 'blur(4px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6 },
          t0
        )
          .from(split.lines, { yPercent: 100, duration: 0.9, stagger: 0.1 }, t0 + 0.1)
          .fromTo(
            '[data-hero-chunk]',
            { autoAlpha: 0, y: 12, filter: 'blur(4px)' },
            { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.1, clearProps: 'filter' },
            t0 + 0.4
          )
      })
    }
    const safety = window.setTimeout(() => playIntro(null), 2500)
    cleanups.push(() => window.clearTimeout(safety))

    const start = async () => {
      let mod: typeof import('./tide-engine')
      try {
        mod = await import('./tide-engine')
      } catch {
        setFallback(true)
        playIntro(null)
        return
      }
      if (disposed) return
      const fontFamily =
        getComputedStyle(document.documentElement).getPropertyValue('--font-fraunces').trim() || 'Georgia, serif'
      try {
        engine = new mod.TideEngine({ canvas, fontFamily, mobile, reducedMotion: reduced })
      } catch {
        setFallback(true)
        playIntro(null)
        return
      }

      const dark = document.documentElement.classList.contains('dark') ? 1 : 0
      engine.dark = engine.darkTarget = dark

      const rect = section.getBoundingClientRect()
      await engine.resize(rect.width, rect.height)
      if (disposed) return
      ready = true
      ;(window as unknown as { __tide?: unknown }).__tide = { engine, flags: () => ({ visible, pageVisible, ready }) }

      // Theme → shader palette
      const mo = new MutationObserver(() => {
        if (!engine) return
        engine.darkTarget = document.documentElement.classList.contains('dark') ? 1 : 0
        if (reduced) {
          engine.dark = engine.darkTarget
          renderOnce()
        }
      })
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      cleanups.push(() => mo.disconnect())

      // Resize (width changes only matter on mobile; svh keeps height stable)
      let lastW = rect.width
      let lastH = rect.height
      let resizeTimer = 0
      const ro = new ResizeObserver((entries) => {
        const r = entries[0].contentRect
        if (Math.abs(r.width - lastW) < 2 && Math.abs(r.height - lastH) < 80) return
        lastW = r.width
        lastH = r.height
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(async () => {
          if (!engine) return
          await engine.resize(r.width, r.height)
          if (reduced) renderOnce()
        }, 150)
      })
      ro.observe(section)
      cleanups.push(() => {
        ro.disconnect()
        window.clearTimeout(resizeTimer)
      })

      if (reduced) {
        // A single calm frame: tide half out, a little salt.
        engine.intro = 1
        engine.tide = engine.tideTarget = 0.5
        renderOnce()
        setGauge(0.5)
        return
      }

      // Pause when the tab is hidden; offscreen is checked per tick (the pin reparents the
      // section, which makes IntersectionObserver unreliable here).
      const onVis = () => (pageVisible = document.visibilityState === 'visible')
      document.addEventListener('visibilitychange', onVis)
      cleanups.push(() => document.removeEventListener('visibilitychange', onVis))

      gsap.ticker.add(tick)
      cleanups.push(() => gsap.ticker.remove(tick))

      // Pointer / touch → ripples
      let last: { x: number; y: number; t: number } | null = null
      const toUv = (clientX: number, clientY: number) => {
        const r = canvas.getBoundingClientRect()
        return { x: (clientX - r.left) / r.width, y: 1 - (clientY - r.top) / r.height }
      }
      const move = (clientX: number, clientY: number) => {
        if (!engine) return
        const p = toUv(clientX, clientY)
        engine.setPointer(p.x, p.y)
        const now = performance.now()
        if (last && now - last.t < 120) {
          const dist = Math.hypot(p.x - last.x, p.y - last.y)
          const strength = Math.min(0.02, 0.004 + dist * 0.25)
          engine.disturb(last.x, last.y, p.x, p.y, mobile ? 0.03 : 0.022, strength)
        }
        last = { x: p.x, y: p.y, t: now }
      }
      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return
        move(e.clientX, e.clientY)
      }
      const onPointerDown = (e: PointerEvent) => {
        if (!engine) return
        const p = toUv(e.clientX, e.clientY)
        engine.disturb(p.x, p.y, p.x, p.y, 0.04, 0.035)
      }
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0]
        if (t) move(t.clientX, t.clientY)
      }
      const onLeave = () => {
        last = null
        engine?.setPointer(-10, -10)
      }
      section.addEventListener('pointermove', onPointerMove)
      section.addEventListener('pointerdown', onPointerDown)
      section.addEventListener('pointerleave', onLeave)
      section.addEventListener('touchstart', onTouch, { passive: true })
      section.addEventListener('touchmove', onTouch, { passive: true })
      section.addEventListener('touchend', onLeave, { passive: true })
      cleanups.push(() => {
        section.removeEventListener('pointermove', onPointerMove)
        section.removeEventListener('pointerdown', onPointerDown)
        section.removeEventListener('pointerleave', onLeave)
        section.removeEventListener('touchstart', onTouch)
        section.removeEventListener('touchmove', onTouch)
        section.removeEventListener('touchend', onLeave)
      })

      engine.tide = engine.tideTarget = progress
      playIntro(engine)
    }

    // ---- scroll: the tide goes out. Created synchronously so later pins measure after it.
    let progress = 0
    if (!reduced) {
      ctx.add(() => {
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: '+=180%',
              pin: true,
              scrub: true,
              onUpdate: (self) => {
                progress = self.progress
                if (engine) engine.tideTarget = progress
                setGauge(progress)
              },
            },
          })
          .to('[data-hero-hint]', { autoAlpha: 0, duration: 0.08 }, 0)
          .to('[data-hero-copy]', { autoAlpha: 0, y: -32, duration: 0.2 }, 0.45)
          .fromTo('[data-hero-after]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.2 }, 0.72)
          .to({}, { duration: 0.08 })
      })
    }

    start()

    return () => {
      disposed = true
      ctx.revert()
      cleanups.forEach((fn) => fn())
      engine?.dispose()
      engine = null
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className={cn(
        'relative h-[100svh] min-h-[560px] w-full touch-pan-y overflow-hidden select-none',
        fallback && 'bg-[linear-gradient(180deg,var(--clay)_0%,var(--slate)_100%)]'
      )}
    >
      <canvas ref={canvasRef} aria-hidden="true" className={cn('absolute inset-0 size-full', fallback && 'hidden')} />

      {/* The wordmark lives in the water texture; this is its accessible twin (visible if WebGL is unavailable). */}
      <h1
        id="hero-title"
        className={cn(
          fallback
            ? 'opsz-display text-salt absolute inset-x-0 top-[38%] text-center text-[18vw] leading-none font-normal italic md:text-[14vw]'
            : 'sr-only'
        )}
      >
        {profile.name}
        <span className="sr-only"> — {profile.role}</span>
      </h1>

      {/* soft scrims so the header and copy read over moving water */}
      <div
        aria-hidden="true"
        className="from-background/70 pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent"
      />
      <div
        aria-hidden="true"
        className="from-background/80 via-background/35 pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t to-transparent"
      />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-4 pb-8 md:px-8 md:pb-12">
        <div className="grid grid-cols-12 items-end gap-6">
          <div data-hero-copy className="pointer-events-auto col-span-12 md:col-span-7 lg:col-span-6">
            <p data-hero-eyebrow className="eyebrow text-muted-foreground mb-4">
              {profile.role} · {profile.location}
            </p>
            <p
              data-hero-line
              className="opsz-headline text-foreground text-[1.45rem] leading-[1.18] tracking-[-0.01em] md:text-[2rem]"
            >
              I architect <em className="text-oxide font-normal">Clean-Core</em>&nbsp;compliant SAP solutions on BTP,
              CAP, RAP &amp; Fiori — and set the standards they run on.
            </p>
            <div data-hero-chunk className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/work"
                className="bg-foreground text-background inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-5 font-mono text-[0.8125rem] transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
              >
                {profile.ctas.primary}
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="bg-background/70 text-foreground shadow-border hover:shadow-border-hover inline-flex h-11 items-center rounded-full px-5 font-mono text-[0.8125rem] backdrop-blur-sm transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
              >
                {profile.ctas.secondary}
              </Link>
            </div>
          </div>

          <div
            data-hero-chunk
            className="col-span-12 flex items-end justify-between gap-6 md:col-span-5 md:flex-col md:items-end lg:col-span-6"
          >
            <p className="eyebrow text-muted-foreground shrink-0 whitespace-nowrap tabular-nums md:text-right">
              Ebb <span ref={gaugeRef}>00</span>%
            </p>
            <p data-hero-hint className="eyebrow text-foreground/70 md:text-right">
              Touch the water · scroll to let the tide out
            </p>
          </div>
        </div>
      </div>

      <div
        data-hero-after
        className="pointer-events-none invisible absolute inset-x-0 bottom-20 mx-auto max-w-[1440px] px-4 opacity-0 md:bottom-14 md:px-8"
      >
        <p className="eyebrow text-muted-foreground">Low water</p>
        <p className="opsz-headline text-foreground mt-2 max-w-xl text-[1.6rem] leading-[1.15] md:text-[2.25rem]">
          What the tide leaves behind: lines of work, and a few notes.
        </p>
      </div>
    </section>
  )
}
