import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getNotes } from '@/lib/content'
import { Metadata } from 'next'
import { SheetHeader } from '@/components/ui/sheet-header'
import { FieldJournal } from '@/components/specialized/field-journal'

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
  const entries = notes.map((n, i) => ({
    slug: n.slug,
    title: n.title,
    summary: n.summary,
    date: n.date,
    tags: n.tags,
    entry: notes.length - i,
  }))

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SheetHeader
          sheet="Field journal"
          kicker={`${notes.length} entries`}
          title="Writing"
          lede="Pattern libraries, architectural thoughts, and pragmatic guides."
        />
        <div className="mx-auto max-w-[1400px] px-5 pt-4 md:px-8 md:pt-8">
          <FieldJournal entries={entries} headingLevel={2} />
        </div>
      </main>
      <Footer />
    </>
  )
}
