import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getNoteBySlug, getNotes, withoutDuplicateTitle } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Metadata } from 'next'
import { MDXContent } from '@/components/ui/mdx-content'
import { PageHeader, pageMain } from '@/components/ui/page-header'

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
      <main className={pageMain}>
        <article>
          <Link href="/notes" className="label ink-link hover:text-foreground mb-10 inline-block">
            ← Writing
          </Link>
          <PageHeader
            label={
              <time dateTime={note.date} className="tabular-nums">
                {format(new Date(note.date), 'd MMMM yyyy')}
              </time>
            }
            title={note.title}
            intro={note.summary}
          >
            {note.tags && note.tags.length > 0 && <p className="label mt-6">{note.tags.join(' · ')}</p>}
          </PageHeader>
          <div className="grid-line border-foreground border-t pt-2">
            <div className="prose-line col-span-2 md:col-span-3 md:col-start-2">
              <MDXContent source={withoutDuplicateTitle(note.content, note.title)} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
