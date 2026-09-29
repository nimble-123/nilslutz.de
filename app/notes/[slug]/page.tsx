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
      <main id="main" className="flex-1">
        <article className="shell grid-poster gap-y-10 pt-10 md:pt-16">
          {/* Meta rail */}
          <aside className="col-span-4 md:col-span-3">
            <div className="space-y-6 md:sticky md:top-24">
              <Link
                href="/notes"
                className="label hover:text-signal -ml-1 inline-flex h-11 items-center gap-2 px-1 transition-colors duration-150"
              >
                <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
                All Notes
              </Link>
              <dl className="space-y-4">
                <div className="pt-3 shadow-[0_-1px_0_var(--rule)]">
                  <dt className="label text-muted-foreground">Published</dt>
                  <dd className="mt-1 text-sm font-semibold tabular-nums">
                    <time dateTime={note.date}>{format(new Date(note.date), 'MMMM d, yyyy')}</time>
                  </dd>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="pt-3 shadow-[0_-1px_0_var(--rule)]">
                    <dt className="label text-muted-foreground">Tags</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {note.tags.map((tag) => (
                        <span key={tag} className="label px-1.5 py-0.5 shadow-[inset_0_0_0_1px_var(--rule)]">
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>

          <div className="col-span-4 md:col-span-9">
            <header className="mb-10 pb-8 shadow-[0_2px_0_var(--foreground)] md:mb-14">
              <p className="label text-signal mb-4">(Note)</p>
              <h1 className="text-[clamp(2.2rem,5.4vw,5.2rem)] leading-[0.95] font-black tracking-[-0.02em] [font-stretch:112.5%]">
                {note.title}
              </h1>
              {note.summary && (
                <p className="text-muted-foreground mt-6 max-w-[56ch] text-lg leading-snug md:text-xl">
                  {note.summary}
                </p>
              )}
            </header>
            <div className="prose prose-poster">
              <MDXContent source={note.content} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
