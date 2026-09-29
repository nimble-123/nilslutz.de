'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { profile } from '@/content/profile'
import { getGsap, SplitText } from '@/lib/motion/gsap'
import { getScrollVelocity, prefersReducedMotion } from '@/lib/motion/scroll'
import { cappedDpr, hasWebGL2, isCoarsePointer, onThemeChange, readToken } from '@/lib/motion/webgl'
import { fitLine, STRETCH_KEYWORDS, stretchKeyword } from '@/lib/type-fit'
import type { LiquidTypeEngine } from '@/components/specialized/liquid-type-engine'

// Set in caps in the source (not via text-transform) so the canvas mask draws the same glyphs
const LINES = ['NILS', 'LUTZ']

type LineFit = { stretch: number; fontSize: number }

/** Justify every wordmark line to the full measure using only the width axis + a size nudge. */
function fitWordmark(box: HTMLElement, lines: HTMLElement[]): LineFit[] {
  const W = box.clientWidth
  const H = box.clientHeight
  const LEADING = 0.8
  // Height budget: all lines at line-height 0.8 must fit the box, and never taller than the measure allows
  let base = Math.max(56, Math.min(H / (LEADING * lines.length * 1.05), W * 0.42))
  let fits: LineFit[] = []
  for (let pass = 0; pass < 4; pass++) {
    fits = lines.map((line) => {
      line.style.fontSize = `${base}px`
      const measured: Record<number, number> = {}
      for (const s of STRETCH_KEYWORDS) {
        line.style.fontStretch = `${s.value}%`
        measured[s.value] = line.offsetWidth
      }
      const { stretch, scale } = fitLine(measured, W, 1.2)
      const fontSize = Math.floor(base * scale * 100) / 100
      line.style.fontStretch = `${stretch}%`
      line.style.fontSize = `${fontSize}px`
      return { stretch, fontSize }
    })
    const total = fits.reduce((sum, f) => sum + f.fontSize * LEADING, 0)
    if (total <= H || H <= 0) break
    base *= (H / total) * 0.99
  }
  return fits
}

