'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'
import type { TerrainHandle } from '@/components/webgl/terrain-canvas'

gsap.registerPlugin(SplitText)

const TerrainCanvas = dynamic(() => import('@/components/webgl/terrain-canvas').then((m) => m.TerrainCanvas), {
  ssr: false,
})

const TICKS = Array.from({ length: 13 }, (_, i) => i)

export function TerrainHero() {
  const rootRef = useRef<HTMLElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const crosshairRef = useRef<HTMLDivElement>(null)
  const terrainRef = useRef<TerrainHandle>(null)
  const [webgl, setWebgl] = useState<'pending' | 'ok' | 'none'>('pending')
  const introStarted = useRef(false)

  // The one orchestrated page load: frame → marginalia → role → tagline lines → actions.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const split = new SplitText('[data-hero-tagline]', { type: 'lines', linesClass: 'block' })
      gsap.set('[data-hero-tagline]', { opacity: 1 })
      const enter = { opacity: 1, y: 0, filter: 'blur(0px)', ease: 'power2.out', duration: 0.7 }

      const tl = gsap.timeline({ delay: 0.15 })
      tl.fromTo(
        '[data-neatline-x]',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.08 },
        0
      )
        .fromTo(
          '[data-neatline-y]',
          { scaleY: 0 },
          { scaleY: 1, duration: 1.4, ease: 'power3.inOut', stagger: 0.08 },
          0
        )
        .fromTo('[data-hero-meta]', { opacity: 0, y: 8, filter: 'blur(4px)' }, { ...enter, stagger: 0.1 }, 0.5)
        .fromTo('[data-hero-role]', { opacity: 0, y: 12, filter: 'blur(4px)' }, enter, 1.2)
        .fromTo(split.lines, { opacity: 0, y: 12, filter: 'blur(4px)' }, { ...enter, stagger: 0.1 }, 1.32)
        .fromTo('[data-hero-action]', { opacity: 0, y: 12, filter: 'blur(4px)' }, { ...enter, stagger: 0.1 }, 1.6)
        .fromTo('[data-hero-late]', { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.1 }, 2.1)
    }, root)

    return () => ctx.revert()
  }, [])

  const onSupport = (ok: boolean) => {
    setWebgl(ok ? 'ok' : 'none')
    if (ok && !introStarted.current) {
      introStarted.current = true
      terrainRef.current?.intro()
    }
  }

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      className="relative isolate h-[100svh] min-h-[600px] w-full touch-pan-y overflow-hidden"
    >
      {/* the living terrain */}
      <TerrainCanvas
        mode="hero"
        wordmark={profile.name}
        seed={1.3}
        levels={15}
        scale={3.4}
        className={cn(
          'absolute inset-0 -z-10 transition-opacity duration-700 ease-out',
          webgl === 'ok' ? 'opacity-100' : 'opacity-0'
        )}
        readoutRef={readoutRef}
        crosshairRef={crosshairRef}
        handleRef={terrainRef}
        onSupport={onSupport}
      />
      {webgl === 'none' && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[url('/strata/hero-poster.webp')] bg-cover bg-center opacity-90 dark:opacity-35 dark:invert"
        />
      )}

      {/* survey crosshair following the cursor */}
      <div
        ref={crosshairRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-0 opacity-0 transition-opacity duration-200"
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <span className="bg-foreground/70 absolute top-1/2 left-1/2 h-px w-7 -translate-x-1/2" />
          <span className="bg-foreground/70 absolute top-1/2 left-1/2 h-7 w-px -translate-y-1/2" />
          <span className="border-foreground/70 block size-3 rounded-full border bg-transparent" />
        </div>
      </div>

      {/* neatline: the map frame with graticule ticks */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 md:inset-5">
        <span data-neatline-x className="bg-foreground/80 absolute inset-x-0 top-0 h-px origin-left" />
        <span data-neatline-x className="bg-foreground/80 absolute inset-x-0 bottom-0 h-px origin-right" />
        <span data-neatline-y className="bg-foreground/80 absolute inset-y-0 left-0 w-px origin-top" />
        <span data-neatline-y className="bg-foreground/80 absolute inset-y-0 right-0 w-px origin-bottom" />
        <div className="absolute inset-x-0 top-0 hidden justify-between px-[4%] md:flex" data-hero-late>
          {TICKS.map((i) => (
            <span key={i} className={cn('bg-foreground/60 w-px', i % 4 === 0 ? 'h-2.5' : 'h-1.5')} />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 hidden items-end justify-between px-[4%] md:flex" data-hero-late>
          {TICKS.map((i) => (
            <span key={i} className={cn('bg-foreground/60 w-px', i % 4 === 0 ? 'h-2.5' : 'h-1.5')} />
          ))}
        </div>
      </div>

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-7 pt-20 pb-8 md:px-12 md:pt-24 md:pb-12">
        {/* sheet marginalia */}
        <div className="marginalia text-muted-foreground flex items-start justify-between gap-6">
          <p data-hero-reveal data-hero-meta className="max-w-[16rem]">
            Sheet 01 — nilslutz.de
            <br />
            <span className="text-foreground">Topographic survey of a practice</span>
          </p>
          <p data-hero-reveal data-hero-meta className="hidden text-right sm:block">
            Scale 1:25 000 · Contour interval 10 m
            <br />
            Datum: Clean Core · Relief by hand
          </p>
        </div>

        <h1
          id="hero-title"
          className={cn(
            webgl === 'none'
              ? 'font-display mt-[18vh] text-[clamp(3.5rem,14vw,11rem)] leading-[0.9] font-bold tracking-[-0.045em]'
              : 'sr-only'
          )}
        >
          {profile.name}
        </h1>

        <div className="mt-auto grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p
              data-hero-reveal
              data-hero-role
              className="font-display text-ochre-ink mb-3 inline-flex items-center gap-2 text-sm font-medium tracking-[-0.005em] md:text-base"
            >
              <svg width="12" height="11" viewBox="0 0 12 11" aria-hidden="true">
                <path d="M6 1 L11 10 H1 Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="6" cy="7" r="1.2" fill="currentColor" />
              </svg>
              {profile.role}
            </p>
            <p
              data-hero-reveal
              data-hero-tagline
              className="max-w-[34rem] font-serif text-[1.35rem] leading-[1.35] tracking-[-0.005em] md:text-[1.7rem]"
            >
              I architect <em className="text-primary">Clean-Core</em> compliant SAP solutions on BTP, CAP, RAP and
              Fiori — and set the standards they run on.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/work"
                data-hero-reveal
                data-hero-action
                className="btn bg-foreground text-background pr-3.5 pl-4 hover:bg-[color-mix(in_oklab,var(--foreground)_88%,var(--ochre))]"
              >
                {profile.ctas.primary}
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                data-hero-reveal
                data-hero-action
                className="btn shadow-border hover:shadow-border-hover bg-[color-mix(in_oklab,var(--background)_70%,transparent)] backdrop-blur-sm"
              >
                {profile.ctas.secondary}
              </Link>
            </div>
          </div>

          <div className="hidden flex-col items-end gap-2 text-right lg:col-span-5 lg:flex">
            <p data-hero-reveal data-hero-late className="marginalia text-muted-foreground">
              Move across the sheet to raise the terrain · press to push harder
            </p>
            <span
              ref={readoutRef}
              data-hero-reveal
              data-hero-late
              className="marginalia text-foreground bg-[color-mix(in_oklab,var(--background)_75%,transparent)] px-1 whitespace-pre tabular-nums"
              aria-hidden="true"
            >
              N 53°08′17″ E 08°12′49″ · UPLIFT +000 M
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-6 md:mt-10">
          <p data-hero-reveal data-hero-late className="marginalia text-muted-foreground min-w-0 lg:hidden">
            Touch to raise the terrain
          </p>
          <a
            href="#strata"
            data-hero-reveal
            data-hero-late
            className="marginalia text-muted-foreground hover:text-foreground ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 transition-colors lg:mx-auto"
          >
            <span className="sm:hidden">Descend</span>
            <span className="hidden sm:inline">Descend through the strata</span>
            <ArrowDown className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
