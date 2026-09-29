import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
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
      <main id="main" className="flex-1 px-4 pt-12 pb-24 md:px-10 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            code="03"
            channel="Notes"
            title="Writing"
            lede="Pattern libraries, architectural thoughts, and pragmatic guides."
          />
          <ol>
            {notes.map((note) => (
              <li key={note.slug} className="border-hairline border-b">
                <Link
                  href={`/notes/${note.slug}`}
                  className="group grid gap-x-8 gap-y-2 py-8 md:grid-cols-[9rem_1fr_14rem] md:py-10"
                >
                  <time dateTime={note.date} className="label-mono text-muted-foreground pt-2 tabular-nums">
                    {format(new Date(note.date), 'yyyy.MM.dd')}
                  </time>
                  <div>
                    <h2 className="group-hover:text-sodium font-serif text-3xl leading-tight transition-colors duration-150 md:text-4xl">
                      {note.title}
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">{note.summary}</p>
                  </div>
                  <ul className="flex flex-wrap content-start gap-x-3 gap-y-1 md:justify-end md:pt-2">
                    {note.tags?.map((tag) => (
                      <li key={tag} className="label-mono text-muted-foreground/80">
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </main>
      <Footer />
    </>
  )
}
