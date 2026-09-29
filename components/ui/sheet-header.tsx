import { cn } from '@/lib/utils'

/** Section head in the survey-sheet language: numeral + marginalia kicker + display title. */
export function SectionHeading({
  numeral,
  kicker,
  title,
  lede,
  id,
  className,
  as: Tag = 'h2',
}: {
  numeral: string
  kicker: string
  title: React.ReactNode
  lede?: React.ReactNode
  id?: string
  className?: string
  as?: 'h1' | 'h2'
}) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8', className)}>
      <p className="marginalia text-muted-foreground md:col-span-3 md:pt-3">
        <span className="text-ochre-ink">{numeral}</span> · {kicker}
      </p>
      <div className="md:col-span-9">
        <Tag
          id={id}
          className="font-display text-[clamp(2.25rem,5.2vw,4.25rem)] leading-[0.98] font-semibold tracking-[-0.035em]"
        >
          {title}
        </Tag>
        {lede && (
          <p className="text-muted-foreground mt-4 max-w-2xl font-serif text-[1.2rem] leading-snug md:text-[1.35rem]">
            {lede}
          </p>
        )}
      </div>
    </div>
  )
}

/** Inner-page header: a map-sheet title block over a faint graticule. */
export function SheetHeader({
  sheet,
  kicker,
  title,
  lede,
  children,
}: {
  sheet: string
  kicker: string
  title: React.ReactNode
  lede?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="graticule relative border-b border-[var(--foreground)]/80 pt-28 pb-12 md:pt-36 md:pb-16">
      <div className="bg-background/0 pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--background)]" />
      <div className="relative mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="marginalia text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>
            <span className="text-ochre-ink">{sheet}</span> · {kicker}
          </span>
          <span className="hidden sm:inline">nilslutz.de · Strata edition</span>
        </div>
        <h1 className="font-display mt-6 max-w-5xl text-[clamp(2.75rem,7.5vw,6rem)] leading-[0.95] font-semibold tracking-[-0.04em]">
          {title}
        </h1>
        {lede && (
          <p className="text-muted-foreground mt-5 max-w-2xl font-serif text-[1.2rem] leading-snug md:text-[1.4rem]">
            {lede}
          </p>
        )}
        {children}
      </div>
    </header>
  )
}
