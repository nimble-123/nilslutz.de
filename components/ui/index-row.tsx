import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * One row of a Swiss index list: number · meta · title · tags → whole row is the link.
 * Used for notes and case studies. Hover is a ≤150ms colour change only (high-frequency interaction).
 */
export function IndexRow({
  href,
  index,
  meta,
  title,
  summary,
  tags,
  headingLevel = 'h2',
  className,
}: {
  href: string
  index: string
  meta: React.ReactNode
  title: string
  summary?: string
  tags?: string[]
  headingLevel?: 'h2' | 'h3'
  className?: string
}) {
  const Heading = headingLevel
  return (
    <article className={cn('group relative shadow-[0_1px_0_var(--rule)]', className)}>
      <div className="grid-poster items-baseline gap-y-2 py-6 md:py-8">
        <p className="label text-signal col-span-1">{index}</p>
        <p className="label text-muted-foreground col-span-3 md:col-span-2">{meta}</p>
        <div className="col-span-4 md:col-span-7">
          <Heading className="group-hover:text-signal text-[clamp(1.35rem,2.6vw,2.4rem)] leading-[1.02] font-extrabold tracking-[-0.015em] [font-stretch:112.5%] transition-colors duration-150 ease-out">
            <Link href={href} className="after:absolute after:inset-0">
              {title}
            </Link>
          </Heading>
          {summary && <p className="text-muted-foreground mt-3 max-w-[60ch] text-[0.95rem] leading-snug">{summary}</p>}
        </div>
        <div className="col-span-4 flex items-start justify-between gap-3 md:col-span-2 md:flex-col md:items-end">
          {tags && tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 md:justify-end">
              {tags.slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="label text-muted-foreground px-1.5 py-0.5 shadow-[inset_0_0_0_1px_var(--rule)]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <ArrowUpRight
            className="group-hover:text-signal size-6 shrink-0 transition-[color,translate] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  )
}
