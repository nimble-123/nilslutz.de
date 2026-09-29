import Link from 'next/link'
import { format } from 'date-fns'
import type { Note } from '@/lib/content'
import { cn } from '@/lib/utils'
import { ScrubRule } from '@/components/ui/scrub-rule'

export type JournalEntry = Pick<Note, 'slug' | 'title' | 'summary' | 'date' | 'tags'> & { entry: number }

/** Notes as a field journal: ruled paper, an ochre margin rule, dated entries. */
export function FieldJournal({ entries, headingLevel = 3 }: { entries: JournalEntry[]; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div className="relative">
      <ScrubRule className="bg-ochre/80 absolute inset-y-0 left-[5.5rem] w-px md:left-[9.5rem]" />
      <ol className="ruled">
      {entries.map((n) => (
        <li key={n.slug} className="group relative">
          <Link
            href={`/notes/${n.slug}`}
            className="grid grid-cols-[5.5rem_1fr] gap-x-5 py-8 md:grid-cols-[9.5rem_1fr] md:gap-x-10 md:py-10"
          >
            <div className="marginalia text-muted-foreground pt-1.5 pr-3 text-right tabular-nums">
              <span className="text-ochre-ink block">No. {String(n.entry).padStart(2, '0')}</span>
              <time dateTime={n.date} className="mt-1 block">
                {format(new Date(n.date), 'dd.MM.yyyy')}
              </time>
            </div>
            <div className="min-w-0">
              <Heading
                className={cn(
                  'font-serif text-[clamp(1.35rem,2.3vw,1.9rem)] leading-[1.15] font-medium tracking-[-0.01em] italic',
                  'decoration-ochre underline-offset-[5px] group-hover:underline'
                )}
              >
                {n.title}
              </Heading>
              <p className="text-muted-foreground mt-2 max-w-2xl font-serif text-[1.05rem] leading-snug">{n.summary}</p>
              {n.tags && n.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {n.tags.map((t) => (
                    <li
                      key={t}
                      className="marginalia text-muted-foreground rounded-[2px] px-1.5 py-0.5 shadow-[0_0_0_1px_var(--rule)]"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Link>
        </li>
      ))}
      </ol>
    </div>
  )
}
