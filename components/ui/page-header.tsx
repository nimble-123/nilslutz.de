import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Label in the first column, the title and a short intro across the other three. */
export function PageHeader({
  label,
  title,
  intro,
  className,
  children,
}: {
  label: ReactNode
  title: ReactNode
  intro?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <header className={cn('grid-line gap-y-4 pb-12 md:pb-20', className)}>
      <p className="label pt-1.5 md:pt-3">{label}</p>
      <div className="col-span-2 md:col-span-3">
        <h1 className="text-[1.75rem] leading-[1.15] font-normal tracking-[-0.03em] md:text-[2.25rem]">{title}</h1>
        {intro && <p className="text-muted-foreground mt-4 max-w-[36rem] text-[0.9375rem] leading-relaxed">{intro}</p>}
        {children}
      </div>
    </header>
  )
}

export const pageMain = 'frame flex-1 pt-32 md:pt-44'
