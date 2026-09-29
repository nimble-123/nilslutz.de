'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'
import type { Exhibit } from './exhibits'
import type { MonolithScene } from './scene'
import {
  EXHIBIT_COUNT,
  ROOMS,
  contactVisibility,
  exhibitWeight,
  heroVisibility,
  introVisibility,
  roomAt,
} from './story'

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

function readDisplayFont() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--font-display-face').trim()
  return v || 'Georgia, serif'
}

export function MonolithStory({ exhibits }: { exhibits: Exhibit[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const exhibitRefs = useRef<(HTMLLIElement | null)[]>([])
  const roomRef = useRef<HTMLSpanElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const railRef = useRef<HTMLSpanElement>(null)
  const [webgl, setWebgl] = useState<'pending' | 'on' | 'off'>('pending')

  // ————— the one orchestrated page-load —————
  useLayoutEffect(() => {
    const hero = heroRef.current
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(SplitText)
    let split: SplitText | undefined
    const ctx = gsap.context(() => {
      const chunks = hero.querySelectorAll<HTMLElement>('[data-intro]')
      const tagline = hero.querySelector<HTMLElement>('[data-tagline]')
      const tl = gsap.timeline({ delay: 1.1, defaults: { ease: 'power3.out', duration: 1.1 } })
      tl.set(chunks, { opacity: 1, animation: 'none' })
      chunks.forEach((chunk, i) => {
        if (chunk === tagline) {
          split = SplitText.create(tagline, { type: 'lines', mask: 'lines' })
          tl.from(split.lines, { yPercent: 105, duration: 1.4, ease: 'expo.out', stagger: 0.08 }, i * 0.1)
        } else {
          tl.fromTo(
            chunk,
            { opacity: 0, y: 12, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', clearProps: 'filter' },
            i * 0.1
          )
        }
      })
    }, hero)
    return () => {
      ctx.revert()
      split?.revert()
    }
  }, [])

  // ————— WebGL + scroll story —————
  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return
    gsap.registerPlugin(ScrollTrigger)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    let scene: MonolithScene | null = null
    let disposed = false
    let visible = true
    let target = 0
    let p = 0
    let lastRoom = -1
    let lastCount = ''

    const setLabels = (prog: number) => {
      const hv = heroVisibility(prog)
      if (heroRef.current) {
        heroRef.current.style.opacity = String(hv)
        heroRef.current.style.transform = `translate3d(0, ${(1 - hv) * -24}px, 0)`
        heroRef.current.style.visibility = hv < 0.01 ? 'hidden' : 'visible'
      }
      const iv = introVisibility(prog)
      if (introRef.current) {
        introRef.current.style.opacity = String(iv)
        introRef.current.style.transform = `translate3d(0, ${(1 - iv) * 10}px, 0)`
        introRef.current.style.visibility = iv < 0.01 ? 'hidden' : 'visible'
      }
      const cv = contactVisibility(prog)
      if (contactRef.current) {
        contactRef.current.style.opacity = String(cv)
        contactRef.current.style.transform = `translate3d(0, ${(1 - cv) * 12}px, 0)`
        contactRef.current.style.visibility = cv < 0.01 ? 'hidden' : 'visible'
        contactRef.current.style.pointerEvents = cv > 0.6 ? 'auto' : 'none'
      }

      const w = section.clientWidth
      let active = -1
      exhibitRefs.current.forEach((el, i) => {
        if (!el) return
        const v = exhibitWeight(i, prog)
        if (v > 0.5) active = i
        el.style.opacity = String(v)
        el.style.visibility = v < 0.01 ? 'hidden' : 'visible'
        el.style.pointerEvents = v > 0.6 ? 'auto' : 'none'
        const card = el.firstElementChild as HTMLElement | null
        if (card) {
          card.style.filter = v > 0.99 ? 'none' : `blur(${(1 - v) * 4}px)`
          card.style.marginTop = `${(1 - v) * 8}px`
        }
        const lead = el.querySelector<HTMLElement>('.exhibit-lead')
        if (lead) lead.style.scale = `${v} 1`
        if (scene && v > 0.001 && !mobileQuery.matches) {
          const a = scene.anchor(i)
          let side = a.side
          // keep the label on screen
          if (side === 1 && a.x + 380 > w) side = -1
          if (side === -1 && a.x - 380 < 0) side = 1
          el.dataset.side = String(side)
          el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`
        }
      })

      const room = roomAt(prog)
      if (room !== lastRoom && roomRef.current) {
        lastRoom = room
        roomRef.current.textContent = `${['I', 'II', 'III', 'IV'][room]} — ${ROOMS[room].label}`
      }
      const count = active >= 0 ? `${String(active + 1).padStart(2, '0')} / ${String(EXHIBIT_COUNT).padStart(2, '0')}` : ''
      if (count !== lastCount && countRef.current) {
        lastCount = count
        countRef.current.textContent = count
      }
      if (railRef.current) railRef.current.style.scale = `1 ${prog}`
    }

    // scroll → progress
    const st = reduced
      ? null
      : ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            target = self.progress
          },
        })

    // pointer / touch / tilt
    const onPointer = (e: PointerEvent) => {
      if (!scene) return
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      scene.setPointer(x, y)
    }
    const onTilt = (e: DeviceOrientationEvent) => {
      if (!scene || e.gamma == null || e.beta == null) return
      scene.setPointer(clamp01((e.gamma + 30) / 60) * 2 - 1, clamp01((e.beta - 20) / 50) * -2 + 1)
    }

    const tick = (_time: number, deltaMs: number) => {
      if (!visible || document.hidden) return
      const dt = Math.min(deltaMs / 1000, 0.25)
      p += (target - p) * (1 - Math.exp(-dt * 3.4))
      if (Math.abs(target - p) < 1e-5) p = target
      if (scene) {
        scene.setProgress(p)
        scene.frame(dt)
      }
      setLabels(p)
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(section)

    const resize = () => {
      if (!scene) return
      const r = canvas.getBoundingClientRect()
      scene.resize(r.width, r.height)
      if (reduced) scene.frame(0)
    }
    const ro = new ResizeObserver(resize)

    const themeObserver = new MutationObserver(() => {
      const night = document.documentElement.classList.contains('dark')
      scene?.setNight(night)
      if (reduced) scene?.frame(0)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const start = async () => {
      const font = readDisplayFont()
      try {
        await Promise.race([
          document.fonts.load(`400 120px ${font}`),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ])
      } catch {
        /* draw with whatever is available */
      }
      if (disposed) return
      try {
        const { createMonolithScene } = await import('./scene')
        if (disposed) return
        scene = createMonolithScene(canvas, {
          reduced,
          mobile: mobileQuery.matches || window.matchMedia('(pointer: coarse)').matches,
          displayFont: font,
          night: document.documentElement.classList.contains('dark'),
        })
      } catch (err) {
        console.warn('[monolith] WebGL unavailable, showing the still poster.', err)
        setWebgl('off')
        return
      }
      ro.observe(canvas)
      resize()
      scene.frame(0)
      setWebgl('on')
      if (!reduced) {
        window.addEventListener('pointermove', onPointer, { passive: true })
        window.addEventListener('pointerdown', onPointer, { passive: true })
        window.addEventListener('deviceorientation', onTilt, { passive: true })
      }
    }

    if (reduced) {
      setLabels(0)
    } else {
      gsap.ticker.add(tick)
    }
    start()

    return () => {
      disposed = true
      gsap.ticker.remove(tick)
      st?.kill()
      io.disconnect()
      ro.disconnect()
      themeObserver.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
      scene?.dispose()
      scene = null
    }
  }, [])

  return (
    <section
      id="monolith"
      ref={sectionRef}
      data-webgl={webgl}
      aria-label="The Monolith — an exhibition in four rooms"
      className="monolith-story"
    >
      <div className="monolith-stage">
        <div className="monolith-view absolute inset-0">
          {/* Still poster: shown while WebGL warms up, and when it is unavailable */}
          <Poster />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              'absolute inset-0 size-full transition-opacity duration-[1600ms] ease-out',
              webgl === 'on' ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Room I — Entrance: the wall label of the whole exhibition */}
          <div
            ref={heroRef}
            className="absolute inset-x-0 bottom-0 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-8 md:pb-10"
          >
            <div className="mx-auto flex max-w-[88rem] items-end justify-between gap-8">
              <div className="max-w-xl">
                <p data-intro className="label-caps text-muted-foreground mb-4 flex items-center gap-3">
                  <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
                  Room I — Entrance
                </p>
                <h1 data-intro className="font-display text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[0.98] font-light">
                  <span className="sr-only">{profile.name}, </span>
                  <em className="font-light">{profile.role}</em>
                </h1>
                <p
                  data-intro
                  data-tagline
                  className="text-foreground/80 mt-4 max-w-md text-lg leading-snug text-pretty md:text-xl"
                >
                  I architect Clean-Core compliant SAP solutions on BTP/CAP/RAP/Fiori – and set the standards they
                  run on.
                </p>
                <div data-intro className="mt-7 flex flex-wrap items-center gap-2">
                  <Link
                    href="/work"
                    className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-5 text-[0.95rem] font-medium transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
                  >
                    {profile.ctas.primary}
                    <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/contact"
                    className="shadow-border hover:shadow-border-hover bg-background/40 inline-flex h-11 items-center rounded-full px-5 text-[0.95rem] font-medium backdrop-blur-sm transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
                  >
                    {profile.ctas.secondary}
                  </Link>
                </div>
              </div>
              <div data-intro className="story-only hidden flex-col items-end gap-3 text-right md:flex">
                <span className="label-caps text-muted-foreground">Scroll to enter</span>
                <span className="bg-border relative block h-14 w-px overflow-hidden" aria-hidden="true">
                  <span className="bg-foreground/70 absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_2.8s_cubic-bezier(0.2,0,0,1)_infinite]" />
                </span>
                <a
                  href="#catalogue"
                  className="label-caps text-muted-foreground hover:text-foreground inline-flex h-10 items-center"
                >
                  Skip to the catalogue
                </a>
              </div>
            </div>
          </div>

          {/* Room II opening wall text */}
          <div
            ref={introRef}
            className="story-only pointer-events-none invisible absolute top-24 left-4 max-w-sm opacity-0 md:top-auto md:bottom-12 md:left-8"
          >
            <p className="label-caps text-muted-foreground mb-3 flex items-center gap-3">
              <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
              Room II — The Core
            </p>
            <p className="font-display text-3xl leading-tight font-light md:text-4xl">
              Keep the core clean. <em>Let everything else move.</em>
            </p>
            <p className="text-muted-foreground mt-3 text-base">
              Strict separation of standard and custom code: extensions run Side-by-Side on BTP or via released APIs.
            </p>
          </div>
        </div>

        {/* Exhibits — each one pinned to its shard */}
        <ol className="exhibits-layer absolute inset-0" aria-label="Exhibits">
          {exhibits.map((ex, i) => (
            <li
              key={ex.no}
              ref={(el) => {
                exhibitRefs.current[i] = el
              }}
              className="exhibit"
              data-side="1"
            >
              <ExhibitCard exhibit={ex} />
              <span className="exhibit-lead" aria-hidden="true" />
              <span className="exhibit-pin" aria-hidden="true" />
            </li>
          ))}
        </ol>

        {/* Room IV — Reassembly: correspondence */}
        <div
          ref={contactRef}
          className="contact-plate invisible absolute inset-x-4 bottom-8 opacity-0 md:inset-x-auto md:top-1/2 md:right-[8vw] md:bottom-auto md:w-[26rem]"
        >
          <div className="md:-translate-y-1/2">
            <p className="label-caps text-muted-foreground mb-4 flex items-center gap-3">
              <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
              Room IV — Reassembly
            </p>
            <h2 className="font-display text-[clamp(2.4rem,4.6vw,3.8rem)] leading-[0.98] font-light">
              The whole, <em>again.</em>
            </h2>
            <p className="text-foreground/80 mt-4 text-lg text-pretty">
              Interested in robust SAP BTP architectures or Clean Core strategies? Let&rsquo;s talk.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`mailto:${profile.socials.email}`}
                className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-5 text-[0.95rem] font-medium transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
              >
                {profile.socials.email}
                <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </a>
              <Link
                href="/contact"
                className="shadow-border hover:shadow-border-hover bg-background/40 inline-flex h-11 items-center rounded-full px-5 text-[0.95rem] font-medium backdrop-blur-sm transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
              >
                {profile.ctas.secondary}
              </Link>
            </div>
          </div>
        </div>

        {/* Room indicator */}
        <div className="story-only pointer-events-none absolute top-20 right-4 flex items-start gap-3 md:top-28 md:right-8">
          <div className="text-right">
            <span ref={roomRef} className="label-caps text-muted-foreground block">
              I — Entrance
            </span>
            <span ref={countRef} className="label-caps text-foreground mt-1 block tabular-nums" />
          </div>
          <span className="bg-border relative block h-16 w-px" aria-hidden="true">
            <span ref={railRef} className="bg-brass absolute inset-0 origin-top" style={{ scale: '1 0' }} />
          </span>
        </div>
      </div>
    </section>
  )
}

function ExhibitCard({ exhibit }: { exhibit: Exhibit }) {
  const body = (
    <>
      <p className="label-caps text-muted-foreground flex items-center justify-between gap-4">
        <span className="tabular-nums">No. {exhibit.no}</span>
        <span>{exhibit.kind}</span>
      </p>
      <h3 className="font-display mt-3 text-[1.7rem] leading-[1.08] font-normal">
        <em>{exhibit.title}</em>
        {exhibit.date && <span className="text-muted-foreground not-italic">, {exhibit.date}</span>}
      </h3>
      <p className="text-muted-foreground mt-2 text-[0.92rem] leading-snug italic">{exhibit.medium}</p>
      <p className="text-foreground/85 mt-3 line-clamp-4 text-[0.95rem] leading-snug">{exhibit.text}</p>
      {(exhibit.credit || exhibit.href) && (
        <p className="border-border text-muted-foreground mt-4 flex items-center justify-between gap-4 border-t pt-3 text-[0.85rem]">
          <span>{exhibit.credit}</span>
          {exhibit.href && (
            <span className="text-brass-ink inline-flex items-center gap-1 font-medium whitespace-nowrap">
              View exhibit
              <ArrowRight
                className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                strokeWidth={2}
                aria-hidden="true"
              />
            </span>
          )}
        </p>
      )}
    </>
  )
  const cls =
    'exhibit-card group bg-card/80 block rounded-md p-5 backdrop-blur-md shadow-plinth transition-[box-shadow] duration-150'
  return exhibit.href ? (
    <Link href={exhibit.href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

function Poster() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="from-stone to-background absolute inset-0 bg-gradient-to-b" />
      <div className="bg-foreground/[0.06] absolute inset-x-0 bottom-0 h-[30%]" />
      <p className="carved font-display absolute inset-x-0 top-[34%] text-center text-[clamp(4rem,17vw,15rem)] leading-none font-normal tracking-[0.02em] select-none">
        Nils Lutz
      </p>
      <div className="absolute bottom-[30%] left-1/2 aspect-[1.1/2.6] h-[52%] -translate-x-1/2 overflow-hidden rounded-[2px] bg-gradient-to-br from-white/35 via-white/10 to-white/25 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.45)] backdrop-blur-[3px] dark:from-white/10 dark:via-white/[0.03] dark:to-white/5" />
    </div>
  )
}
