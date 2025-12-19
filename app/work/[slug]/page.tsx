import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
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

  return (
    <>
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-12 md:py-20">
        <article className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-12 space-y-8 border-b pb-12">
            <Link
              href="/work"
              className="text-muted-foreground hover:text-primary inline-flex items-center text-sm font-medium transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Case Studies
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {study.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">{study.title}</h1>
              <p className="text-muted-foreground text-xl leading-relaxed">{study.summary}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
              <div>
                <p className="text-foreground mb-1 font-semibold">Role</p>
                <p className="text-muted-foreground">{study.role}</p>
              </div>
              <div>
                <p className="text-foreground mb-1 font-semibold">Period</p>
                <p className="text-muted-foreground">{study.period}</p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground mb-1 font-semibold">Tech Stack</p>
                <p className="text-muted-foreground">{study.stack.join(', ')}</p>
              </div>
            </div>

            {/* Links */}
            {study.links && (
              <div className="flex gap-4">
                {study.links.github && (
                  <a
                    href={study.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center text-sm font-medium hover:underline"
                  >
                    <Github className="mr-2 h-4 w-4" /> View Code
                  </a>
                )}
                {study.links.demo && (
                  <a
                    href={study.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center text-sm font-medium hover:underline"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Metrics */}
          {study.metrics && study.metrics.length > 0 && (
            <div className="bg-secondary/30 border-border/50 mb-12 rounded-lg border p-6">
              <h3 className="text-foreground mb-4 font-semibold">Key Outcomes</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {study.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-start">
                    <span className="bg-primary mt-2 mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                    <span className="text-sm font-medium">{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-foreground prose-pre:bg-secondary/50 prose-img:rounded-lg prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:text-foreground prose-td:border prose-td:border-border prose-td:p-2 prose-td:text-foreground max-w-none">
            <MDXContent source={study.content} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
