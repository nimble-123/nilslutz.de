'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { CaseStudy } from '@/lib/content'
import { decodeEntities } from '@/lib/signal-layout'
import { cn } from '@/lib/utils'

const filters = ['All', 'Architecture', 'CAP', 'RAP', 'Fiori', 'Integration', 'Tooling']

export function CaseStudyList({ items }: { items: CaseStudy[] }) {
  const [filter, setFilter] = useState('All')

  const filteredItems = items.filter((item) => {
    if (filter === 'All') return true
    return item.tags.includes(filter)
  })

  return (
    <div>
      {/* Topic filter */}
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 py-6" role="group" aria-label="Filter by topic">
        <span className="label-mono text-muted-foreground/60 mr-3">Topic</span>
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              'label-mono relative h-10 rounded-full px-4 transition-[color,box-shadow,scale] duration-150 ease-out active:scale-[0.96]',
              filter === f
                ? 'text-sodium shadow-[var(--shadow-sodium)]'
                : 'text-muted-foreground hover:text-foreground hover:shadow-[var(--shadow-border)]'
            )}
          >
            {f}
          </button>
        ))}
        <span className="label-mono text-muted-foreground ml-auto tabular-nums" aria-live="polite">
          {String(filteredItems.length).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </span>
      </div>

      <motion.ol layout className="border-hairline border-t">
        <AnimatePresence initial={false} mode="popLayout">
          {filteredItems.map((study) => {
            const index = items.indexOf(study) + 1
            return (
              <motion.li
                key={study.slug}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeOut' } }}
                className="border-hairline border-b"
              >
                <Link
                  href={`/work/${study.slug}`}
                  className="group grid grid-cols-[2.5rem_1fr_auto] gap-x-4 gap-y-3 py-8 transition-colors duration-150 hover:bg-white/[0.015] md:grid-cols-[4rem_1fr_16rem_1.5rem] md:py-10"
                >
                  <span className="label-mono text-sodium pt-2 tabular-nums">{String(index).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <h2 className="group-hover:text-sodium font-serif text-3xl leading-tight transition-colors duration-150 md:text-4xl">
                      {study.title}
                    </h2>
                    <p className="text-muted-foreground mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed">
                      {study.summary}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                      {study.tags.slice(0, 4).map((tag) => (
                        <li key={tag} className="label-mono text-muted-foreground/80">
                          #{tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ArrowUpRight
                    className="text-muted-foreground group-hover:text-sodium size-5 transition-colors duration-150 md:order-last"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <dl className="label-mono text-muted-foreground col-start-2 grid grid-cols-[5rem_1fr] gap-y-1 md:col-start-auto md:pt-2">
                    <dt className="text-muted-foreground/60">Role</dt>
                    <dd className="text-foreground/80 normal-case">{study.role}</dd>
                    <dt className="text-muted-foreground/60">Period</dt>
                    <dd className="text-foreground/80 tabular-nums">{study.period}</dd>
                    {study.metrics?.[0] && (
                      <>
                        <dt className="text-muted-foreground/60">Signal</dt>
                        <dd className="text-sodium normal-case">{decodeEntities(study.metrics[0])}</dd>
                      </>
                    )}
                  </dl>
                </Link>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </motion.ol>
    </div>
  )
}
