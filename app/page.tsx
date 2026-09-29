import Link from 'next/link'
import { Metadata } from 'next'
import { format } from 'date-fns'
import { ArrowUpRight } from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { AvailabilityBadge } from '@/components/ui/availability-badge'
import { TideHero } from '@/components/specialized/tide/tide-hero'
import { TideLines } from '@/components/specialized/tide/tide-lines'
import { Currents } from '@/components/specialized/tide/currents'
import { LeftByTheTide } from '@/components/specialized/tide/left-by-the-tide'
import { Lighthouse } from '@/components/specialized/tide/lighthouse'
import { getCaseStudiesByRecency, getNotes } from '@/lib/content'
import { profile } from '@/content/profile'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'SAP Solution Architect & Lead Developer specializing in Clean Core, Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP. Portfolio and case studies.',
  openGraph: {
    title: 'Nils Lutz - SAP Solution Architect & Lead Developer',
    description:
      'SAP Solution Architect specializing in Clean Core architecture, Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP.',
    url: 'https://nilslutz.de',
  },
}

// Hide the hero copy before first paint so the one orchestrated load can reveal it (motion users only).
const introScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('tide-intro')}catch(e){}`

export default async function Page() {
  const [studies, notes] = await Promise.all([getCaseStudiesByRecency(), getNotes()])

  const lines = studies.map(({ slug, title, period, role }) => ({ slug, title, period, role }))
  const drift = notes.slice(0, 8).map((n) => ({
    slug: n.slug,
    title: n.title,
    summary: n.summary,
    date: n.date,
    displayDate: format(new Date(n.date), 'yyyy-MM-dd'),
    tags: n.tags ?? [],
  }))

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <Navbar overlay />
      <main className="flex-1">
        <TideHero />
        <TideLines items={lines} />
        <Currents />
        <LeftByTheTide notes={drift} />

        <section aria-labelledby="signal-title" className="relative w-full py-24 md:py-32">
          <div className="mx-auto grid max-w-[1440px] grid-cols-12 items-center gap-x-6 gap-y-12 px-4 md:px-8">
            <div className="col-span-12 md:col-span-6 lg:col-span-5">
              <Lighthouse />
            </div>
            <div className="col-span-12 md:col-span-6 lg:col-span-6 lg:col-start-7">
              <p className="eyebrow text-muted-foreground">05 — Signal</p>
              <h2
                id="signal-title"
                className="opsz-display mt-3 text-[2.6rem] leading-[0.95] font-light tracking-[-0.035em] md:text-[4.5rem]"
              >
                Before the water comes back in.
              </h2>
              <p className="text-muted-foreground mt-5 max-w-md text-lg leading-snug">
                Interested in robust SAP BTP architectures or Clean Core strategies? Get in touch.
              </p>
              <div className="mt-6">
                <AvailabilityBadge />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`mailto:${profile.socials.email}`}
                  className="bg-foreground text-background inline-flex h-11 items-center gap-2 rounded-full pr-4 pl-5 font-mono text-[0.8125rem] transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
                >
                  {profile.socials.email}
                  <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
                </a>
                <Link
                  href="/contact"
                  className="text-foreground shadow-border hover:shadow-border-hover inline-flex h-11 items-center rounded-full px-5 font-mono text-[0.8125rem] transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
                >
                  {profile.ctas.secondary}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
