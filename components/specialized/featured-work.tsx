'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { CaseStudy } from '@/lib/content'

// Simple Badge component locally or import if I made one. I'll make a simple span.
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="focus:ring-ring bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
      {children}
    </span>
  )
}

export function FeaturedWork({ caseStudies }: { caseStudies: CaseStudy[] }) {
  return (
    <section className="py-12 md:py-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Case Studies</h2>
          <p className="text-muted-foreground mt-2">Selected projects delivering measurable value.</p>
        </div>
        <Link
          href="/work"
          className="text-primary hidden items-center text-sm font-medium hover:underline md:inline-flex"
        >
          View all projects <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {caseStudies.map((study, index) => (
          <motion.div
            key={study.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass-card group relative flex flex-col justify-between rounded-xl p-6"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {study.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <h3 className="group-hover:text-primary text-xl font-bold tracking-tight transition-colors">
                <Link href={`/work/${study.slug}`}>
                  <span className="absolute inset-0" />
                  {study.title}
                </Link>
              </h3>
              <p className="text-muted-foreground line-clamp-3 text-sm">{study.summary}</p>
            </div>

            {study.metrics && study.metrics.length > 0 && (
              <div className="mt-6 border-t pt-6">
                <p className="text-primary/80 mb-2 text-xs font-semibold tracking-wider uppercase">Outcome</p>
                <p className="text-sm font-medium">{study.metrics[0]}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 md:hidden">
        <Link href="/work" className="text-primary inline-flex items-center text-sm font-medium hover:underline">
          View all projects <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
