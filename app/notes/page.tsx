import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader, PageShell } from '@/components/ui/page-header'
import { getNotes } from '@/lib/content'
import Link from 'next/link'
import { format } from 'date-fns'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Technical writing on SAP CAP patterns, Clean Core architecture, design patterns, and pragmatic guides for enterprise development. Insights on Repository Pattern, Dependency Injection, and event-driven architectures.',
  openGraph: {
    title: 'Writing - Nils Lutz',
    description: 'Pattern libraries, architectural thoughts, and pragmatic guides for SAP BTP development.',
    url: 'https://nilslutz.de/notes',
  },
}

export default async function NotesPage() {
  const notes = await getNotes()

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          eyebrow={
            <>
              Notes · <span className="tabular-nums">{String(notes.length).padStart(2, '0')}</span> left by the tide
            </>
          }
          title="Writing"
          lede="Pattern libraries, architectural thoughts, and pragmatic guides."
        />
        <ol>
          {notes.map((note, i) => (
            <li key={note.slug} className="border-border border-b">
              <article className="group relative -mx-3 grid grid-cols-12 gap-x-6 gap-y-2 rounded-xl px-3 py-7 transition-colors duration-150 hover:bg-[color-mix(in_oklch,var(--foreground)_2.5%,transparent)] md:py-9">
                <p className="col-span-12 flex items-baseline gap-4 font-mono text-xs tabular-nums md:col-span-2 md:flex-col md:gap-1">
                  <span className="text-oxide">No. {String(i + 1).padStart(2, '0')}</span>
                  <time dateTime={note.date} className="text-muted-foreground">
                    {format(new Date(note.date), 'MMM d, yyyy')}
                  </time>
                </p>
                <div className="col-span-12 md:col-span-7">
                  <h2 className="opsz-headline group-hover:text-oxide text-[1.5rem] leading-[1.1] tracking-[-0.015em] transition-colors duration-150 md:text-[1.9rem]">
                    <Link href={`/notes/${note.slug}`}>
                      <span className="absolute inset-0" aria-hidden="true" />
                      {note.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mt-2 max-w-2xl text-[1.05rem] leading-snug">{note.summary}</p>
                </div>
                <p className="col-span-12 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.6875rem] text-[var(--slate)] md:col-span-3 md:justify-end md:text-right">
                  {note.tags?.map((tag) => (
                    <span key={tag}>#{tag.replace(/\s+/g, '')}</span>
                  ))}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </PageShell>
      <Footer />
    </>
  )
}
