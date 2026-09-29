'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'
import type { TerrainHandle } from '@/components/webgl/terrain-canvas'
import type { SurveyPoint } from '@/lib/survey'
import { TrigPoint } from '@/components/ui/trig-point'

gsap.registerPlugin(ScrollTrigger)

const TerrainCanvas = dynamic(() => import('@/components/webgl/terrain-canvas').then((m) => m.TerrainCanvas), {
  ssr: false,
})

export type RegisterItem = {
  slug: string
  title: string
  summary: string
  period: string
  role: string
  tags: string[]
  point: SurveyPoint
}

export function SurveyRegister({ items }: { items: RegisterItem[] }) {
  const listRef = useRef<HTMLOListElement>(null)
  const terrainRef = useRef<TerrainHandle>(null)
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)

  // Peaks follow the register: the active survey point is pushed up.
  useEffect(() => {
    terrainRef.current?.setPeaks(
      items.map((it, i) => ({ x: it.point.u, y: it.point.v, amp: i === active ? 0.3 : 0.1 }))
    )
  }, [active, items, ready])

  // Scroll-linked: whichever register row crosses the reading line becomes the active point.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-row]'))
    const triggers = rows.map((row, i) =>
      ScrollTrigger.create({
        trigger: row,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) setActive(i)
        },
      })
    )
    return () => triggers.forEach((t) => t.kill())
  }, [items.length])

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <figure className="shadow-border relative aspect-[4/3.4] w-full overflow-hidden rounded-[3px] lg:aspect-auto lg:h-[calc(100svh-9rem)]">
            <TerrainCanvas
              mode="map"
              seed={4.7}
              levels={17}
              scale={2.4}
              grid={0.4}
              className="absolute inset-0"
              handleRef={terrainRef}
              onSupport={(ok) => setReady(ok)}
            />
            {items.map((it, i) => (
              <button
                key={it.slug}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'absolute flex -translate-x-1/2 -translate-y-[70%] items-center gap-1.5 rounded-sm p-2 transition-colors duration-150',
                  i === active ? 'text-foreground z-10' : 'text-foreground/70 hover:text-foreground'
                )}
                style={{ left: `${it.point.u * 100}%`, top: `${it.point.v * 100}%` }}
                aria-label={`${it.point.label}: ${it.title}`}
                aria-pressed={i === active}
              >
                <TrigPoint active={i === active} className="size-4" />
                <span
                  className={cn(
                    'marginalia px-0.5 transition-[background-color] duration-150',
                    i === active ? 'bg-background' : 'bg-transparent'
                  )}
                >
                  {it.point.label}
                </span>
              </button>
            ))}
            <figcaption className="marginalia text-muted-foreground bg-background/85 absolute bottom-0 left-0 m-2 px-1.5 py-1">
              Sheet 03 · survey points · grid 1 km
            </figcaption>
            <span
              aria-hidden="true"
              className="marginalia text-muted-foreground bg-background/85 absolute top-0 right-0 m-2 px-1.5 py-1"
            >
              N ↑
            </span>
          </figure>
          <p className="marginalia text-muted-foreground mt-3 hidden tabular-nums lg:block">
            Active: {items[active]?.point.label} · {items[active]?.point.easting} · {items[active]?.point.northing}
          </p>
        </div>
      </div>

      <ol ref={listRef} className="lg:col-span-7">
        {items.map((it, i) => (
          <li
            key={it.slug}
            data-row
            onMouseEnter={() => setActive(i)}
            className="group relative border-t border-[var(--rule)] last:border-b"
          >
            <Link
              href={`/work/${it.slug}`}
              onFocus={() => setActive(i)}
              className="block py-7 transition-[background-color] duration-150 ease-out md:py-9"
            >
              <div className="marginalia text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className={cn('inline-flex items-center gap-1.5', i === active && 'text-foreground')}>
                  <TrigPoint active={i === active} className="size-3.5" />
                  {it.point.label}
                </span>
                <span className="tabular-nums">
                  {it.point.easting} · {it.point.northing}
                </span>
                <span className="ml-auto tabular-nums">{it.period}</span>
              </div>
              <h3 className="font-display mt-3 flex items-start gap-2 text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.08] font-semibold tracking-[-0.025em]">
                <span className="decoration-ochre underline-offset-[6px] group-hover:underline">{it.title}</span>
                <ArrowUpRight
                  className="text-muted-foreground group-hover:text-foreground mt-1 size-5 shrink-0 transition-[color,translate] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </h3>
              <p className="text-muted-foreground mt-2 line-clamp-2 max-w-2xl font-serif text-[1.08rem] leading-snug">
                {it.summary}
              </p>
              <p className="marginalia text-muted-foreground mt-3">
                {it.role} · {it.tags.slice(0, 3).join(' / ')}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
