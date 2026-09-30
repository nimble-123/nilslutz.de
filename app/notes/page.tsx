import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getNotes } from '@/lib/content'
import Link from 'next/link'
import { Metadata } from 'next'
import { PageHeader, pageMain } from '@/components/ui/page-header'

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
      <main className={pageMain}>
        <PageHeader
          label="Notes"
          title="Writing"
          intro="Pattern libraries, architectural thoughts, and pragmatic guides."
        />
        <ul className="border-foreground border-t">
          {notes.map((note) => (
            <li key={note.slug} className="border-border border-b">
              <Link href={`/notes/${note.slug}`} className="grid-line group gap-y-2 py-5 md:py-6">
                <time dateTime={note.date} className="label col-span-2 pt-0.5 tabular-nums md:col-span-1">
                  {note.date}
                </time>
                <span className="col-span-2">
                  <span className="block text-[0.9375rem] leading-snug tracking-[-0.005em]">
                    <span className="ink-link">{note.title}</span>
                  </span>
                  <span className="text-muted-foreground mt-1.5 line-clamp-2 block max-w-[36rem]">{note.summary}</span>
                </span>
                <span className="label hidden pt-0.5 text-right md:block">{note.tags?.slice(0, 3).join(' · ')}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}
