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

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 px-4 pt-10 pb-24 md:px-10 md:pt-16">
        <article className="mx-auto max-w-3xl">
          <header className="border-hairline mb-12 border-b pb-10">
            <Link
              href="/notes"
              className="label-mono text-muted-foreground hover:text-foreground -ml-1 inline-flex h-11 items-center gap-2 px-1 transition-colors duration-150"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              All Notes
            </Link>

            <p className="label-mono text-muted-foreground mt-8 flex flex-wrap items-center gap-3">
              <time dateTime={note.date} className="text-sodium tabular-nums">
                {format(new Date(note.date), 'MMMM d, yyyy')}
              </time>
              {note.tags && note.tags.length > 0 && (
                <>
                  <span className="bg-hairline h-px w-8" aria-hidden="true" />
                  {note.tags.map((t) => `#${t}`).join('  ')}
                </>
              )}
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[0.98] tracking-[-0.015em] md:text-7xl">{note.title}</h1>
            <p className="text-foreground/70 mt-6 text-lg leading-relaxed">{note.summary}</p>
          </header>

          <div className="prose prose-signal max-w-none">
            <MDXContent source={note.content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
