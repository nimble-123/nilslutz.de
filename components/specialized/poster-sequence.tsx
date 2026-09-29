'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getGsap } from '@/lib/motion/gsap'
import { getScrollVelocity, prefersReducedMotion } from '@/lib/motion/scroll'
import { cappedDpr, hasWebGL2, onThemeChange, readToken } from '@/lib/motion/webgl'
import { parseMetric } from '@/lib/metrics'
import { cn } from '@/lib/utils'
import { CoreMotif, EventMotif, SideBySideMotif } from '@/components/specialized/poster-motifs'
import type { PosterWipeEngine } from '@/components/specialized/poster-wipe-engine'

type Tone = 'base' | 'invert' | 'signal'

export type PosterService = { title: string; description: string; motif: 'core' | 'side' | 'events' }
export type PosterStudy = {
  slug: string
  title: string
  summary: string
  tags: string[]
  period: string
  role: string
  metrics?: string[]
}

const toneClass: Record<Tone, string> = {
  base: 'bg-background text-foreground',
  invert: 'bg-foreground text-background',
  signal: 'bg-signal text-ink',
}

const toneToken: Record<Tone, [string, string]> = {
  base: ['--background', '#f2f0ea'],
  invert: ['--foreground', '#121211'],
  signal: ['--signal', '#ff4a1c'],
}

const buttonTone: Record<Tone, string> = {
  base: 'bg-foreground text-background hover:bg-signal hover:text-ink',
  invert: 'bg-background text-foreground hover:bg-signal hover:text-ink',
  signal: 'bg-ink text-paper hover:bg-paper hover:text-ink',
}

const motifs = { core: CoreMotif, side: SideBySideMotif, events: EventMotif }

function Panel({ tone, children, label }: { tone: Tone; children: ReactNode; label: string }) {
  return (
    <section
      aria-label={label}
      data-tone={tone}
      className={cn(
        'poster-panel relative flex h-svh w-screen shrink-0 flex-col pt-20 pb-8 md:pt-24 md:pb-10',
        'motion-reduce:h-auto motion-reduce:min-h-svh',
        toneClass[tone]
      )}
    >
      {children}
    </section>
  )
}

