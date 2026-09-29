'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

export type DriftNote = {
  slug: string
  title: string
  summary: string
  date: string
  displayDate: string
  tags: string[]
}

const tilt = [-2.2, 1.4, -0.8, 2.4, -1.6, 0.9, -2.6, 1.8]

/**
 * Scene 4 — notes are things left by the tide: specimen tags collected along
 * the flat. Pinned; vertical scroll walks the beach sideways.
 */
export function LeftByTheTide({ notes }: { notes: DriftNote[] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth)
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      // each tag settles as it drifts past the centre of the flat
      gsap.utils.toArray<HTMLElement>('[data-drift]', section).forEach((el, i) => {
        gsap.fromTo(
          el,
          { rotate: tilt[i % tilt.length] * 2.4, y: 18 },
          {
            rotate: tilt[i % tilt.length],
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              containerAnimation: tween,
              start: 'left 100%',
              end: 'left 45%',
              scrub: true,
            },
          }
        )
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="left-title"
      className="relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden py-16"
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted-foreground">04 — Left by the tide</p>
            <h2
              id="left-title"
              className="opsz-display mt-3 text-[2.6rem] leading-[0.95] font-light tracking-[-0.035em] md:text-[4.5rem]"
            >
              Notes, washed up.
            </h2>
          </div>
          <Link
            href="/notes"
            className="text-foreground hover:text-oxide inline-flex h-10 items-center gap-2 font-mono text-[0.8125rem] transition-colors duration-150"
          >
            All writing
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <ol
        ref={trackRef}
        className="mt-10 flex w-full snap-x snap-mandatory [scrollbar-width:none] gap-6 overflow-x-auto px-4 pt-6 pb-10 motion-safe:snap-none motion-safe:overflow-x-visible md:mt-14 md:gap-10 md:px-8 md:pl-[max(2rem,calc((100vw-1440px)/2+2rem))]"
      >
        {notes.map((note, i) => (
          <li
            key={note.slug}
            data-drift
            className="shrink-0 snap-start"
            style={{ transform: `rotate(${tilt[i % tilt.length]}deg)` }}
          >
            <Link
              href={`/notes/${note.slug}`}
              className={cn(
                'group bg-card shadow-lift relative flex h-[23rem] w-[17.5rem] flex-col rounded-[1.25rem] p-6 md:h-[26rem] md:w-[20rem]',
                'transition-[translate,box-shadow] duration-200 ease-out hover:-translate-y-1'
              )}
            >
              {/* punched tag hole + string */}
              <span aria-hidden="true" className="absolute top-5 right-5 flex items-center justify-center">
                <span className="bg-background shadow-border block size-3.5 rounded-full" />
                <svg className="text-clay absolute -top-8 left-1/2 h-9 w-10 -translate-x-1/2" viewBox="0 0 40 36">
                  <path
                    d="M20 34 C 18 22, 30 16, 26 2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <p className="eyebrow text-muted-foreground">
                No. {String(i + 1).padStart(2, '0')}
                <span className="text-clay mx-1.5">/</span>
                <time dateTime={note.date}>{note.displayDate}</time>
              </p>
              <h3 className="opsz-headline group-hover:text-oxide mt-6 text-[1.5rem] leading-[1.08] tracking-[-0.015em] transition-colors duration-150 md:text-[1.7rem]">
                {note.title}
              </h3>
              <p className="text-muted-foreground mt-3 line-clamp-4 text-[0.95rem] leading-snug">{note.summary}</p>
              <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4 font-mono text-[0.6875rem] text-[var(--slate)]">
                {note.tags.slice(0, 3).map((t) => (
                  <span key={t}>#{t.replace(/\s+/g, '')}</span>
                ))}
              </p>
            </Link>
          </li>
        ))}
        <li className="flex shrink-0 snap-start items-center pr-8">
          <Link
            href="/notes"
            className="opsz-headline hover:text-oxide inline-flex h-12 items-center gap-3 text-2xl transition-colors duration-150"
          >
            Walk the whole beach
            <ArrowRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </li>
      </ol>
    </section>
  )
}
