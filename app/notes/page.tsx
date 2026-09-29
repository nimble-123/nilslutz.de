import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
import { IndexRow } from '@/components/ui/index-row'
import { getNotes } from '@/lib/content'
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
      <main id="main" className="flex-1">
        <PageHeader
          index="03"
          label="Notes"
          title="Writing"
          aside={`${notes.length} notes`}
          lede="Pattern libraries, architectural thoughts, and pragmatic guides."
        />
        <div className="shell">
          <div className="shadow-[0_-2px_0_var(--foreground)]">
            {notes.map((note, i) => (
              <IndexRow
                key={note.slug}
                href={`/notes/${note.slug}`}
                index={String(notes.length - i).padStart(2, '0')}
                meta={<time dateTime={note.date}>{format(new Date(note.date), 'MMMM d, yyyy')}</time>}
                title={note.title}
                summary={note.summary}
                tags={note.tags}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
