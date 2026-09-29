'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
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
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2" role="group" aria-label="Filter case studies">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              'label-caps relative inline-flex h-11 items-center px-3 transition-colors duration-150',
              filter === f ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f}
            {filter === f && (
              <motion.span
                layoutId="filter-underline"
                className="bg-brass absolute inset-x-3 bottom-2.5 h-px"
                transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
              />
            )}
          </button>
        ))}
        <span className="label-caps text-muted-foreground ml-auto tabular-nums" aria-live="polite">
          {String(filteredItems.length).padStart(2, '0')} works
        </span>
      </div>

      <motion.ol layout className="border-border border-t">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredItems.map((study) => (
            <motion.li
              key={study.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeOut' } }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="border-border border-b"
            >
              <Link
                href={`/work/${study.slug}`}
                className="group hover:bg-foreground/[0.025] grid gap-x-8 gap-y-3 py-8 transition-colors duration-150 md:grid-cols-12 md:px-2"
              >
                <span className="md:col-span-7">
                  <span className="label-caps text-muted-foreground block">{study.tags.slice(0, 3).join(' · ')}</span>
                  <span className="font-display mt-3 block text-[2rem] leading-[1.06] md:text-[2.5rem]">
                    <em className="font-light">{study.title}</em>
                  </span>
                  <span className="text-muted-foreground mt-3 line-clamp-3 block max-w-xl">{study.summary}</span>
                </span>
                <span className="text-muted-foreground text-[0.95rem] md:col-span-3 md:pt-8">
                  <span className="text-foreground block">{study.role}</span>
                  <span className="italic">{study.stack.slice(0, 3).join(', ')}</span>
                </span>
                <span className="flex items-center justify-between md:col-span-2 md:flex-col md:items-end md:justify-start md:pt-8">
                  <span className="label-caps text-foreground tabular-nums">{study.period}</span>
                  <ArrowRight
                    className="text-brass-ink size-4 transition-transform duration-200 ease-out group-hover:translate-x-1 md:mt-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ol>
    </div>
  )
}