/** Draws the (transparent) DOM glyphs into a white-on-black mask canvas at the same positions. */
function drawMask(
  mask: HTMLCanvasElement,
  host: HTMLElement,
  lines: HTMLElement[],
  fits: LineFit[],
  dpr: number,
  fontFamily: string
) {
  const hostRect = host.getBoundingClientRect()
  mask.width = Math.max(1, Math.round(hostRect.width * dpr))
  mask.height = Math.max(1, Math.round(hostRect.height * dpr))
  const ctx = mask.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, mask.width, mask.height)
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'alphabetic'

  lines.forEach((line, i) => {
    const fit = fits[i]
    const keyword = stretchKeyword(fit.stretch)
    const fontPx = fit.fontSize * dpr
    ctx.font = `900 ${keyword} ${fontPx}px ${fontFamily}`
    const ctxWithStretch = ctx as CanvasRenderingContext2D & { fontStretch?: string }
    if ('fontStretch' in ctx) ctxWithStretch.fontStretch = keyword

    // baseline probe: a zero-size inline-block sits exactly on the line's baseline
    const probe = document.createElement('span')
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
    line.appendChild(probe)
    const baseline = (probe.getBoundingClientRect().top - hostRect.top) * dpr
    probe.remove()

    const letterSpacing = parseFloat(getComputedStyle(line).letterSpacing) || 0
    line.querySelectorAll<HTMLElement>('.hero-char').forEach((el) => {
      const r = el.getBoundingClientRect()
      const ch = el.textContent ?? ''
      const expected = (r.width - letterSpacing) * dpr
      const measured = ctx.measureText(ch).width
      const sx = measured > 0 && Math.abs(expected / measured - 1) > 0.02 ? expected / measured : 1
      ctx.save()
      ctx.translate((r.left - hostRect.left) * dpr, baseline)
      ctx.scale(sx, 1)
      ctx.fillText(ch, 0, 0)
      ctx.restore()
    })
  })
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const gsap = getGsap()
    const section = sectionRef.current
    const box = boxRef.current
    const h1 = h1Ref.current
    const canvas = canvasRef.current
    if (!section || !box || !h1 || !canvas) return

    const reduced = prefersReducedMotion()
    const lines = Array.from(h1.querySelectorAll<HTMLElement>('[data-line]'))
    let fits: LineFit[] = []
    let engine: LiquidTypeEngine | null = null
    let disposed = false
    let visible = true
    let split: SplitText[] = []
    const cleanups: Array<() => void> = []
    const mask = document.createElement('canvas')
    const dpr = cappedDpr()

    const refit = () => {
      fits = fitWordmark(box, lines)
    }

    const ctx = gsap.context(() => {}, section)

    const start = async () => {
      await document.fonts.ready
      if (disposed) return
      refit()

      split = lines.map((line) => SplitText.create(line, { type: 'chars', charsClass: 'hero-char' }))
      const chars = split.flatMap((s) => s.chars as HTMLElement[])
      const intro = section.querySelectorAll<HTMLElement>('[data-intro]')

      if (reduced) {
        gsap.set([h1, ...intro], { autoAlpha: 1 })
        return
      }

      ctx.add(() => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.set(h1, { autoAlpha: 1 })
        lines.forEach((line, i) => {
          const lineChars = split[i].chars as HTMLElement[]
          tl.fromTo(
            lineChars,
            { yPercent: 102, fontVariationSettings: `'wdth' 50` },
            {
              yPercent: 0,
              fontVariationSettings: `'wdth' ${fits[i]?.stretch ?? 125}`,
              duration: 1.25,
              stagger: 0.06,
              clearProps: 'fontVariationSettings,transform',
            },
            i * 0.14
          )
        })
        tl.fromTo(
          intro,
          { autoAlpha: 0, y: 12, filter: 'blur(4px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.1, ease: 'power2.out' },
          0.75
        )
        tl.add(() => {
          void bootLiquid(chars)
        }, '>-0.2')
      })
    }

    const bootLiquid = async (chars: HTMLElement[]) => {
      if (disposed || !chars.length || !hasWebGL2()) return
      const { LiquidTypeEngine } = await import('@/components/specialized/liquid-type-engine')
      if (disposed) return
      const fontFamily = getComputedStyle(h1).fontFamily
      const draw = () => drawMask(mask, section, lines, fits, dpr, fontFamily)
      draw()
      try {
        engine = new LiquidTypeEngine(canvas, mask, {
          coarse: isCoarsePointer(),
          dpr,
          ink: readToken('--foreground', '#121211'),
          signal: readToken('--signal', '#ff4a1c'),
        })
      } catch {
        engine = null
        return
      }
      const rect = section.getBoundingClientRect()
      engine.resize(rect.width, rect.height)
      engine.updateText()

      if (hintRef.current) gsap.to(hintRef.current, { autoAlpha: 1, duration: 0.4, delay: 1.2 })

      // Hand over: DOM glyphs become transparent (still selectable, still read by AT/SEO), WebGL takes over
      const handover = { v: 0 }
      gsap.to(handover, {
        v: 1,
        duration: 0.35,
        ease: 'power1.out',
        onUpdate: () => {
          if (!engine) return
          engine.reveal = handover.v
          h1.style.color = handover.v >= 1 ? 'transparent' : ''
        },
      })

      // A single choreographed stroke through both lines shows the sheet is liquid (part of the one page-load)
      const swipe = { x: -0.05, y: 0 }
      const r0 = box.getBoundingClientRect()
      const s0 = section.getBoundingClientRect()
      const top = r0.top - s0.top
      gsap
        .timeline({ delay: 0.15 })
        .fromTo(
          swipe,
          { x: -0.05, y: 0.3 },
          {
            x: 1.05,
            y: 0.62,
            duration: 1.1,
            ease: 'power2.inOut',
            onUpdate: () => engine?.move(swipe.x * s0.width, top + swipe.y * r0.height),
          }
        )
        .add(() => engine?.leave())

      const onTheme = () => {
        engine?.setColors(readToken('--foreground', '#121211'), readToken('--signal', '#ff4a1c'))
      }
      cleanups.push(onThemeChange(onTheme))

      const tick = (_t: number, deltaMs: number) => {
        if (!engine || !visible || document.hidden) return
        const now = performance.now()
        const v = getScrollVelocity()
        if (Math.abs(v) > 0.5) engine.wake()
        if (!engine.isAwake(now) && handover.v >= 1) return
        engine.render(Math.min(deltaMs, 50) / 1000, v)
      }
      gsap.ticker.add(tick)
      cleanups.push(() => gsap.ticker.remove(tick))

      const toLocal = (clientX: number, clientY: number) => {
        const r = section.getBoundingClientRect()
        engine?.move(clientX - r.left, clientY - r.top)
      }
      const onPointer = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return
        toLocal(e.clientX, e.clientY)
      }
      const onTouch = (e: TouchEvent) => {
        const t = e.touches[0]
        if (t) toLocal(t.clientX, t.clientY)
      }
      const onLeave = () => engine?.leave()
      section.addEventListener('pointermove', onPointer, { passive: true })
      section.addEventListener('pointerleave', onLeave, { passive: true })
      section.addEventListener('touchstart', onTouch, { passive: true })
      section.addEventListener('touchmove', onTouch, { passive: true })
      section.addEventListener('touchend', onLeave, { passive: true })
      cleanups.push(() => {
        section.removeEventListener('pointermove', onPointer)
        section.removeEventListener('pointerleave', onLeave)
        section.removeEventListener('touchstart', onTouch)
        section.removeEventListener('touchmove', onTouch)
        section.removeEventListener('touchend', onLeave)
      })

      // Re-typeset + redraw the texture on resize
      let raf = 0
      let lastW = section.clientWidth
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf)
        raf = requestAnimationFrame(() => {
          if (!engine) return
          const w = section.clientWidth
          // ignore pure height jitter from mobile URL bars
          if (Math.abs(w - lastW) < 2 && isCoarsePointer()) return
          lastW = w
          refit()
          draw()
          const r = section.getBoundingClientRect()
          engine.resize(r.width, r.height)
          engine.updateText()
        })
      })
      ro.observe(section)
      cleanups.push(() => {
        ro.disconnect()
        cancelAnimationFrame(raf)
      })
    }

    // Pause when the hero is offscreen
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) engine?.wake()
    })
    io.observe(section)

    // Before the liquid layer exists (or without WebGL) keep the DOM wordmark fitted
    const domResize = () => {
      if (!engine) refit()
    }
    window.addEventListener('resize', domResize)

    void start()

    return () => {
      disposed = true
      io.disconnect()
      window.removeEventListener('resize', domResize)
      cleanups.forEach((fn) => fn())
      ctx.revert()
      split.forEach((s) => s.revert())
      engine?.dispose()
      engine = null
      h1.style.color = ''
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100svh-3.5rem)] flex-col overflow-hidden pt-5 pb-6 md:pt-6 md:pb-8"
      aria-labelledby="hero-title"
    >
      {/* WebGL liquid sheet (full bleed, behind the interactive layer) */}
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 size-full" />

      {/* Registration marks */}
      <span aria-hidden="true" className="text-foreground/40 pointer-events-none absolute top-2 left-2 z-10 text-xs">
        +
      </span>
      <span aria-hidden="true" className="text-foreground/40 pointer-events-none absolute top-2 right-2 z-10 text-xs">
        +
      </span>

      <div className="shell grid-poster relative z-10 gap-y-2">
        <p data-intro className="label col-span-2 md:col-span-3">
          <span className="text-signal">(01)</span> Portfolio
        </p>
        <p data-intro className="label col-span-2 text-right md:col-span-3 md:text-left">
          {profile.role}
        </p>
        <p data-intro className="label text-muted-foreground col-span-3 hidden md:block">
          Clean Core · CAP · RAP · Fiori · BTP
        </p>
        <p data-intro className="label text-muted-foreground col-span-3 hidden text-right md:block">
          Based in {profile.location}
        </p>
      </div>

      {/* The wordmark box: flex-1, the lines are justified to its measure */}
      <div className="shell relative z-10 flex flex-1 flex-col py-3 md:py-4">
        <div ref={boxRef} className="relative min-h-[40svh] flex-1 md:min-h-[280px]">
          <h1
            ref={h1Ref}
            id="hero-title"
            aria-label={profile.name}
            className="text-foreground invisible absolute inset-0 flex flex-col justify-center font-black tracking-[-0.012em] uppercase select-none"
          >
            {LINES.map((line) => (
              <span
                key={line}
                data-line
                className="block w-max overflow-hidden text-[23vw] leading-[0.8] whitespace-nowrap [font-stretch:125%] md:text-[18vw]"
              >
                {line}
              </span>
            ))}
          </h1>
        </div>
        <p
          ref={hintRef}
          aria-hidden="true"
          className="label text-muted-foreground invisible mt-2 self-end [@media(pointer:coarse)]:hidden"
        >
          (Drag the cursor through the letters)
        </p>
        <p
          aria-hidden="true"
          className="label text-muted-foreground mt-2 hidden self-end [@media(pointer:coarse)]:block"
        >
          (Swipe through the letters)
        </p>
      </div>

      <div className="shell grid-poster relative z-10 items-end gap-y-6">
        <p
          data-intro
          className="col-span-4 max-w-[34ch] text-[1.2rem] leading-[1.25] font-medium md:col-span-6 md:text-[1.6rem]"
        >
          I architect <span className="text-signal font-bold">Clean-Core compliant</span> SAP solutions on{' '}
          <span className="font-bold">BTP/CAP/RAP/Fiori</span> – and set the standards they run on.
        </p>

        <div
          data-intro
          className="col-span-4 flex flex-wrap items-center gap-2 md:col-span-4 md:col-start-8 md:justify-end"
        >
          <Link
            href="/work"
            className="press bg-foreground text-background hover:bg-signal hover:text-ink inline-flex h-12 items-center gap-2 pr-4 pl-5 text-sm font-bold tracking-wide uppercase"
          >
            {profile.ctas.primary}
            <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <Link
            href="/contact"
            className="press hover:bg-foreground hover:text-background inline-flex h-12 items-center px-5 text-sm font-bold tracking-wide uppercase shadow-[inset_0_0_0_2px_currentColor]"
          >
            {profile.ctas.secondary}
          </Link>
        </div>

        <div
          data-intro
          className="label text-muted-foreground col-span-1 col-start-4 hidden flex-col items-end gap-1 md:col-start-12 md:flex"
        >
          Scroll
          <ArrowDown className="size-4" strokeWidth={2} aria-hidden="true" />
        </div>
      </div>
      <noscript>
        <style>{`#hero-title{visibility:visible!important}[data-intro]{opacity:1!important}`}</style>
      </noscript>
    </section>
  )
}
