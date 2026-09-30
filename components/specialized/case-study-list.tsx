'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { CaseStudy } from '@/lib/content'
import { cn } from '@/lib/utils'

const filters = ['All', 'Architecture', 'CAP', 'RAP', 'Fiori', 'Integration', 'Tooling']

type Item = Pick<CaseStudy, 'slug' | 'title' | 'summary' | 'tags' | 'period' | 'role'>

export function CaseStudyList({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState('All')
  const count = (f: string) => (f === 'All' ? items.length : items.filter((i) => i.tags.includes(f)).length)
  const filteredItems = items.filter((item) => filter === 'All' || item.tags.includes(filter))

  return (
    <div>
      <div role="group" aria-label="Filter by topic" className="-mx-2 flex flex-wrap gap-x-1 pb-4">
        {filters.map((f) => {
          const n = count(f)
          const on = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={on}
              disabled={n === 0}
              className={cn(
                'inline-flex h-10 items-baseline gap-1 px-2 pt-2.5 text-[0.8125rem] transition-[color,scale] duration-150 ease-out active:scale-[0.96] disabled:opacity-40',
                on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="ink-link">{f}</span>
              <sup className="font-mono text-[0.625rem] tabular-nums">{n}</sup>
            </button>
          )
        })}
      </div>

      <ul className="border-foreground border-t">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredItems.map((study) => (
            <motion.li
              key={study.slug}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeOut' } }}
              transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              className="border-border border-b"
            >
              <Link href={`/work/${study.slug}`} className="grid-line group gap-y-2 py-5 md:py-6">
                <span className="label col-span-2 pt-0.5 tabular-nums md:col-span-1">{study.period}</span>
                <span className="col-span-2">
                  <span className="block text-[0.9375rem] leading-snug tracking-[-0.005em]">
                    <span className="ink-link">{study.title}</span>
                  </span>
                  <span className="text-muted-foreground mt-1.5 line-clamp-2 block max-w-[36rem]">{study.summary}</span>
                </span>
                <span className="label hidden pt-0.5 text-right md:block">{study.tags.slice(0, 3).join(' · ')}</span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
