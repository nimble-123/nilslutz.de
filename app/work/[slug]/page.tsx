import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getCaseStudyBySlug, getCaseStudies, withoutDuplicateTitle } from '@/lib/content'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { MDXContent } from '@/components/ui/mdx-content'
import { PageHeader, pageMain } from '@/components/ui/page-header'

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

  const meta = [
    { k: 'Role', v: study.role },
    { k: 'Period', v: <span className="tabular-nums">{study.period}</span> },
    { k: 'Stack', v: study.stack.join(', ') },
    { k: 'Topics', v: study.tags.join(', ') },
  ]

  return (
    <>
      <Navbar />
      <main className={pageMain}>
        <article>
          <Link href="/work" className="label ink-link hover:text-foreground mb-10 inline-block">
            ← Case Studies
          </Link>
          <PageHeader
            label={<span className="tabular-nums">{study.period}</span>}
            title={study.title}
            intro={study.summary}
          >
            {study.links && (study.links.github || study.links.demo) && (
              <p className="mt-6 flex gap-6 text-[0.8125rem]">
                {study.links.github && (
                  <a href={study.links.github} target="_blank" rel="noopener noreferrer" className="ink-link">
                    View code ↗
                  </a>
                )}
                {study.links.demo && (
                  <a href={study.links.demo} target="_blank" rel="noopener noreferrer" className="ink-link">
                    Live demo ↗
                  </a>
                )}
              </p>
            )}
          </PageHeader>

          <dl className="grid-line border-foreground gap-y-5 border-t pt-4 pb-16 md:pb-24">
            {meta.map((m) => (
              <div key={m.k} className="min-w-0">
                <dt className="label">{m.k}</dt>
                <dd className="mt-1 text-[0.8125rem] leading-relaxed">{m.v}</dd>
              </div>
            ))}
          </dl>

          <div className="grid-line">
            <aside className="col-span-2 mb-12 md:col-span-1 md:mb-0">
              {study.metrics && study.metrics.length > 0 && (
                <div className="md:sticky md:top-10">
                  <h2 className="label">Outcomes</h2>
                  <ul className="mt-3">
                    {study.metrics.map((metric) => (
                      <li key={metric} className="border-border border-b py-2 text-[0.8125rem] tabular-nums">
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
            <div className="prose-line col-span-2 md:col-span-3">
              <MDXContent source={withoutDuplicateTitle(study.content, study.title)} />
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
