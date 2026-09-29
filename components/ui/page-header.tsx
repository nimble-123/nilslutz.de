import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Gallery wall text at the top of an inner page: room caption, title, lead. */
export function PageHeader({
  room,
  title,
  lead,
  children,
  className,
}: {
  room: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('max-w-4xl space-y-6', className)}>
      <p className="label-caps text-muted-foreground flex items-center gap-3">
        <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
        {room}
      </p>
      <h1 className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] font-light tracking-[-0.02em]">
        {title}
      </h1>
      {lead && <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed md:text-2xl">{lead}</p>}
      {children}
    </header>
  )
}

/** Shared prose styles for MDX and long-form pages */
export const proseClass = cn(
  'prose prose-stone dark:prose-invert max-w-none',
  'prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground',
  'prose-headings:font-display prose-headings:font-normal prose-headings:tracking-[-0.01em] prose-headings:text-foreground',
  'prose-h1:text-5xl prose-h2:text-4xl prose-h2:mt-16 prose-h3:text-2xl',
  'prose-a:text-brass-ink prose-a:decoration-brass/40 prose-a:underline-offset-4 hover:prose-a:decoration-brass',
  'prose-blockquote:border-l-brass prose-blockquote:font-display prose-blockquote:text-2xl prose-blockquote:font-light prose-blockquote:not-italic',
  'prose-hr:border-border prose-th:text-foreground prose-td:text-foreground/90',
  'prose-th:border-b prose-th:border-border prose-td:border-b prose-td:border-border prose-table:text-base',
  'prose-img:rounded-md prose-pre:my-8',
  'text-[1.09rem] leading-[1.75]'
)
