import { cn } from '@/lib/utils'

type PageHeaderProps = {
  eyebrow: React.ReactNode
  title: string
  lede?: React.ReactNode
  className?: string
}

/** Shared inner-page masthead: mono eyebrow, display-cut Fraunces, a short lede. */
export function PageHeader({ eyebrow, title, lede, className }: PageHeaderProps) {
  return (
    <header className={cn('border-border border-b pt-10 pb-10 md:pt-20 md:pb-14', className)}>
      <p className="eyebrow text-muted-foreground">{eyebrow}</p>
      <h1 className="opsz-display mt-4 text-[3rem] leading-[0.92] font-light tracking-[-0.04em] md:text-[6.5rem]">
        {title}
      </h1>
      {lede && <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-snug md:text-xl">{lede}</p>}
    </header>
  )
}

/** Standard inner-page container. */
export function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className="grain w-full flex-1">
      <div className={cn('mx-auto w-full max-w-[1440px] px-4 md:px-8', className)}>{children}</div>
    </main>
  )
}
