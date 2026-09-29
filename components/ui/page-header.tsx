import { cn } from '@/lib/utils'

/**
 * Inner-page poster header: mono index label, a huge wide headline and a lede on the grid.
 */
export function PageHeader({
  index,
  label,
  title,
  lede,
  aside,
  className,
}: {
  index: string
  label: string
  title: string
  lede?: React.ReactNode
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('shell grid-poster gap-y-6 pt-10 pb-12 md:pt-16 md:pb-20', className)}>
      <p className="label col-span-2 md:col-span-3">
        <span className="text-signal">({index})</span> {label}
      </p>
      {aside && (
        <div className="label text-muted-foreground col-span-2 text-right md:col-span-4 md:col-start-9">{aside}</div>
      )}
      <h1 className="type-display col-span-4 text-[clamp(3rem,10.5vw,11rem)] md:col-span-12">{title}</h1>
      {lede && (
        <div className="col-span-4 max-w-[46ch] text-lg leading-snug font-medium md:col-span-6 md:col-start-7 md:text-2xl">
          {lede}
        </div>
      )}
    </header>
  )
}
