import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getNoteBySlug, getNotes } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { Metadata } from 'next'
import { MDXContent } from '@/components/ui/mdx-content'

export async function generateStaticParams() {
  const posts = await getNotes()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const note = await getNoteBySlug(slug)

  if (!note) {
    return {
      title: 'Note Not Found',
    }
  }

  return {
    title: note.title,
    description: note.summary,
    keywords: note.tags,
    openGraph: {
      title: `${note.title} - Nils Lutz`,
      description: note.summary,
      url: `https://nilslutz.de/notes/${slug}`,
      type: 'article',
      publishedTime: note.date,
      tags: note.tags,
    },
    twitter: {
      card: 'summary',
      title: note.title,
      description: note.summary,
    },
  }
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const note = await getNoteBySlug(slug)

  if (!note) {
    notFound()
  }

  const all = await getNotes()
  const entry = all.length - all.findIndex((n) => n.slug === slug)

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <article className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8 md:pt-36">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-24">
                <Link
                  href="/notes"
                  className="marginalia text-muted-foreground hover:text-foreground -ml-1 inline-flex min-h-10 items-center gap-2 px-1 transition-colors"
                >
                  <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                  Field journal
                </Link>
                <dl className="marginalia mt-6 hidden space-y-3 lg:block">
                  <div>
                    <dt className="text-muted-foreground">Entry</dt>
                    <dd className="text-ochre-ink tabular-nums">No. {String(entry).padStart(2, '0')}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Recorded</dt>
                    <dd className="tabular-nums">{format(new Date(note.date), 'dd.MM.yyyy')}</dd>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div>
                      <dt className="text-muted-foreground">Specimens</dt>
                      <dd>{note.tags.join(' / ')}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </aside>

            <div className="min-w-0 lg:col-span-8">
              <header className="border-b border-[var(--foreground)]/80 pb-10">
                <p className="marginalia text-muted-foreground lg:hidden">
                  <span className="text-ochre-ink">No. {String(entry).padStart(2, '0')}</span> ·{' '}
                  <time dateTime={note.date}>{format(new Date(note.date), 'MMMM d, yyyy')}</time>
                </p>
                <p className="marginalia text-muted-foreground hidden lg:block">
                  <time dateTime={note.date}>{format(new Date(note.date), 'MMMM d, yyyy')}</time>
                </p>
                <h1 className="font-display mt-4 text-[clamp(2.1rem,4.6vw,3.75rem)] leading-[1.0] font-semibold tracking-[-0.035em]">
                  {note.title}
                </h1>
                <p className="text-muted-foreground mt-5 max-w-2xl font-serif text-[1.2rem] leading-snug italic md:text-[1.35rem]">
                  {note.summary}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2 lg:hidden">
                    {note.tags.map((tag) => (
                      <li
                        key={tag}
                        className="marginalia text-muted-foreground rounded-[2px] px-1.5 py-0.5 shadow-[0_0_0_1px_var(--rule)]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </header>

              <div className="prose-strata mt-10 max-w-[44rem]">
                <MDXContent source={note.content} />
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
