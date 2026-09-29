'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { CaseStudy } from '@/lib/content'
import { cn } from '@/lib/utils'

const filters = ['All', 'Architecture', 'CAP', 'RAP', 'Fiori', 'Integration', 'Tooling']

type Item = Pick<CaseStudy, 'slug' | 'title' | 'summary' | 'tags' | 'period' | 'role' | 'metrics'>

export function CaseStudyList({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState('All')

  const filteredItems = items.filter((item) => {
    if (filter === 'All') return true
    return item.tags.includes(filter)
  })

  return (
    <div>
      <div role="group" aria-label="Filter case studies" className="flex flex-wrap gap-1.5 py-6">
        {filters.map((f) => {
          const active = filter === f
          const count = f === 'All' ? items.length : items.filter((i) => i.tags.includes(f)).length
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full px-4 font-mono text-xs transition-[background-color,color,box-shadow,scale] duration-150 ease-out active:scale-[0.96]',
                active
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground shadow-border hover:shadow-border-hover hover:text-foreground'
              )}
            >
              {f}
              <span className={cn('tabular-nums', active ? 'text-background/60' : 'text-muted-foreground/70')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <motion.ol layout className="border-border border-t">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredItems.map((study, i) => (
            <motion.li
              key={study.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeOut' } }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
              className="border-border border-b"
            >
              <Link
                href={`/work/${study.slug}`}
                className="group hover:bg-foreground/[0.025] -mx-3 grid grid-cols-12 gap-x-6 gap-y-3 rounded-xl px-3 py-7 transition-colors duration-150 md:py-9"
              >
                <div className="col-span-12 flex items-baseline gap-4 md:col-span-2 md:flex-col md:gap-1">
                  <span className="text-oxide font-mono text-xs tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-muted-foreground font-mono text-xs tabular-nums">{study.period}</span>
                </div>
                <div className="col-span-12 md:col-span-7">
                  <h2 className="opsz-headline group-hover:text-oxide text-[1.6rem] leading-[1.08] tracking-[-0.02em] transition-colors duration-150 md:text-[2.1rem]">
                    {study.title}
                    <ArrowUpRight
                      className="ml-1 inline size-5 -translate-y-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </h2>
                  <p className="text-muted-foreground mt-3 max-w-2xl text-[1.05rem] leading-snug">{study.summary}</p>
                </div>
                <div className="col-span-12 flex flex-col gap-3 md:col-span-3 md:items-end md:text-right">
                  <span className="eyebrow text-foreground/80">{study.role}</span>
                  <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.6875rem] text-[var(--slate)] md:justify-end">
                    {study.tags.slice(0, 4).map((tag) => (
                      <span key={tag}>#{tag.replace(/\s+/g, '')}</span>
                    ))}
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ol>
      {filteredItems.length === 0 && (
        <p className="text-muted-foreground py-16 text-center font-mono text-sm">Nothing washed up here yet.</p>
      )}
    </div>
  )
}
