import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import { Metadata } from 'next'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { IndexRow } from '@/components/ui/index-row'
import { RiveMachine } from '@/components/ui/rive-machine'
import { Hero } from '@/components/specialized/hero'
import { Manifesto } from '@/components/specialized/manifesto'
import { PosterSequence, type PosterService } from '@/components/specialized/poster-sequence'
import { StackMarquee } from '@/components/specialized/stack-marquee'
import { getCaseStudies, getNotes } from '@/lib/content'
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

const services: PosterService[] = [
  {
    title: 'Clean Core & Architecture',
    description:
      'Strategic consulting for S/4HANA transformations. Avoiding technical debt through strict Clean Core Compliance.',
    motif: 'core',
  },
  {
    title: 'SAP BTP Extensions',
    description:
      'Development of scalable Side-by-Side Apps with CAP (Node.js/Java) or RAP (Steampunk/Private Cloud). Integration via BTP Destinations.',
    motif: 'side',
  },
  {
    title: 'Integration & Events',
    description:
      'Decoupling systems via Event-Driven Architecture (Event Mesh) and robust API Management (Cloud Integration/APIM).',
    motif: 'events',
  },
]

const stack = [
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'SAP CAP',
  'SAP RAP',
  'Node.js',
  'SAP BTP',
  'SAP HANA',
  'Event Mesh',
  'OData v4',
  'Fiori Elements',
  'Docker',
]

const principles = [
  'Clean Core compliance',
  'API-first integration',
  'Event-driven architectures',
  'Docs as Code',
  'Enterprise Pragmatism',
]

export default async function Page() {
  const [allCaseStudies, notes] = await Promise.all([getCaseStudies(), getNotes()])
  const featured = allCaseStudies
    .filter((cs) => cs.featured)
    .slice(0, 4)
    .map(({ slug, title, summary, tags, period, role, metrics }) => ({
      slug,
      title,
      summary,
      tags,
      period,
      role,
      metrics,
    }))
  const statement = `${profile.shortBio.split('. ')[0]}.`
  const latest = notes.slice(0, 4)

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <Hero />
        <Manifesto statement={statement} principles={principles} />
        <PosterSequence services={services} studies={featured} totalStudies={allCaseStudies.length} />
        <StackMarquee stack={stack} />

        {/* Writing index */}
        <section aria-labelledby="writing-title" className="shell pt-8 pb-24 md:pb-32">
          <div className="grid-poster items-end gap-y-4 pb-6 shadow-[0_2px_0_var(--foreground)]">
            <p className="label col-span-4 md:col-span-3">
              <span className="text-signal">(05)</span> Latest notes
            </p>
            <h2
              id="writing-title"
              className="type-display col-span-4 text-[clamp(2.6rem,7vw,7rem)] md:col-span-6 md:col-start-4"
            >
              Writing
            </h2>
            <Link
              href="/notes"
              className="label hover:text-signal col-span-4 inline-flex h-11 items-center gap-2 justify-self-start transition-colors duration-150 md:col-span-3 md:justify-self-end"
            >
              All notes <ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
          {latest.map((note, i) => (
            <IndexRow
              key={note.slug}
              href={`/notes/${note.slug}`}
              index={String(i + 1).padStart(2, '0')}
              meta={<time dateTime={note.date}>{format(new Date(note.date), 'dd.MM.yyyy')}</time>}
              title={note.title}
              tags={note.tags}
              headingLevel="h3"
            />
          ))}
        </section>

        {/* Closing poster */}
        <section aria-labelledby="closing-title" className="bg-signal text-ink relative py-20 md:py-28">
          <div className="shell grid-poster items-end gap-y-10">
            <div className="col-span-4 md:col-span-7">
              <p className="label mb-6">(06) Contact</p>
              <h2
                id="closing-title"
                className="text-[clamp(2.4rem,5.6vw,5.8rem)] leading-[0.92] font-black tracking-[-0.02em] uppercase [font-stretch:112.5%]"
              >
                Interested in robust SAP BTP architectures or Clean Core strategies?
              </h2>
              <Link
                href="/contact"
                className="press bg-ink text-paper hover:bg-paper hover:text-ink mt-10 inline-flex h-14 items-center gap-3 pr-5 pl-6 text-base font-bold tracking-wide uppercase"
              >
                Get in Touch
                <ArrowRight className="size-5" strokeWidth={2.5} aria-hidden="true" />
              </Link>
            </div>
            <RiveMachine className="col-span-4 md:col-span-4 md:col-start-9" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
