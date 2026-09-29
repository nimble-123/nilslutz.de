import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageShell } from '@/components/ui/page-header'
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
      <PageShell>
        <article className="mx-auto max-w-[46rem] pb-12">
          <header className="pt-8 pb-10 md:pt-14 md:pb-14">
            <Link
              href="/notes"
              className="eyebrow text-muted-foreground hover:text-foreground -ml-1 inline-flex h-10 items-center gap-2 px-1 transition-colors duration-150"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              All Notes
            </Link>
            <p className="text-muted-foreground mt-8 font-mono text-xs tabular-nums">
              <time dateTime={note.date}>{format(new Date(note.date), 'MMMM d, yyyy')}</time>
              {note.tags && note.tags.length > 0 && (
                <>
                  <span className="text-clay mx-2">/</span>
                  {note.tags.map((t) => `#${t.replace(/\s+/g, '')}`).join('  ')}
                </>
              )}
            </p>
            <h1 className="opsz-display mt-4 text-[2.4rem] leading-[0.98] font-light tracking-[-0.03em] md:text-[3.75rem]">
              {note.title}
            </h1>
            <p className="text-muted-foreground mt-5 text-lg leading-snug md:text-xl">{note.summary}</p>
            <svg aria-hidden="true" viewBox="0 0 1000 24" preserveAspectRatio="none" className="mt-10 h-5 w-full">
              <path
                d="M0 12 C 120 4, 220 20, 340 12 S 560 4, 680 13 S 880 20, 1000 10"
                fill="none"
                className="stroke-oxide"
                strokeWidth={1.25}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </header>

          <div className="prose prose-lg prose-tide max-w-none">
            <MDXContent source={note.content} />
          </div>
        </article>
      </PageShell>
      <Footer />
    </>
  )
}
