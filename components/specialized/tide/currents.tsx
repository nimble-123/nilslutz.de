'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { profile } from '@/content/profile'

gsap.registerPlugin(ScrollTrigger, SplitText)

const practices = [
  {
    no: '01',
    title: 'Clean Core & Architecture',
    description:
      'Strategic consulting for S/4HANA transformations. Avoiding technical debt through strict Clean Core Compliance.',
  },
  {
    no: '02',
    title: 'SAP BTP Extensions',
    description:
      'Development of scalable Side-by-Side Apps with CAP (Node.js/Java) or RAP (Steampunk/Private Cloud). Integration via BTP Destinations.',
  },
  {
    no: '03',
    title: 'Integration & Events',
    description:
      'Decoupling systems via Event-Driven Architecture (Event Mesh) and robust API Management (Cloud Integration/APIM).',
  },
]

const stack = [
  'SAP CAP',
  'SAP RAP',
  'SAP BTP',
  'SAP HANA',
  'Event Mesh',
  'OData v4',
  'Fiori Elements',
  'Node.js',
  'TypeScript',
  'Next.js',
  'Tailwind CSS',
  'Docker',
]

/**
 * Scene 3 — currents: the bio surfaces word by word as it scrolls through,
 * then the three practices read like a tide table.
 */
export function Currents() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create('[data-current-bio]', { type: 'words' })
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: '[data-current-bio]', start: 'top 80%', end: 'bottom 45%', scrub: true },
        }
      )
      gsap.fromTo(
        '[data-current-rule]',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          stagger: 0.15,
          scrollTrigger: { trigger: '[data-current-table]', start: 'top 85%', end: 'bottom 70%', scrub: true },
        }
      )
      return () => split.revert()
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} aria-labelledby="currents-title" className="relative w-full py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <p className="eyebrow text-muted-foreground">03 — Currents</p>
        <h2 id="currents-title" className="sr-only">
          What I do
        </h2>
        <p
          data-current-bio
          className="opsz-headline mt-6 max-w-[62rem] text-[1.6rem] leading-[1.22] tracking-[-0.015em] md:text-[2.75rem] md:leading-[1.12]"
        >
          {profile.shortBio}
        </p>

        <div data-current-table className="mt-20 md:mt-28">
          <div className="text-muted-foreground eyebrow hidden grid-cols-12 gap-6 pb-3 md:grid">
            <span className="col-span-1">No.</span>
            <span className="col-span-4">Practice</span>
            <span className="col-span-7">What moves</span>
          </div>
          <ul>
            {practices.map((p) => (
              <li key={p.no} className="relative grid grid-cols-12 gap-x-6 gap-y-2 py-6 md:py-8">
                <span
                  data-current-rule
                  aria-hidden="true"
                  className="bg-border absolute inset-x-0 top-0 h-px origin-left"
                />
                <span className="text-oxide col-span-2 font-mono text-sm tabular-nums md:col-span-1">{p.no}</span>
                <h3 className="opsz-headline col-span-10 text-2xl leading-tight tracking-[-0.015em] md:col-span-4 md:text-[1.75rem]">
                  {p.title}
                </h3>
                <p className="text-muted-foreground col-span-12 max-w-xl text-lg leading-snug md:col-span-7">
                  {p.description}
                </p>
              </li>
            ))}
          </ul>
          <div className="relative grid grid-cols-12 gap-6 pt-6">
            <span
              data-current-rule
              aria-hidden="true"
              className="bg-border absolute inset-x-0 top-0 h-px origin-left"
            />
            <span className="eyebrow text-muted-foreground col-span-12 md:col-span-1">Stack</span>
            <p className="col-span-12 font-mono text-[0.8125rem] leading-7 md:col-span-11">
              {stack.map((s, i) => (
                <span key={s}>
                  {s}
                  {i < stack.length - 1 && (
                    <span aria-hidden="true" className="text-clay mx-2">
                      ·
                    </span>
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
