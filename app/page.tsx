import Link from 'next/link'
import { Metadata } from 'next'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { LineStory } from '@/components/specialized/line/line-story'
import { toMarks } from '@/components/specialized/line/story-data'
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

export default async function Page() {
  const [studies, notes] = await Promise.all([getCaseStudies(), getNotes()])
  const marks = toMarks(studies)
  const latest = notes.slice(0, 5)

  return (
    <>
      <Navbar intro />
      <main className="flex-1">
        <LineStory marks={marks} name={profile.name} role={profile.role} />

        {/* ── Writing: the line lies down as the rule under the list ─────────── */}
        <section aria-labelledby="home-writing" className="frame pt-[22vh]">
          <div className="flex items-end justify-between pb-3">
            <h2 id="home-writing" className="text-[0.8125rem] font-medium">
              Writing
            </h2>
            <Link href="/notes" className="ink-link label hover:text-foreground">
              All writing
            </Link>
          </div>
          <div data-anchor="rule" className="rule-anchor h-px" />
          <ul>
            {latest.map((note) => (
              <li key={note.slug} className="border-border border-b">
                <Link href={`/notes/${note.slug}`} className="group grid-line gap-y-1 py-4 md:items-baseline md:py-5">
                  <time dateTime={note.date} className="label col-span-2 tabular-nums md:col-span-1">
                    {note.date}
                  </time>
                  <span className="col-span-2 text-[0.9375rem] leading-snug tracking-[-0.005em]">
                    <span className="ink-link">{note.title}</span>
                  </span>
                  <span className="label hidden text-right md:block">{note.tags?.slice(0, 2).join(' · ')}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Contact: the line ends in a single point ───────────────────────── */}
        <section aria-labelledby="home-contact" className="frame pt-[34vh]">
          <div className="grid-line gap-y-6">
            <h2 id="home-contact" className="label">
              Contact
            </h2>
            <div className="col-span-2 md:col-span-3">
              <p
                data-reveal
                className="max-w-[24ch] text-[1.375rem] leading-[1.3] tracking-[-0.02em] md:text-[1.75rem]"
              >
                Interested in robust SAP BTP architectures or Clean Core strategies?
              </p>
              <p className="mt-10 flex items-center gap-3">
                <a
                  href={`mailto:${profile.socials.email}`}
                  className="ink-link text-[1.375rem] tracking-[-0.02em] md:text-[1.75rem]"
                >
                  {profile.socials.email}
                </a>
                <span
                  data-anchor="point"
                  aria-hidden="true"
                  className="line-fallback bg-signal inline-block size-1.5 shrink-0 translate-y-px rounded-full"
                />
              </p>
              <p className="text-muted-foreground mt-4 text-[0.8125rem]">
                Open for inhouse &amp; consulting work — BTP and architecture.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
