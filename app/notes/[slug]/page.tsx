import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getNoteBySlug, getNotes } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
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
      <main className="container mx-auto flex-1 px-4 py-12 md:py-20">
        <article className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-12 space-y-6">
            <Link
              href="/notes"
              className="text-muted-foreground hover:text-primary mb-4 inline-flex items-center text-sm font-medium transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Notes
            </Link>

            <div className="space-y-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <time dateTime={note.date}>{format(new Date(note.date), 'MMMM d, yyyy')}</time>
              </div>
              <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">{note.title}</h1>

              <div className="flex flex-wrap gap-2 pt-2">
                {note.tags &&
                  note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-foreground prose-pre:bg-secondary/50 prose-img:rounded-lg prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:text-foreground prose-td:border prose-td:border-border prose-td:p-2 prose-td:text-foreground max-w-none">
            <MDXContent source={note.content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
