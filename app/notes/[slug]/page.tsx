import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getNoteBySlug, getNotes } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { Metadata } from 'next'
import { MDXContent } from '@/components/ui/mdx-content'
import { proseClass } from '@/components/ui/page-header'

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
      <main className="flex-1 px-4 pt-32 md:px-8 md:pt-44">
        <article className="mx-auto max-w-[46rem]">
          <Link
            href="/notes"
            className="label-caps text-muted-foreground hover:text-foreground group -ml-1 inline-flex h-11 items-center gap-2 px-1"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
            All Notes
          </Link>

          <header className="mt-10 mb-14 space-y-6">
            <p className="label-caps text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
              <time dateTime={note.date} className="tabular-nums">
                {format(new Date(note.date), 'd MMMM yyyy')}
              </time>
              {note.tags && note.tags.length > 0 && <span aria-hidden="true">·</span>}
              {note.tags && note.tags.length > 0 && <span>{note.tags.join(' · ')}</span>}
            </p>
            <h1 className="font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.02] font-light tracking-[-0.015em]">
              {note.title}
            </h1>
            {note.summary && <p className="text-muted-foreground text-xl leading-relaxed">{note.summary}</p>}
            <div className="hairline" />
          </header>

          <div className={proseClass}>
            <MDXContent source={note.content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
