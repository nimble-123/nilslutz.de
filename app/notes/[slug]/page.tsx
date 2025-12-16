import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getNoteBySlug, getNotes } from '@/lib/content'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export async function generateStaticParams() {
  const posts = await getNotes()
  return posts.map((post) => ({
    slug: post.slug,
  }))
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
          <div className="prose dark:prose-invert prose-a:text-primary max-w-none">
            <MDXRemote source={note.content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