export function PosterSequence({
  services,
  studies,
  totalStudies,
}: {
  services: PosterService[]
  studies: PosterStudy[]
  totalStudies: number
}) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const serviceTones: Tone[] = ['invert', 'signal', 'base']
  const studyTones: Tone[] = ['invert', 'base', 'signal', 'invert']
  const tones: Tone[] = [
    'base',
    ...services.map((_, i) => serviceTones[i % 3]),
    ...studies.map((_, i) => studyTones[i % 4]),
    'base',
  ]
  const total = tones.length
  const pad = (n: number) => String(n).padStart(2, '0')

  useEffect(() => {
    const gsap = getGsap()
    const section = sectionRef.current
    const track = trackRef.current
    const canvas = canvasRef.current
    if (!section || !track || !canvas || prefersReducedMotion()) return

    let engine: PosterWipeEngine | null = null
    let disposed = false
    let visible = false
    let vel = 0
    let lastVelWritten = -1
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
    }, section)

    // Render while any part of the sequence is on screen (incl. approach and exit of the pin)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(section)

    const colors = () => tones.map((t) => readToken(toneToken[t][0], toneToken[t][1]))

    const boot = async () => {
      if (!hasWebGL2()) return
      const { PosterWipeEngine } = await import('@/components/specialized/poster-wipe-engine')
      if (disposed) return
      try {
        engine = new PosterWipeEngine(canvas, Math.min(cappedDpr(), 1.5))
      } catch {
        engine = null
        return
      }
      engine.setPanels(colors(), readToken('--signal', '#ff4a1c'))
      engine.resize(window.innerWidth, window.innerHeight, window.innerWidth)
      section.dataset.webgl = 'on'
    }
    void boot()

    const offTheme = onThemeChange(() => engine?.setPanels(colors(), readToken('--signal', '#ff4a1c')))

    const onResize = () => engine?.resize(window.innerWidth, window.innerHeight, window.innerWidth)
    window.addEventListener('resize', onResize)

    // One ticker for: velocity-driven variable axes (--vel) + the WebGL wipe frame
    const tick = (_t: number, deltaMs: number) => {
      const raw = Math.min(1, Math.abs(getScrollVelocity()) / 38)
      vel += (raw - vel) * (raw > vel ? 0.22 : 0.07)
      if (vel < 0.001) vel = 0
      if (Math.abs(vel - lastVelWritten) > 0.004) {
        track.style.setProperty('--vel', vel.toFixed(3))
        lastVelWritten = vel
      }
      if (!engine || !visible || document.hidden) return
      const x = Number(gsap.getProperty(track, 'x')) || 0
      engine.render(Math.min(deltaMs, 50) / 1000, -x, vel)
    }
    gsap.ticker.add(tick)

    return () => {
      disposed = true
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', onResize)
      io.disconnect()
      offTheme()
      ctx.revert()
      engine?.dispose()
      engine = null
      delete section.dataset.webgl
    }
    // tones derive from props that are static for the page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let n = 0

  return (
    <div
      ref={sectionRef}
      id="work"
      className="poster-sequence relative overflow-hidden motion-reduce:overflow-visible"
      aria-label="Services and selected work"
      role="region"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden h-svh w-screen motion-safe:block"
      />
      <div ref={trackRef} className="relative z-10 flex w-max flex-row motion-reduce:w-full motion-reduce:flex-col">
        {/* Cover */}
        <Panel tone={tones[n++]} label="Index">
          <div className="shell grid-poster h-full content-between gap-y-6">
            <p className="label col-span-2 md:col-span-3">
              <span className="text-signal">(03)</span> Index
            </p>
            <p className="label col-span-2 text-right md:col-span-3 md:col-start-10">
              {pad(1)}—{pad(total)}
            </p>
            <h2 className="type-display type-kinetic col-span-4 text-[clamp(3.4rem,11.5vw,12rem)] md:col-span-12">
              What I do
              <br />
              <span className="text-outline">&amp; Selected</span>
              <br />
              Work
            </h2>
            <ol className="col-span-4 grid grid-cols-1 gap-x-6 md:col-span-8 md:grid-cols-2">
              {[...services.map((s) => s.title), ...studies.map((s) => s.title)].map((t, i) => (
                <li
                  key={t}
                  className="flex items-baseline gap-3 py-1.5 text-sm font-semibold shadow-[0_1px_0_var(--rule)]"
                >
                  <span className="label text-signal">{pad(i + 2)}</span>
                  <span className="truncate">{t}</span>
                </li>
              ))}
            </ol>
            <p className="label text-muted-foreground col-span-4 self-end md:col-span-3 md:col-start-10 md:text-right">
              Scroll to move through the posters →
            </p>
          </div>
        </Panel>

        {/* Services */}
        {services.map((service, i) => {
          const Motif = motifs[service.motif]
          const idx = ++n
          return (
            <Panel key={service.title} tone={tones[idx - 1]} label={`Service: ${service.title}`}>
              <div className="shell grid-poster h-full content-between gap-y-6">
                <p className="label col-span-2 md:col-span-4">
                  ({pad(idx)}) Service {pad(i + 1)}/{pad(services.length)}
                </p>
                <p className="label col-span-2 text-right md:col-span-4 md:col-start-9">What I do</p>

                <div className="relative col-span-4 md:col-span-12">
                  <span
                    aria-hidden="true"
                    className="type-display text-outline pointer-events-none absolute -top-[0.1em] right-0 hidden text-[clamp(8rem,34vw,34rem)] leading-none opacity-30 md:block"
                  >
                    {pad(i + 1)}
                  </span>
                  <h3 className="type-display type-kinetic relative max-w-[11ch] text-[clamp(2.9rem,8.4vw,9.5rem)]">
                    {service.title}
                  </h3>
                </div>

                <div className="col-span-4 flex items-end justify-between gap-6 md:col-span-12">
                  <p className="max-w-[40ch] text-base leading-snug font-medium md:text-xl">{service.description}</p>
                  <Motif className="size-24 shrink-0 md:size-44" />
                </div>
              </div>
            </Panel>
          )
        })}

        {/* Featured case studies */}
        {studies.map((study) => {
          const idx = ++n
          const metrics = (study.metrics ?? []).slice(0, 3).map(parseMetric)
          return (
            <Panel key={study.slug} tone={tones[idx - 1]} label={`Case study: ${study.title}`}>
              <div className="shell grid-poster h-full content-between gap-y-5">
                <p className="label col-span-2 md:col-span-4">
                  ({pad(idx)}) Case Study · {study.period}
                </p>
                <p className="label col-span-2 text-right md:col-span-4 md:col-start-9">{study.role}</p>

                <div className="col-span-4 md:col-span-9">
                  <h3 className="type-kinetic text-[clamp(2.1rem,5.6vw,6.2rem)] leading-[0.9] tracking-[-0.02em] uppercase">
                    {study.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 max-w-[52ch] text-sm leading-snug font-medium opacity-80 md:mt-6 md:text-lg">
                    {study.summary}
                  </p>
                </div>

                <dl className="col-span-4 grid grid-cols-3 gap-4 md:col-span-9">
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex flex-col-reverse justify-end pt-3 shadow-[0_-2px_0_currentColor]"
                    >
                      <dt className="label mt-2 opacity-75">{m.value ? m.label : 'Outcome'}</dt>
                      <dd className="text-[clamp(1.4rem,4vw,4.2rem)] leading-none font-black tracking-[-0.02em] [font-stretch:87.5%] tabular-nums">
                        {m.value ?? (
                          <span className="block text-[0.42em] leading-tight font-bold tracking-normal text-balance [font-stretch:100%]">
                            {m.label}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="col-span-4 flex flex-wrap items-center justify-between gap-3 md:col-span-3 md:col-start-10 md:flex-col md:items-end md:justify-end">
                  <ul className="flex flex-wrap gap-1.5 md:justify-end">
                    {study.tags.slice(0, 3).map((tag) => (
                      <li key={tag} className="label px-2 py-1 shadow-[inset_0_0_0_1px_currentColor]">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/work/${study.slug}`}
                    className={cn(
                      'press inline-flex h-11 items-center gap-2 pr-3.5 pl-4 text-sm font-bold tracking-wide uppercase',
                      buttonTone[tones[idx - 1]]
                    )}
                  >
                    <span className="sr-only">{study.title}: </span>Read case study
                    <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Panel>
          )
        })}

        {/* Outro */}
        <Panel tone={tones[total - 1]} label="All case studies">
          <div className="shell grid-poster h-full content-between gap-y-6">
            <p className="label col-span-4">
              ({pad(total)}) {totalStudies} case studies in the archive
            </p>
            <Link
              href="/work"
              className="group hover:text-signal col-span-4 transition-colors duration-150 ease-out md:col-span-12"
            >
              <span className="type-display type-kinetic block text-[clamp(3.2rem,11vw,12rem)]">
                All case
                <br />
                studies
              </span>
              <ArrowRight
                className="mt-4 size-14 transition-transform duration-200 ease-out group-hover:translate-x-3 md:size-24"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </Link>
            <p className="label text-muted-foreground col-span-4">Architecture · CAP · RAP · Fiori · Integration</p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
