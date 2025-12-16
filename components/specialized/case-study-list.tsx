'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CaseStudy } from '@/lib/content'
import { cn } from '@/lib/utils'

const filters = ['All', 'Architecture', 'CAP', 'RAP', 'Fiori', 'Integration', 'Tooling']

export function CaseStudyList({ items }: { items: CaseStudy[] }) {
  const [filter, setFilter] = useState('All')

  const filteredItems = items.filter((item) => {
    if (filter === 'All') return true
    return item.tags.includes(filter)
  })

  return (
    <div className="space-y-12">
      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              filter === f
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((study) => (
            <motion.div
              key={study.slug}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="glass-card group relative flex flex-col justify-between rounded-xl p-6"
            >
              <div className="mb-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {study.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="focus:ring-ring bg-secondary text-secondary-foreground inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="group-hover:text-primary text-2xl font-bold tracking-tight transition-colors">
                  <Link href={`/work/${study.slug}`}>
                    <span className="absolute inset-0" />
                    {study.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground line-clamp-3">{study.summary}</p>
              </div>

              <div className="text-muted-foreground mt-auto flex items-center justify-between border-t pt-4 text-sm">
                <span>{study.role}</span>
                <span>{study.period}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
