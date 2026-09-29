import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import { profile } from '@/content/profile'

/** Closing call to action — the base camp at the bottom of the descent. */
export function BaseCamp() {
  return (
    <section aria-labelledby="basecamp-title" className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8 md:pt-40">
      <div className="bg-paper-deep relative overflow-hidden rounded-md px-6 py-14 md:px-14 md:py-20">
        <svg
          aria-hidden="true"
          className="text-contour pointer-events-none absolute -top-24 -right-24 size-[34rem] opacity-50"
          viewBox="0 0 200 200"
          fill="none"
        >
          {Array.from({ length: 9 }, (_, i) => (
            <ellipse
              key={i}
              cx={120 + i * 1.5}
              cy={80 - i}
              rx={20 + i * 11}
              ry={14 + i * 8.5}
              transform={`rotate(${-18 + i * 3} 120 80)`}
              stroke="currentColor"
              strokeWidth={i % 5 === 4 ? 1.2 : 0.5}
            />
          ))}
        </svg>
        <p className="marginalia text-muted-foreground relative">
          <span className="text-ochre-ink">V</span> · Base camp · contact
        </p>
        <h2
          id="basecamp-title"
          className="font-display relative mt-4 max-w-3xl text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] font-semibold tracking-[-0.04em]"
        >
          Planning the next survey?
        </h2>
        <p className="text-muted-foreground relative mt-5 max-w-xl font-serif text-[1.2rem] leading-snug md:text-[1.35rem]">
          Interested in robust SAP BTP architectures or Clean Core strategies? Currently open for inhouse &amp;
          consulting work (BTP / Architecture).
        </p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${profile.socials.email}`}
            className="btn bg-foreground text-background pr-3.5 pl-4 hover:bg-[color-mix(in_oklab,var(--foreground)_88%,var(--ochre))]"
          >
            {profile.socials.email}
            <Mail className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </a>
          <Link
            href="/contact"
            className="btn shadow-border hover:shadow-border-hover bg-background/60 pr-3.5 pl-4 transition-[scale,box-shadow]"
          >
            All channels
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
