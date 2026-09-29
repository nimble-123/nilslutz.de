import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getCaseStudyBySlug, getCaseStudies } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Github, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'
import { MDXContent } from '@/components/ui/mdx-content'
import { proseClass } from '@/components/ui/page-header'
import { cn } from '@/lib/utils'

/** Frontmatter metrics are authored with HTML entities (e.g. `&lt; 200ms`) */
const decodeEntities = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

export async function generateStaticParams() {
  const posts = await getCaseStudies()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const study = await getCaseStudyBySlug(slug)

  if (!study) {
    return {
      title: 'Case Study Not Found',
    }
  }

  return {
    title: study.title,
    description: study.summary,
    keywords: study.tags,
    openGraph: {
      title: `${study.title} - Nils Lutz`,
      description: study.summary,
      url: `https://nilslutz.de/work/${slug}`,
      type: 'article',
      publishedTime: study.period,
      tags: study.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: study.title,
      description: study.summary,
    },
  }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const study = await getCaseStudyBySlug(slug)

  if (!study) {
    notFound()
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 pt-32 md:px-8 md:pt-44">
        <article className="mx-auto max-w-[88rem]">
          <Link
            href="/work"
            className="label-caps text-muted-foreground hover:text-foreground group -ml-1 inline-flex h-11 items-center gap-2 px-1"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
            Back to Case Studies
          </Link>

          <header className="mt-10 max-w-5xl space-y-6">
            <p className="label-caps text-muted-foreground flex items-center gap-3">
              <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
              {study.tags.join(' · ')}
            </p>
            <h1 className="font-display text-[clamp(2.6rem,6.5vw,5.6rem)] leading-[0.98] font-light tracking-[-0.015em]">
              <em>{study.title}</em>
            </h1>
            <p className="text-muted-foreground max-w-3xl text-xl leading-relaxed md:text-2xl">{study.summary}</p>
          </header>

          <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-12">
            {/* Wall label */}
            <aside className="lg:col-span-4">
              <div className="bg-card/70 shadow-plinth space-y-6 rounded-lg p-6 lg:sticky lg:top-28">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-[0.95rem]">
                  <div>
                    <dt className="label-caps text-muted-foreground">Period</dt>
                    <dd className="mt-1 tabular-nums">{study.period}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">Role</dt>
                    <dd className="mt-1">{study.role}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="label-caps text-muted-foreground">Medium</dt>
                    <dd className="mt-1 italic">{study.stack.join(', ')}</dd>
                  </div>
                </dl>

                {study.metrics && study.metrics.length > 0 && (
                  <div className="border-border border-t pt-5">
                    <h2 className="label-caps text-muted-foreground">Key Outcomes</h2>
                    <ul className="mt-3 space-y-2">
                      {study.metrics.map((metric, idx) => (
                        <li key={idx} className="flex items-baseline gap-3 text-[0.95rem]">
                          <span className="bg-brass mt-2 size-1 shrink-0 rounded-full" aria-hidden="true" />
                          <span>{decodeEntities(metric)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {study.links && (study.links.github || study.links.demo) && (
                  <div className="border-border flex flex-wrap gap-2 border-t pt-5">
                    {study.links.github && (
                      <a
                        href={study.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shadow-border hover:shadow-border-hover inline-flex h-10 items-center gap-2 rounded-full pr-4 pl-3.5 text-sm font-medium transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
                      >
                        <Github className="size-4" strokeWidth={1.5} aria-hidden="true" /> View Code
                      </a>
                    )}
                    {study.links.demo && (
                      <a
                        href={study.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shadow-border hover:shadow-border-hover inline-flex h-10 items-center gap-2 rounded-full pr-4 pl-3.5 text-sm font-medium transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
                      >
                        <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden="true" /> Live Demo
                      </a>
                    )}
                  </div>
                )}
              </div>
            </aside>

            <div className={cn(proseClass, 'lg:col-span-8 lg:max-w-[46rem]')}>
              <MDXContent source={study.content} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
