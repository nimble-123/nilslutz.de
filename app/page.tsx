import Link from 'next/link'
import { Metadata } from 'next'
import { format } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { WallText } from '@/components/ui/wall-text'
import { MonolithStory } from '@/components/specialized/monolith/monolith-story'
import { buildExhibits } from '@/components/specialized/monolith/exhibits'
import { getCaseStudies, getNotes } from '@/lib/content'

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

const principles = [
  {
    title: 'Docs as Code',
    text: 'Documentation lives with the code. I use arc42-light and ADRs to capture architectural decisions where they happen.',
  },
  {
    title: 'Clean Core',
    text: 'Strict separation of standard and custom code. Extensions run Side-by-Side on BTP or via released APIs on-stack.',
  },
  {
    title: 'Automated Quality Gates',
    text: 'CI/CD pipelines are mandatory. Static code analysis (ESLint, ABAP Test Cockpit) ensures consistent quality.',
  },
  {
    title: 'User Centricity',
    text: 'Fiori Guidelines are there for a reason. Consistent UX reduces training costs and increases adoption.',
  },
]

const materials = [
  'SAP CAP',
  'SAP RAP',
  'SAP BTP',
  'SAP HANA',
  'Event Mesh',
  'OData v4',
  'Fiori Elements',
  'Node.js',
  'TypeScript',
  'Docker',
  'Next.js',
  'Tailwind CSS',
]

export default async function Page() {
  const [caseStudies, notes] = await Promise.all([getCaseStudies(), getNotes()])
  const exhibits = buildExhibits(caseStudies)

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <MonolithStory exhibits={exhibits} />

        {/* ————— Catalogue of works ————— */}
        <section id="catalogue" className="scroll-mt-24 px-4 pt-32 md:px-8 md:pt-48">
          <div className="mx-auto max-w-[88rem]">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-4">
                <p className="label-caps text-muted-foreground flex items-center gap-3">
                  <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
                  Catalogue
                </p>
              </div>
              <div className="md:col-span-8">
                <WallText
                  as="h2"
                  className="font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-[1] font-light tracking-[-0.01em]"
                >
                  Selected works, <em>catalogued.</em>
                </WallText>
                <p className="text-muted-foreground mt-6 max-w-xl text-lg">
                  Selected projects demonstrating Clean Core architecture, SAP BTP extensions, and enterprise
                  integration patterns.
                </p>
              </div>
            </div>

            <ol className="mt-16 md:mt-24">
              {caseStudies.map((cs, i) => (
                <li key={cs.slug} className="border-border border-t last:border-b">
                  <Link
                    href={`/work/${cs.slug}`}
                    className="group hover:bg-foreground/[0.025] grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 py-7 transition-colors duration-150 md:grid-cols-12 md:gap-x-8 md:px-2"
                  >
                    <span className="label-caps text-muted-foreground pt-2 tabular-nums md:col-span-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="md:col-span-6">
                      <span className="font-display block text-[1.9rem] leading-[1.08] md:text-[2.3rem]">
                        <em className="font-light">{cs.title}</em>
                      </span>
                      <span className="text-muted-foreground mt-2 line-clamp-2 block max-w-xl text-[0.98rem]">
                        {cs.summary}
                      </span>
                    </span>
                    <span className="text-muted-foreground col-start-2 text-[0.95rem] italic md:col-span-3 md:col-start-auto md:pt-3">
                      {cs.stack.slice(0, 3).join(', ')}
                    </span>
                    <span className="col-start-2 flex items-center justify-between gap-4 md:col-span-2 md:col-start-auto md:flex-col md:items-end md:justify-start md:pt-3">
                      <span className="label-caps text-foreground tabular-nums">{cs.period}</span>
                      <ArrowRight
                        className="text-brass-ink size-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ————— Wall text: principles ————— */}
        <section className="px-4 pt-40 md:px-8 md:pt-56">
          <div className="mx-auto max-w-[88rem]">
            <p className="label-caps text-muted-foreground flex items-center gap-3">
              <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
              Enterprise Pragmatism
            </p>
            <WallText className="font-display mt-8 max-w-5xl text-[clamp(2rem,4.4vw,4rem)] leading-[1.08] font-light tracking-[-0.01em]">
              Software used in large corporations must be robust, maintainable, and deliver{' '}
              <em>measurable value.</em>
            </WallText>
            <dl className="mt-20 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {principles.map((pr, i) => (
                <div key={pr.title} className="border-border border-t pt-5">
                  <dt className="flex items-baseline gap-3">
                    <span className="label-caps text-muted-foreground tabular-nums">
                      {['i', 'ii', 'iii', 'iv'][i]}.
                    </span>
                    <span className="font-display text-2xl">{pr.title}</span>
                  </dt>
                  <dd className="text-muted-foreground mt-3 text-[0.98rem]">{pr.text}</dd>
                </div>
              ))}
            </dl>
            <p className="text-muted-foreground mt-20 max-w-4xl text-[0.98rem] leading-loose">
              <span className="label-caps text-foreground mr-3">Materials</span>
              <span className="italic">{materials.join(', ')}.</span>
            </p>
          </div>
        </section>

        {/* ————— Reading room ————— */}
        <section className="px-4 pt-40 md:px-8 md:pt-56">
          <div className="mx-auto max-w-[88rem]">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="label-caps text-muted-foreground flex items-center gap-3">
                  <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
                  Reading Room
                </p>
                <h2 className="font-display mt-6 text-[clamp(2.4rem,5vw,4.5rem)] leading-none font-light">
                  Recent <em>writing</em>
                </h2>
              </div>
              <Link
                href="/notes"
                className="label-caps text-muted-foreground hover:text-foreground group inline-flex h-11 items-center gap-2"
              >
                All notes
                <ArrowRight
                  className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </Link>
            </div>
            <ul className="mt-14 grid gap-5 md:grid-cols-3">
              {notes.slice(0, 3).map((note) => (
                <li key={note.slug}>
                  <Link
                    href={`/notes/${note.slug}`}
                    className="bg-card/70 shadow-border hover:shadow-border-hover flex h-full flex-col rounded-lg p-6 transition-[box-shadow] duration-150 ease-out"
                  >
                    <time dateTime={note.date} className="label-caps text-muted-foreground tabular-nums">
                      {format(new Date(note.date), 'd MMMM yyyy')}
                    </time>
                    <span className="font-display mt-4 text-[1.65rem] leading-[1.12]">{note.title}</span>
                    <span className="text-muted-foreground mt-3 line-clamp-3 text-[0.95rem]">{note.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
