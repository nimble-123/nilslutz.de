'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import type { EventMesh, WordBox } from './event-mesh'
import { isMobileClass, prefersReducedMotion } from '@/lib/motion-prefs'
import { shortTitle } from '@/lib/signal-layout'
import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'

export type HomeCase = {
  slug: string
  title: string
  summary: string
  role: string
  period: string
  tags: string[]
  metric?: string
}

export type HomeNote = { slug: string; title: string; summary: string; date: string; dateLabel: string }

const SATELLITES = ['CAP', 'Fiori Elements', 'Event Mesh', 'HANA Cloud', 'API Management']
const SCENES = ['Hero', 'Clean Core', 'Topology', 'Starfield'] as const

const pad = (n: number) => String(n).padStart(2, '0')

export function HomeExperience({ cases, notes }: { cases: HomeCase[]; notes: HomeNote[] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [count, setCount] = useState<number | null>(null)
  const producers = cases.slice(0, 3)
  const consumers = cases.slice(3)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    gsap.registerPlugin(ScrollTrigger, SplitText)
    const reduced = prefersReducedMotion()
    const mobile = isMobileClass()
    const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)
    const qa = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel))

    let mesh: EventMesh | null = null
    let disposed = false
    let ctx: gsap.Context | null = null
    const cleanups: (() => void)[] = []

    const hud = {
      fps: q('[data-hud="fps"]'),
      ptr: q('[data-hud="ptr"]'),
      scene: q('[data-hud="scene"]'),
      sceneIdx: q('[data-hud="scene-idx"]'),
    }
    const hudRoot = q('[data-hud-root]')
    const coreLabel = q('[data-core-label]')
    const satLabels = qa('[data-sat]')
    const topoLabels = qa('[data-node]')
    const topoLayer = q('[data-topo-layer]')
    const coreLayer = q('[data-core-layer]')

    const measureWords = (): WordBox[] =>
      qa('[data-word]').map((el) => {
        const cs = getComputedStyle(el)
        const base = el.querySelector('[data-baseline]')!.getBoundingClientRect()
        const r = el.getBoundingClientRect()
        return {
          text: el.textContent ?? '',
          left: r.left,
          baseline: base.top + window.scrollY,
          font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
          letterSpacing: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing,
        }
      })

    const setup = async () => {
      await document.fonts.ready
      if (disposed) return

      const { EventMesh, webglAvailable } = await import('./event-mesh')
      if (disposed) return

      if (webglAvailable()) {
        try {
          const particleCount = mobile ? 18000 : 46000
          mesh = new EventMesh(canvas, {
            count: particleCount,
            dpr: Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2),
            producers: producers.length,
            consumers: consumers.length,
          })
          mesh.resize(window.innerWidth, window.innerHeight)
          mesh.sampleText(measureWords())
          document.documentElement.dataset.webgl = 'on'
          setCount(particleCount)
        } catch {
          mesh = null
        }
      }
      if (!mesh) document.documentElement.dataset.webgl = 'off'

      ctx = gsap.context(() => buildTimeline(), root)
    }

    // ------------------------------------------------------------------ choreography
    const buildTimeline = () => {
      const state = mesh?.state ?? { converge: 1, morph: 0, heroShift: 0, starDrift: 0 }
      let sceneIndex = 0
      const setScene = (i: number) => {
        if (i === sceneIndex) return
        sceneIndex = i
        if (hud.scene) hud.scene.textContent = SCENES[i]
        if (hud.sceneIdx) hud.sceneIdx.textContent = pad(i + 1)
      }

      // Split the kinetic type once fonts are in
      const eyebrow = SplitText.create('[data-split="eyebrow"]', { type: 'chars' })
      const tagline = SplitText.create('[data-split="tagline"]', { type: 'lines,words', mask: 'lines' })
      const coreHead = SplitText.create('[data-split="core-head"]', { type: 'lines', mask: 'lines' })
      const coreBody = SplitText.create('[data-split="core-body"]', { type: 'words' })
      const topoHead = SplitText.create('[data-split="topo-head"]', { type: 'chars,words' })

      if (reduced) {
        state.converge = 1
        gsap.set('[data-intro]', { opacity: 1 })
        const toggle = (sel: string, morph: number, idx: number) =>
          ScrollTrigger.create({
            trigger: sel,
            start: 'top 55%',
            end: 'bottom 45%',
            onToggle: (self) => {
              if (self.isActive) {
                state.morph = morph
                setScene(idx)
                renderStatic()
              }
            },
          })
        toggle('#hero', 0, 0)
        toggle('#core', 1, 1)
        toggle('#topology', 2, 2)
        toggle('#after', 3, 3)
        renderStatic()
        return
      }

      // ---- 1. The one orchestrated page load
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })
      intro
        .from(eyebrow.chars, { opacity: 0, duration: 0.05, stagger: 0.022, ease: 'none' }, 0.15)
        .to(state, { converge: 1, duration: mesh ? 2.8 : 0.01, ease: 'power3.inOut' }, 0.25)
      if (!mesh) {
        intro.from('[data-word]', { yPercent: 30, opacity: 0, filter: 'blur(8px)', duration: 1.2, stagger: 0.1 }, 0.2)
      }
      intro
        .from(tagline.words, { yPercent: 110, duration: 1.1, stagger: 0.035 }, mesh ? 1.6 : 0.8)
        .fromTo(
          '[data-intro]',
          { opacity: 0, y: 12, filter: 'blur(4px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.1, ease: 'power2.out' },
          mesh ? 2.1 : 1.1
        )

      // ---- 2. Hero → Clean Core (scrubbed morph while the hero scrolls away)
      gsap.to(state, {
        morph: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#core',
          start: 'top bottom',
          end: 'top top',
          scrub: 1,
          onUpdate: () => {
            state.heroShift = Math.min(window.scrollY, window.innerHeight)
          },
        },
      })

      const coreTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#core',
          start: 'top top',
          end: mobile ? '+=110%' : '+=140%',
          pin: true,
          scrub: 1,
          onToggle: (s) => s.isActive && setScene(1),
          onLeaveBack: () => setScene(0),
        },
      })
      coreTl
        .from(coreHead.lines, { yPercent: 105, duration: 0.5, stagger: 0.12, ease: 'power3.out' })
        .from(coreBody.words, { opacity: 0.12, duration: 0.6, stagger: 0.012, ease: 'none' }, 0.25)
        .from('[data-core-legend] > *', { opacity: 0, x: -8, duration: 0.3, stagger: 0.08 }, 0.6)
        .to({}, { duration: 0.4 })

      // ---- 3. Clean Core → Topology
      gsap.to(state, {
        morph: 2,
        ease: 'none',
        scrollTrigger: { trigger: '#topology', start: 'top bottom', end: 'top top', scrub: 1 },
      })
      const topoTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#topology',
          start: 'top top',
          end: mobile ? '+=110%' : '+=150%',
          pin: true,
          scrub: 1,
          onToggle: (s) => s.isActive && setScene(2),
        },
      })
      topoTl
        .from(topoHead.chars, {
          opacity: 0,
          yPercent: 40,
          rotateX: -70,
          duration: 0.4,
          stagger: 0.015,
          ease: 'power3.out',
        })
        .from('[data-topo-copy]', { opacity: 0, y: 16, duration: 0.3 }, 0.2)
        .from(topoLabels, { opacity: 0, filter: 'blur(4px)', duration: 0.25, stagger: 0.04 }, 0.2)
        .to({}, { duration: 0.5 })

      // ---- 4. Topology → Starfield: the stream calms down behind the quiet part of the page
      gsap.to(state, {
        morph: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: '#after',
          start: 'top bottom',
          end: 'top 30%',
          scrub: 1,
          onToggle: (s) => s.isActive && setScene(3),
          onLeaveBack: () => setScene(2),
        },
      })
      gsap.to(state, {
        starDrift: 3,
        ease: 'none',
        scrollTrigger: { trigger: '#after', start: 'top bottom', end: 'bottom top', scrub: true },
      })
      ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom 40%', onEnterBack: () => setScene(0) })
      // The control-room HUD bows out once the page turns into reading matter
      ScrollTrigger.create({
        trigger: '#after',
        start: 'top 20%',
        onEnter: () => hudRoot?.setAttribute('data-off', ''),
        onLeaveBack: () => hudRoot?.removeAttribute('data-off'),
      })

      cleanups.push(() => {
        eyebrow.revert()
        tagline.revert()
        coreHead.revert()
        coreBody.revert()
        topoHead.revert()
      })

      if (mesh) startLoop()
    }

    // ------------------------------------------------------------------ render loop (gsap.ticker)
    const renderStatic = () => {
      if (!mesh) return
      mesh.render(14, 0)
      updateLabels()
    }

    const updateLabels = () => {
      if (!mesh) return
      const m = mesh.state.morph
      const coreVis = Math.max(0, 1 - Math.abs(m - 1) * 3.2)
      const topoVis = Math.max(0, 1 - Math.abs(m - 2) * 3.2)
      if (coreLayer) {
        coreLayer.style.opacity = String(coreVis)
        coreLayer.style.visibility = coreVis > 0.01 ? 'visible' : 'hidden'
      }
      if (topoLayer) {
        topoLayer.style.opacity = String(topoVis)
        topoLayer.style.visibility = topoVis > 0.01 ? 'visible' : 'hidden'
      }
      if (coreVis > 0.01) {
        const c = mesh.coreScreen()
        if (coreLabel) coreLabel.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%)`
        const vw = window.innerWidth
        satLabels.forEach((el, i) => {
          const s = mesh!.satelliteScreen(i)
          // Label sits radially outside its satellite, on whichever side has room
          const off = c.r * 0.24 + 6
          const w = el.offsetWidth
          const side = s.x < c.x ? 'left' : 'right'
          const x = Math.max(12, Math.min(vw - 12 - w, side === 'right' ? s.x + off : s.x - off - w))
          if (el.dataset.side !== side) el.dataset.side = side
          el.style.transform = `translate3d(${x}px, ${s.y}px, 0) translateY(-50%)`
          // Satellites passing behind the core dim, so labels never float over the sphere
          const behind = s.z < 0 && Math.hypot(s.x - c.x, s.y - c.y) < c.r * 1.1
          el.style.opacity = behind ? '0.25' : '1'
        })
      }
      if (topoVis > 0.01) {
        const t = mesh.topologyScreen()
        const all = [...t.producers, ...t.consumers]
        topoLabels.forEach((el) => {
          const key = el.dataset.node
          const i = Number(key)
          const p =
            key === 'cap-p' ? t.producers[0] : key === 'cap-c' ? t.consumers[0] : i < 0 ? t.broker : all[i]
          if (p) el.style.transform = `translate3d(${p[0]}px, ${p[1]}px, 0)`
        })
      }
    }

    let last = 0
    let fpsAcc = 0
    let fpsFrames = 0
    let nextPulse = 3.2
    let lastMove = 0
    const startLoop = () => {
      const tick = (time: number) => {
        if (!mesh || document.hidden) return
        const dt = last ? Math.min(0.05, time - last) : 0.016
        last = time
        // An idle cursor stops acting as a broker, so a parked mouse never leaves a hole in the diagrams
        if (lastMove && time - lastMove > 1.4) {
          mesh.releasePointer()
          lastMove = 0
        }
        mesh.render(time, dt)
        updateLabels()

        // Auto publish/subscribe pulses: from the wordmark in the hero, from the broker in the topology
        if (time > nextPulse) {
          const m = mesh.state.morph
          if (m < 0.3 && mesh.state.converge > 0.95) {
            const words = qa('[data-word]')
            const el = words[Math.floor(Math.random() * words.length)]
            const r = el?.getBoundingClientRect()
            if (r) mesh.pulse(r.left + Math.random() * r.width, r.top + r.height * (0.3 + Math.random() * 0.5), 0.8)
          } else if (Math.abs(m - 2) < 0.2) {
            const [bx, by] = mesh.brokerWorld
            mesh.pulseWorld(bx, by, 1)
          }
          nextPulse = time + (Math.abs(mesh.state.morph - 2) < 0.2 ? 1.5 : 2.4)
        }

        fpsAcc += dt
        fpsFrames++
        if (fpsAcc > 0.5) {
          if (hud.fps) hud.fps.textContent = String(Math.round(fpsFrames / fpsAcc)).padStart(3, '0')
          fpsAcc = 0
          fpsFrames = 0
        }
      }
      gsap.ticker.add(tick)
      cleanups.push(() => gsap.ticker.remove(tick))

      // Pointer / finger = broker
      const move = (x: number, y: number) => {
        mesh?.setPointer(x, y, 1)
        lastMove = gsap.ticker.time
        if (hud.ptr) {
          const nx = (x / window.innerWidth) * 2 - 1
          const ny = 1 - (y / window.innerHeight) * 2
          hud.ptr.textContent = `${nx >= 0 ? '+' : '−'}${Math.abs(nx).toFixed(2)} ${ny >= 0 ? '+' : '−'}${Math.abs(ny).toFixed(2)}`
        }
      }
      const onPointerMove = (e: PointerEvent) => move(e.clientX, e.clientY)
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0]
        if (t) move(t.clientX, t.clientY)
      }
      const onLeave = () => mesh?.releasePointer()
      const onDown = (e: PointerEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('a,button')) return
        mesh?.pulse(e.clientX, e.clientY, 1.2)
      }
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerdown', onDown, { passive: true })
      window.addEventListener('touchmove', onTouch, { passive: true })
      window.addEventListener('touchend', onLeave, { passive: true })
      document.addEventListener('pointerleave', onLeave)
      cleanups.push(() => {
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerdown', onDown)
        window.removeEventListener('touchmove', onTouch)
        window.removeEventListener('touchend', onLeave)
        document.removeEventListener('pointerleave', onLeave)
      })
    }

    // ------------------------------------------------------------------ resize
    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    let lastW = window.innerWidth
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (!mesh) return
        // Ignore mobile URL-bar height jitter; rebuild targets on real size changes
        const wChanged = window.innerWidth !== lastW
        lastW = window.innerWidth
        mesh.resize(window.innerWidth, window.innerHeight)
        if (wChanged) mesh.sampleText(measureWords())
        if (reduced) renderStatic()
      }, 180)
    }
    window.addEventListener('resize', onResize)
    cleanups.push(() => window.removeEventListener('resize', onResize))

    setup()

    return () => {
      disposed = true
      clearTimeout(resizeTimer)
      cleanups.forEach((fn) => fn())
      ctx?.revert()
      mesh?.dispose()
      mesh = null
      delete document.documentElement.dataset.webgl
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={rootRef} className="relative">
      {/* The event mesh */}
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
      

      {/* Label layers that track the 3D scene */}
      <div
        data-core-layer
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] opacity-0"
        style={{ visibility: 'hidden' }}
      >
        <div data-core-label className="absolute top-0 left-0 text-center will-change-transform">
          <span className="label-mono text-foreground/80 block">S/4HANA</span>
          <span className="label-mono text-muted-foreground block">standard · untouched</span>
        </div>
        {SATELLITES.map((s, i) => (
          <div
            key={s}
            data-sat={i}
            className="group/sat label-halo absolute top-0 left-0 hidden transition-opacity duration-300 will-change-transform md:block"
          >
            <span className="label-mono text-sodium flex items-center gap-2 whitespace-nowrap group-data-[side=left]/sat:flex-row-reverse">
              <span className="bg-sodium/60 h-px w-3 md:w-5" />
              {s}
            </span>
          </div>
        ))}
      </div>

      <div
        data-topo-layer
        className="pointer-events-none fixed inset-0 z-[4] opacity-0"
        style={{ visibility: 'hidden' }}
      >
        <div data-node={-1} className="absolute top-0 left-0 will-change-transform">
          <span className="label-mono label-halo text-sodium absolute top-0 left-10 -translate-y-1/2 whitespace-nowrap md:top-14 md:left-1/2 md:-translate-x-1/2 md:translate-y-0 md:text-center">
            SAP Event Mesh
            <span className="text-muted-foreground block">broker</span>
          </span>
        </div>
        {producers.length > 0 && (
          <div data-node="cap-p" className="absolute top-0 left-0 hidden will-change-transform md:block">
            <span className="label-mono text-muted-foreground absolute bottom-10 left-0 -translate-x-1/2 whitespace-nowrap">
              Producers
            </span>
          </div>
        )}
        {consumers.length > 0 && (
          <div data-node="cap-c" className="absolute top-0 left-0 hidden will-change-transform md:block">
            <span className="label-mono text-muted-foreground absolute bottom-10 left-0 -translate-x-1/2 whitespace-nowrap">
              Consumers
            </span>
          </div>
        )}
        {cases.map((c, i) => {
          const isProducer = i < producers.length
          return (
            <div key={c.slug} data-node={i} className="absolute top-0 left-0 will-change-transform">
              <Link
                href={`/work/${c.slug}`}
                className={cn(
                  'group label-halo pointer-events-auto absolute left-1/2 flex min-h-11 w-max min-w-11 -translate-x-1/2 items-center justify-center gap-3',
                  isProducer ? 'bottom-1' : 'top-1',
                  'md:top-0 md:bottom-auto md:translate-x-0 md:-translate-y-1/2',
                  isProducer ? 'md:right-4 md:left-auto md:flex-row-reverse md:text-right' : 'md:left-4 md:text-left'
                )}
              >
                <span className="label-mono text-sodium">CS·{pad(i + 1)}</span>
                <span className="text-foreground/85 group-hover:text-foreground hidden max-w-[16rem] text-sm leading-snug transition-colors duration-150 md:block">
                  {shortTitle(c.title)}
                </span>
              </Link>
            </div>
          )
        })}
      </div>

      {/* ------------------------------------------------------------ HERO */}
      <section id="hero" className="relative z-[3] flex min-h-[100svh] flex-col px-4 pt-24 pb-8 md:px-10 md:pt-28">
        <p data-split="eyebrow" className="label-mono text-muted-foreground">
          {profile.role} — {profile.location} — topic://nilslutz/hero
        </p>

        <div className="flex flex-1 flex-col justify-center">
          <h1 className="text-foreground font-serif text-[min(50vw,30svh)] leading-[0.8] tracking-[-0.035em] md:text-[min(27vw,54svh)] md:leading-[0.78]">
            <span data-word className="wordmark-ghost inline-block">
              Nils
              <i data-baseline className="inline-block h-0 w-0 align-baseline" />
            </span>{' '}
            <span data-word className="wordmark-ghost inline-block italic md:ml-[0.04em]">
              Lutz
              <i data-baseline className="inline-block h-0 w-0 align-baseline" />
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-12">
          <p
            data-split="tagline"
            className="text-foreground/90 font-serif text-2xl leading-[1.15] md:col-span-6 md:text-[2.1rem]"
          >
            I architect <em className="text-sodium">Clean-Core compliant</em> SAP solutions on BTP, CAP, RAP & Fiori —
            and set the standards they run on.
          </p>

          <div data-intro className="flex flex-wrap gap-3 opacity-0 md:col-span-3 md:justify-end">
            <Link
              href="/work"
              className="bg-sodium text-primary-foreground inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-5 text-sm font-medium transition-[scale,background-color] duration-150 ease-out hover:bg-[#ff9c4a] active:scale-[0.96]"
            >
              {profile.ctas.primary}
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="text-foreground inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-5 text-sm font-medium shadow-[var(--shadow-border)] transition-[scale,box-shadow] duration-150 ease-out hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96]"
            >
              {profile.ctas.secondary}
              <Mail className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          <dl
            data-intro
            className="label-mono text-muted-foreground hidden grid-cols-[auto_1fr] gap-x-4 gap-y-1 opacity-0 md:col-span-3 md:grid md:justify-self-end"
          >
            <dt>Events</dt>
            <dd className="text-foreground tabular-nums">{count ? count.toLocaleString('en-US') : '—'}</dd>
            <dt>Frame</dt>
            <dd className="text-foreground tabular-nums">
              <span data-hud="fps">000</span> fps
            </dd>
            <dt>Broker</dt>
            <dd data-hud="ptr" className="text-sodium tabular-nums">
              +0.00 +0.00
            </dd>
          </dl>
        </div>

        <p data-intro className="label-mono text-muted-foreground mt-8 flex items-center gap-3 opacity-0">
          <span className="bg-sodium inline-block size-1.5 animate-pulse rounded-full" aria-hidden="true" />
          <span className="md:hidden">Drag to re-route · tap to publish · scroll</span>
          <span className="hidden md:inline">Move to re-route the stream · click to publish · scroll to descend</span>
        </p>
      </section>

      {/* ------------------------------------------------------------ CLEAN CORE */}
      <section id="core" className="relative z-[3] flex h-[100svh] items-end px-4 pb-10 md:items-center md:px-10 md:pb-0">
        <div className="max-w-xl">
          <p className="label-mono text-sodium mb-6">02 — Clean Core</p>
          <h2 data-split="core-head" className="font-serif text-[2.6rem] leading-[0.98] md:text-7xl">
            A stable core.
            <br />
            <em className="text-foreground/70">Everything else,</em> side by side.
          </h2>
          <p data-split="core-body" className="text-foreground/85 mt-6 max-w-md text-[0.95rem] leading-relaxed md:mt-8">
            Strict separation of standard and custom code avoids technical debt in S/4HANA transformations. Extensions
            run side-by-side on SAP BTP — CAP (Node.js/Java) or RAP — and talk to the core only through released APIs.
          </p>
          <ul data-core-legend className="label-mono text-muted-foreground mt-6 space-y-1.5 md:mt-8">
            <li className="flex items-center gap-3">
              <span className="bg-steel inline-block size-2 rounded-full shadow-[0_0_0_1px_rgb(200_212_235/0.5)]" />
              Core · standard, upgrade-safe
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-sodium inline-block size-2 rounded-full" />
              Extensions · side-by-side on BTP
            </li>
            <li className="text-sodium/80 pl-5 md:hidden">{SATELLITES.join(' · ')}</li>
            <li className="flex items-center gap-3">
              <span className="bg-sodium/50 inline-block h-px w-2" />
              Released APIs · the only way in
            </li>
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------ TOPOLOGY */}
      <section id="topology" className="relative z-[3] h-[100svh] px-4 pt-24 md:px-10 md:pt-28">
        <div className="mx-auto max-w-3xl text-center" style={{ perspective: '600px' }}>
          <p className="label-mono text-sodium mb-4">03 — Event-driven</p>
          <h2 data-split="topo-head" className="font-serif text-[2.6rem] leading-none md:text-7xl">
            Everything is an <em>event</em>.
          </h2>
          <p data-topo-copy className="text-foreground/80 mx-auto mt-4 max-w-lg text-[0.95rem] leading-relaxed">
            Decoupled systems via Event Mesh and robust API management. Each node below is a case study — follow a
            signal.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ AFTER: case files, writing, contact */}
      <div id="after" className="relative z-[3]">
        <section className="px-4 pt-24 md:px-10 md:pt-40" aria-labelledby="cases-title">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="label-mono text-sodium mb-4">04 — Case files</p>
                <h2 id="cases-title" className="font-serif text-5xl leading-none md:text-7xl">
                  Selected <em>signals</em>
                </h2>
              </div>
              <Link
                href="/work"
                className="label-mono text-muted-foreground hover:text-foreground hidden h-11 items-center gap-2 transition-colors duration-150 md:inline-flex"
              >
                All case studies <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
            <ol className="border-hairline border-t">
              {cases.map((c, i) => (
                <li key={c.slug} className="border-hairline border-b">
                  <Link
                    href={`/work/${c.slug}`}
                    className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-6 transition-colors duration-150 hover:bg-white/[0.02] md:grid-cols-[4rem_1fr_14rem_6rem_1.5rem] md:py-7"
                  >
                    <span className="label-mono text-sodium tabular-nums">{pad(i + 1)}</span>
                    <span className="group-hover:text-sodium font-serif text-2xl leading-tight transition-colors duration-150 md:text-[2rem]">
                      {c.title}
                    </span>
                    <ArrowUpRight
                      className="text-muted-foreground group-hover:text-sodium size-4 self-center transition-colors duration-150 md:order-last"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span className="label-mono text-muted-foreground col-start-2 md:col-start-auto">{c.role}</span>
                    <span className="label-mono text-muted-foreground col-start-2 tabular-nums md:col-start-auto md:text-right">
                      {c.period}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 pt-32 md:px-10 md:pt-48" aria-labelledby="writing-title">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="label-mono text-sodium mb-4">05 — Notes</p>
              <h2 id="writing-title" className="font-serif text-5xl leading-none md:text-6xl">
                Field <em>notes</em>
              </h2>
              <p className="text-muted-foreground mt-6 max-w-xs text-[0.95rem] leading-relaxed">
                Pattern libraries, architectural thoughts, and pragmatic guides.
              </p>
              <Link
                href="/notes"
                className="label-mono text-muted-foreground hover:text-foreground mt-6 inline-flex h-11 items-center gap-2 transition-colors duration-150"
              >
                All writing <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
            <ul className="md:col-span-8">
              {notes.map((n) => (
                <li key={n.slug} className="border-hairline border-t last:border-b">
                  <Link href={`/notes/${n.slug}`} className="group block py-6">
                    <time dateTime={n.date} className="label-mono text-muted-foreground tabular-nums">
                      {n.dateLabel}
                    </time>
                    <span className="group-hover:text-sodium mt-2 block font-serif text-2xl leading-tight transition-colors duration-150 md:text-3xl">
                      {n.title}
                    </span>
                    <span className="text-muted-foreground mt-2 line-clamp-2 block max-w-xl text-sm leading-relaxed">
                      {n.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-4 pt-32 pb-24 md:px-10 md:pt-56 md:pb-32" aria-labelledby="contact-title">
          <div className="mx-auto max-w-6xl">
            <p className="label-mono text-sodium mb-6 flex items-center gap-3">
              <span className="bg-sodium inline-block size-1.5 rounded-full" aria-hidden="true" />
              06 — Open channel
            </p>
            <h2 id="contact-title" className="font-serif text-[15vw] leading-[0.85] tracking-[-0.03em] md:text-[9.5vw]">
              Let&rsquo;s route
              <br />
              <em className="text-sodium">the next signal.</em>
            </h2>
            <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="text-foreground/80 max-w-md text-[0.95rem] leading-relaxed">
                Open for inhouse & consulting (BTP / Architecture). Interested in robust SAP BTP architectures or Clean
                Core strategies? Get in touch.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${profile.socials.email}`}
                  className="bg-sodium text-primary-foreground inline-flex h-12 items-center gap-2 rounded-full pr-5 pl-6 text-sm font-medium transition-[scale,background-color] duration-150 ease-out hover:bg-[#ff9c4a] active:scale-[0.96]"
                >
                  {profile.socials.email}
                  <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden="true" />
                </a>
                <a
                  href={profile.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full pr-5 pl-6 text-sm font-medium shadow-[var(--shadow-border)] transition-[scale,box-shadow] duration-150 ease-out hover:shadow-[var(--shadow-border-hover)] active:scale-[0.96]"
                >
                  LinkedIn
                  <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed control-room HUD */}
      <div
        aria-hidden="true"
        data-hud-root
        className="label-mono text-muted-foreground pointer-events-none fixed top-24 right-10 z-[4] hidden items-center gap-3 transition-opacity duration-300 ease-out data-off:opacity-0 md:flex"
      >
        <span>Scene</span>
        <span data-hud="scene-idx" className="text-sodium tabular-nums">
          01
        </span>
        <span className="bg-hairline h-px w-8" />
        <span data-hud="scene" className="text-foreground/80 w-24">
          Hero
        </span>
      </div>
    </div>
  )
}
