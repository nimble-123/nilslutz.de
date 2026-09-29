'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { IndexRow } from '@/components/ui/index-row'
import { cn } from '@/lib/utils'

export type CaseStudyListItem = {
  slug: string
  title: string
  summary: string
  tags: string[]
  period: string
  role: string
}

const filters = ['All', 'Architecture', 'CAP', 'RAP', 'Fiori', 'Integration', 'Tooling']

export function CaseStudyList({ items }: { items: CaseStudyListItem[] }) {
  const [filter, setFilter] = useState('All')

  const filteredItems = items.filter((item) => {
    if (filter === 'All') return true
    return item.tags.includes(filter)
  })

  return (
    <div>
      {/* Filter: a row of mono tabs; the active one is inked in */}
      <div
        role="group"
        aria-label="Filter case studies by topic"
        className="flex flex-wrap items-center gap-1 pb-4 shadow-[0_2px_0_var(--foreground)]"
      >
        {filters.map((f) => {
          const count = f === 'All' ? items.length : items.filter((i) => i.tags.includes(f)).length
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className={cn(
                'press label inline-flex h-10 items-center gap-1.5 px-3',
                active
                  ? 'bg-foreground text-background'
                  : 'text-foreground hover:bg-card shadow-[inset_0_0_0_1px_var(--rule)]'
              )}
            >
              {f}
              <span className={cn('tabular-nums', active ? 'text-signal' : 'text-muted-foreground')}>{count}</span>
            </button>
          )
        })}
      </div>

      <motion.div layout="position" className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredItems.map((study, i) => (
            <motion.div
              key={study.slug}
              layout="position"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.15, ease: 'easeOut' } }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
            >
              <IndexRow
                href={`/work/${study.slug}`}
                index={String(i + 1).padStart(2, '0')}
                meta={
                  <>
                    <span className="block">{study.period}</span>
                    <span className="block">{study.role}</span>
                  </>
                }
                title={study.title}
                summary={study.summary}
                tags={study.tags}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredItems.length === 0 && (
          <p className="text-muted-foreground py-12 text-lg">No case studies tagged “{filter}” yet.</p>
        )}
      </motion.div>
    </div>
  )
}
