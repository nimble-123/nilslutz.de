import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageShell } from '@/components/ui/page-header'
import { getCaseStudyBySlug, getCaseStudies } from '@/lib/content'
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

  const facts = [
    { label: 'Role', value: study.role },
    { label: 'Period', value: study.period },
    { label: 'Stack', value: study.stack.join(', ') },
  ]

  return (
    <>
      <Navbar />
      <PageShell>
        <article className="pb-12">
          <header className="border-border grid grid-cols-12 gap-x-6 border-b pt-8 pb-12 md:pt-14 md:pb-16">
            <div className="col-span-12">
              <Link
                href="/work"
                className="eyebrow text-muted-foreground hover:text-foreground -ml-1 inline-flex h-10 items-center gap-2 px-1 transition-colors duration-150"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Back to Case Studies
              </Link>
            </div>
            <div className="col-span-12 mt-6 lg:col-span-9">
              <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-[var(--slate)]">
                {study.tags.map((tag) => (
                  <span key={tag}>#{tag.replace(/\s+/g, '')}</span>
                ))}
              </p>
              <h1 className="opsz-display mt-4 text-[2.6rem] leading-[0.95] font-light tracking-[-0.035em] md:text-[5rem]">
                {study.title}
              </h1>
              <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-snug md:text-[1.35rem]">
                {study.summary}
              </p>
            </div>

            <dl className="col-span-12 mt-10 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className={f.label === 'Stack' ? 'col-span-2' : undefined}>
                  <dt className="eyebrow text-muted-foreground">{f.label}</dt>
                  <dd className="mt-1.5 text-[1.05rem] leading-snug">{f.value}</dd>
                </div>
              ))}
            </dl>

            {study.links && (study.links.github || study.links.demo) && (
              <div className="col-span-12 mt-8 flex flex-wrap gap-3">
                {study.links.github && (
                  <a
                    href={study.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shadow-border hover:shadow-border-hover inline-flex h-10 items-center gap-2 rounded-full pr-4 pl-3.5 font-mono text-xs transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
                  >
                    <Github className="size-4" strokeWidth={1.5} aria-hidden="true" /> View Code
                  </a>
                )}
                {study.links.demo && (
                  <a
                    href={study.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shadow-border hover:shadow-border-hover inline-flex h-10 items-center gap-2 rounded-full pr-4 pl-3.5 font-mono text-xs transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
                  >
                    <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden="true" /> Live Demo
                  </a>
                )}
              </div>
            )}
          </header>

          <div className="grid grid-cols-12 gap-x-6 pt-12 md:pt-16">
            {study.metrics && study.metrics.length > 0 && (
              <aside className="col-span-12 mb-12 lg:sticky lg:top-24 lg:col-span-3 lg:mb-0 lg:self-start">
                <h2 className="eyebrow text-muted-foreground">Key Outcomes</h2>
                <ul className="mt-4 space-y-3">
                  {study.metrics.map((metric, idx) => (
                    <li key={idx} className="border-border flex items-baseline gap-3 border-t pt-3">
                      <span className="text-oxide font-mono text-xs tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="opsz-headline text-lg leading-tight">{metric.replace(/&lt;/g, '<')}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
            <div className="prose prose-lg prose-tide col-span-12 max-w-none lg:col-span-8 lg:col-start-5">
              <MDXContent source={study.content} />
            </div>
          </div>
        </article>
      </PageShell>
      <Footer />
    </>
  )
}
