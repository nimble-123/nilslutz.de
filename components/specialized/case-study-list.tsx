'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TrigPoint } from '@/components/ui/trig-point'
import type { RegisterItem } from '@/components/specialized/survey-register'

const filters = ['All', 'Architecture', 'CAP', 'RAP', 'Fiori', 'Integration', 'Tooling']

export type ListItem = RegisterItem & { featured?: boolean; metrics?: string[] }

export function CaseStudyList({ items }: { items: ListItem[] }) {
  const [filter, setFilter] = useState('All')

  const filteredItems = items.filter((item) => {
    if (filter === 'All') return true
    return item.tags.includes(filter)
  })

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-[var(--rule)] pb-4">
        <span className="marginalia text-muted-foreground mr-3">Filter layer</span>
        {filters.map((f) => {
          const on = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={on}
              className={cn(
                'marginalia inline-flex min-h-10 items-center gap-2 rounded-[3px] px-3 transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96]',
                on ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span
                aria-hidden="true"
                className={cn('size-2 rounded-full', on ? 'bg-ochre' : 'shadow-[0_0_0_1px_currentColor]')}
              />
              {f}
            </button>
          )
        })}
        <span className="marginalia text-muted-foreground ml-auto tabular-nums">
          {String(filteredItems.length).padStart(2, '0')} / {String(items.length).padStart(2, '0')} points
        </span>
      </div>

      <motion.ol layout className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredItems.map((study) => (
            <motion.li
              key={study.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeOut' } }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
              className="group border-b border-[var(--rule)]"
            >
              <Link
                href={`/work/${study.slug}`}
                className="grid grid-cols-1 gap-x-10 gap-y-3 py-8 md:grid-cols-12 md:py-10"
              >
                <div className="marginalia text-muted-foreground flex items-start gap-3 md:col-span-3 md:flex-col md:gap-1.5">
                  <span className="text-foreground inline-flex items-center gap-1.5">
                    <TrigPoint active={study.featured} className="size-3.5" />
                    {study.point.label}
                  </span>
                  <span className="tabular-nums">{study.point.easting}</span>
                  <span className="tabular-nums">{study.point.northing}</span>
                </div>
                <div className="md:col-span-9">
                  <div className="marginalia text-muted-foreground flex flex-wrap gap-x-3">
                    <span className="tabular-nums">{study.period}</span>
                    <span>{study.role}</span>
                  </div>
                  <h2 className="font-display mt-2 flex items-start gap-2 text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.06] font-semibold tracking-[-0.03em]">
                    <span className="decoration-ochre underline-offset-[6px] group-hover:underline">{study.title}</span>
                    <ArrowUpRight
                      className="text-muted-foreground group-hover:text-foreground mt-1 size-5 shrink-0 transition-[color,translate] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </h2>
                  <p className="text-muted-foreground mt-3 max-w-3xl font-serif text-[1.1rem] leading-snug">
                    {study.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {study.tags.map((tag) => (
                      <span
                        key={tag}
                        className="marginalia text-muted-foreground rounded-[2px] px-1.5 py-0.5 shadow-[0_0_0_1px_var(--rule)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ol>
    </div>
  )
}
