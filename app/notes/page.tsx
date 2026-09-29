import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getNotes } from '@/lib/content'
import Link from 'next/link'
import { format } from 'date-fns'
import { Metadata } from 'next'
import { PageHeader } from '@/components/ui/page-header'

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
      <main className="flex-1 px-4 pt-32 md:px-8 md:pt-44">
        <div className="mx-auto max-w-[88rem] space-y-20">
          <PageHeader
            room="Room 03 — Reading Room"
            title="Writing"
            lead="Pattern libraries, architectural thoughts, and pragmatic guides."
          />
          <ol className="border-border border-t">
            {notes.map((note) => (
              <li key={note.slug} className="border-border border-b">
                <article className="group relative grid gap-x-8 gap-y-3 py-8 md:grid-cols-12 md:px-2">
                  <time
                    dateTime={note.date}
                    className="label-caps text-muted-foreground pt-2 tabular-nums md:col-span-2"
                  >
                    {format(new Date(note.date), 'd MMM yyyy')}
                  </time>
                  <div className="md:col-span-7">
                    <h2 className="font-display group-hover:text-brass-ink text-[1.9rem] leading-[1.1] transition-colors duration-150 md:text-[2.3rem]">
                      <Link href={`/notes/${note.slug}`}>
                        <span className="absolute inset-0" aria-hidden="true" />
                        {note.title}
                      </Link>
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-2xl">{note.summary}</p>
                  </div>
                  <p className="text-muted-foreground text-[0.95rem] italic md:col-span-3 md:pt-3 md:text-right">
                    {note.tags?.join(', ')}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </main>
      <Footer />
    </>
  )
}
