import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getCaseStudyBySlug, getCaseStudies } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Github, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'
import { MDXContent } from '@/components/ui/mdx-content'
import { TrigPoint } from '@/components/ui/trig-point'
import { surveyPoint } from '@/lib/survey'

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

// Metrics come from frontmatter and may contain HTML entities (e.g. "&lt; 200ms").
const decode = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const study = await getCaseStudyBySlug(slug)

  if (!study) {
    notFound()
  }

  const all = await getCaseStudies()
  const index = all.findIndex((s) => s.slug === slug)
  const point = surveyPoint(study.slug, index, all.length)
  const hasMetrics = !!study.metrics && study.metrics.length > 0

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <article>
          <header className="graticule relative border-b border-[var(--foreground)]/80 pt-28 pb-12 md:pt-36 md:pb-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
            <div className="relative mx-auto max-w-[1400px] px-5 md:px-8">
              <Link
                href="/work"
                className="marginalia text-muted-foreground hover:text-foreground -ml-1 inline-flex min-h-10 items-center gap-2 px-1 transition-colors"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Survey register
              </Link>

              <div className="marginalia text-muted-foreground mt-6 flex flex-wrap items-center gap-x-5 gap-y-1">
                <span className="text-foreground inline-flex items-center gap-1.5">
                  <TrigPoint active className="size-3.5" />
                  {point.label}
                </span>
                <span className="tabular-nums">
                  {point.easting} · {point.northing}
                </span>
                <span>{study.tags.join(' / ')}</span>
              </div>
              <h1 className="font-display mt-4 max-w-5xl text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[0.98] font-semibold tracking-[-0.035em]">
                {study.title}
              </h1>
              <p className="text-muted-foreground mt-5 max-w-3xl font-serif text-[1.2rem] leading-snug md:text-[1.4rem]">
                {study.summary}
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[var(--rule)] pt-6 md:grid-cols-12">
                <div className="md:col-span-3">
                  <dt className="marginalia text-muted-foreground">Role</dt>
                  <dd className="mt-1 font-medium">{study.role}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="marginalia text-muted-foreground">Period</dt>
                  <dd className="mt-1 font-medium tabular-nums">{study.period}</dd>
                </div>
                <div className="col-span-2 md:col-span-7">
                  <dt className="marginalia text-muted-foreground">Tech stack</dt>
                  <dd className="mt-1 font-medium">{study.stack.join(' · ')}</dd>
                </div>
              </dl>

              {study.links && (study.links.github || study.links.demo) && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {study.links.github && (
                    <a
                      href={study.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn shadow-border hover:shadow-border-hover pr-4 pl-3.5"
                    >
                      <Github className="size-4" strokeWidth={1.5} aria-hidden="true" /> View Code
                    </a>
                  )}
                  {study.links.demo && (
                    <a
                      href={study.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn shadow-border hover:shadow-border-hover pr-4 pl-3.5"
                    >
                      <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden="true" /> Live Demo
                    </a>
                  )}
                </div>
              )}
            </div>
          </header>

          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-5 pt-12 md:px-8 md:pt-16 lg:grid-cols-12">
            {hasMetrics && (
              <aside className="lg:col-span-3" aria-label="Key outcomes">
                <div className="lg:sticky lg:top-24">
                  <p className="marginalia text-muted-foreground">Readings · key outcomes</p>
                  <ul className="mt-3">
                    {study.metrics!.map((metric, idx) => (
                      <li
                        key={idx}
                        className="font-display flex items-baseline gap-3 border-b border-[var(--rule)] py-3 text-lg font-medium tracking-[-0.01em]"
                      >
                        <span className="marginalia text-ochre-ink tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {decode(metric)}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}
            <div
              className={
                hasMetrics ? 'min-w-0 lg:col-span-8 lg:col-start-5' : 'min-w-0 lg:col-span-8 lg:col-start-3'
              }
            >
              <div className="prose-strata max-w-[46rem]">
                <MDXContent source={study.content} />
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
