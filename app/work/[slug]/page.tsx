import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getCaseStudyBySlug, getCaseStudies } from '@/lib/content'
import { decodeEntities } from '@/lib/signal-layout'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Github, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'
import { MDXContent } from '@/components/ui/mdx-content'

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

  const all = await getCaseStudies()
  const index = all.findIndex((s) => s.slug === slug) + 1

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 px-4 pt-10 pb-24 md:px-10 md:pt-16">
        <article className="mx-auto max-w-6xl">
          <header className="border-hairline border-b pb-12">
            <Link
              href="/work"
              className="label-mono text-muted-foreground hover:text-foreground -ml-1 inline-flex h-11 items-center gap-2 px-1 transition-colors duration-150"
            >
              <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              Back to Case Studies
            </Link>

            <p className="label-mono text-muted-foreground mt-8 flex items-center gap-3">
              <span className="text-sodium tabular-nums">CS·{String(index).padStart(2, '0')}</span>
              <span className="bg-hairline h-px w-8" aria-hidden="true" />
              {study.tags.join(' · ')}
            </p>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl leading-[0.95] tracking-[-0.02em] md:text-8xl">
              {study.title}
            </h1>
            <p className="text-foreground/75 mt-8 max-w-3xl text-lg leading-relaxed md:text-xl">{study.summary}</p>

            <dl className="border-hairline mt-12 grid grid-cols-2 border-t md:grid-cols-4">
              <div className="border-hairline border-r py-5 pr-4">
                <dt className="label-mono text-muted-foreground/70">Role</dt>
                <dd className="mt-2 text-sm">{study.role}</dd>
              </div>
              <div className="border-hairline py-5 pl-4 md:border-r md:pr-4">
                <dt className="label-mono text-muted-foreground/70">Period</dt>
                <dd className="mt-2 text-sm tabular-nums">{study.period}</dd>
              </div>
              <div className="border-hairline col-span-2 border-t py-5 md:border-t-0 md:pl-4">
                <dt className="label-mono text-muted-foreground/70">Tech Stack</dt>
                <dd className="mt-2 text-sm">{study.stack.join(', ')}</dd>
              </div>
            </dl>

            {study.links && (
              <div className="mt-6 flex gap-6">
                {study.links.github && (
                  <a
                    href={study.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-mono text-sodium inline-flex h-11 items-center gap-2 hover:underline"
                  >
                    <Github className="size-4" strokeWidth={1.5} aria-hidden="true" /> View Code
                  </a>
                )}
                {study.links.demo && (
                  <a
                    href={study.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-mono text-sodium inline-flex h-11 items-center gap-2 hover:underline"
                  >
                    <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden="true" /> Live Demo
                  </a>
                )}
              </div>
            )}
          </header>

          <div className="grid gap-12 pt-12 md:grid-cols-12 md:pt-16">
            {study.metrics && study.metrics.length > 0 && (
              <aside className="md:col-span-3">
                <div className="md:sticky md:top-28">
                  <h2 className="label-mono text-muted-foreground mb-4">Key Outcomes</h2>
                  <ul className="border-hairline border-t">
                    {study.metrics.map((metric) => (
                      <li key={metric} className="border-hairline flex items-baseline gap-3 border-b py-3.5">
                        <span className="bg-sodium inline-block size-1.5 shrink-0 rounded-full" aria-hidden="true" />
                        <span className="text-foreground/90 text-sm tabular-nums">{decodeEntities(metric)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
            <div className="prose prose-signal max-w-none md:col-span-8 md:col-start-5">
              <MDXContent source={study.content} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
