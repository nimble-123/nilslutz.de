import { cn } from '@/lib/utils'

/** Inner-page masthead: mono channel code, huge serif title, quiet lede. */
export function PageHeader({
  code,
  channel,
  title,
  lede,
  className,
  children,
}: {
  code: string
  channel: string
  title: React.ReactNode
  lede?: React.ReactNode
  className?: string
  children?: React.ReactNode
}) {
  return (
    <header className={cn('border-hairline border-b pb-10 md:pb-14', className)}>
      <p className="label-mono text-muted-foreground mb-6 flex items-center gap-3">
        <span className="text-sodium tabular-nums">{code}</span>
        <span className="bg-hairline h-px w-8" aria-hidden="true" />
        {channel}
      </p>
      <h1 className="font-serif text-6xl leading-[0.9] tracking-[-0.02em] md:text-8xl">{title}</h1>
      {lede && <p className="text-foreground/75 mt-6 max-w-2xl text-lg leading-relaxed md:text-xl">{lede}</p>}
      {children}
    </header>
  )
}
