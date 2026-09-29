import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getCaseStudyBySlug, getCaseStudies } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Github, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'
import { MDXContent } from '@/components/ui/mdx-content'
import { parseMetric } from '@/lib/metrics'

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

  const metrics = (study.metrics ?? []).map(parseMetric)

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <article>
          <header className="shell grid-poster gap-y-8 pt-10 pb-12 md:pt-16 md:pb-16">
            <Link
              href="/work"
              className="label hover:text-signal col-span-4 -ml-1 inline-flex h-11 items-center gap-2 justify-self-start px-1 transition-colors duration-150 md:col-span-3"
            >
              <ArrowLeft className="size-4" strokeWidth={2} aria-hidden="true" />
              Back to Case Studies
            </Link>
            <p className="label text-muted-foreground col-span-4 md:col-span-4 md:col-start-9 md:text-right">
              <span className="text-signal">(Case Study)</span> {study.period}
            </p>
            <h1 className="col-span-4 text-[clamp(2.4rem,6.8vw,7.2rem)] leading-[0.9] font-black tracking-[-0.02em] uppercase [font-stretch:112.5%] md:col-span-12">
              {study.title}
            </h1>
            <p className="col-span-4 max-w-[52ch] text-lg leading-snug font-medium md:col-span-7 md:text-2xl">
              {study.summary}
            </p>

            <dl className="col-span-4 grid grid-cols-2 gap-x-6 gap-y-5 md:col-span-4 md:col-start-9 md:self-end">
              <div className="pt-3 shadow-[0_-1px_0_var(--rule)]">
                <dt className="label text-muted-foreground">Role</dt>
                <dd className="mt-1 text-sm font-semibold">{study.role}</dd>
              </div>
              <div className="pt-3 shadow-[0_-1px_0_var(--rule)]">
                <dt className="label text-muted-foreground">Period</dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums">{study.period}</dd>
              </div>
              <div className="col-span-2 pt-3 shadow-[0_-1px_0_var(--rule)]">
                <dt className="label text-muted-foreground">Tech Stack</dt>
                <dd className="mt-1 text-sm font-semibold">{study.stack.join(', ')}</dd>
              </div>
              <div className="col-span-2 flex flex-wrap gap-1.5">
                {study.tags.map((tag) => (
                  <span key={tag} className="label px-1.5 py-0.5 shadow-[inset_0_0_0_1px_var(--rule)]">
                    {tag}
                  </span>
                ))}
              </div>
              {study.links && (study.links.github || study.links.demo) && (
                <div className="col-span-2 flex flex-wrap gap-2">
                  {study.links.github && (
                    <a
                      href={study.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press bg-foreground text-background hover:bg-signal hover:text-ink inline-flex h-11 items-center gap-2 pr-4 pl-3.5 text-xs font-bold tracking-wide uppercase"
                    >
                      <Github className="size-4" strokeWidth={2} aria-hidden="true" /> View Code
                    </a>
                  )}
                  {study.links.demo && (
                    <a
                      href={study.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press hover:bg-foreground hover:text-background inline-flex h-11 items-center gap-2 pr-4 pl-3.5 text-xs font-bold tracking-wide uppercase shadow-[inset_0_0_0_2px_currentColor]"
                    >
                      <ExternalLink className="size-4" strokeWidth={2} aria-hidden="true" /> Live Demo
                    </a>
                  )}
                </div>
              )}
            </dl>
          </header>

          {/* Key outcomes: set as a poster strip */}
          {metrics.length > 0 && (
            <section aria-labelledby="outcomes" className="bg-foreground text-background">
              <div className="shell grid-poster gap-y-8 py-10 md:py-14">
                <h2 id="outcomes" className="label text-signal col-span-4 md:col-span-2">
                  Key Outcomes
                </h2>
                <ul className="col-span-4 grid grid-cols-2 gap-6 md:col-span-10 md:grid-cols-4">
                  {metrics.map((m) => (
                    <li key={m.label} className="flex flex-col gap-2 pt-3 shadow-[0_-2px_0_currentColor]">
                      {m.value && (
                        <span className="text-[clamp(2rem,4.2vw,4rem)] leading-none font-black tracking-[-0.02em] [font-stretch:87.5%] tabular-nums">
                          {m.value}
                        </span>
                      )}
                      <span className={m.value ? 'label opacity-75' : 'text-lg leading-tight font-bold'}>
                        {m.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <div className="shell grid-poster pt-12 md:pt-20">
            <div className="prose prose-poster col-span-4 md:col-span-8 md:col-start-4">
              <MDXContent source={study.content} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
