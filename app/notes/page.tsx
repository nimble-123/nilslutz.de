import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
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
      <main className="container mx-auto flex-1 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          <div className="space-y-4 border-b pb-8">
            <h1 className="text-4xl font-bold tracking-tight">Writing</h1>
            <p className="text-muted-foreground text-xl">
              Pattern libraries, architectural thoughts, and pragmatic guides.
            </p>
          </div>
          <div className="space-y-10">
            {notes.map((note) => (
              <article key={note.slug} className="group glass-card relative space-y-3 rounded-xl p-8">
                <p className="text-muted-foreground font-mono text-sm">{format(new Date(note.date), 'MMMM d, yyyy')}</p>
                <h2 className="group-hover:text-primary text-2xl font-bold tracking-tight transition-colors">
                  <Link href={`/notes/${note.slug}`}>
                    <span className="absolute inset-0" />
                    {note.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground leading-relaxed">{note.summary}</p>
                <div className="flex gap-2">
                  {note.tags &&
                    note.tags.map((tag) => (
                      <span key={tag} className="text-primary bg-primary/10 rounded px-2 py-0.5 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
