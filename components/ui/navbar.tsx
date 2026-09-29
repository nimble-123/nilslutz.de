'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { ModeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { ContourMark } from '@/components/ui/contour-mark'

const navItems = [
  { name: 'About', href: '/about' },
  { name: 'Case Studies', href: '/work' },
  { name: 'Notes', href: '/notes' },
  { name: 'Tools', href: '/tools' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [atTop, setAtTop] = React.useState(true)
  const pathname = usePathname()
  const isHome = pathname === '/'

  React.useEffect(() => {
    // Close mobile menu on route change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [pathname])

  React.useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = isHome && atTop && !isOpen

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out',
        transparent
          ? 'bg-transparent'
          : 'bg-[color-mix(in_oklab,var(--background)_86%,transparent)] shadow-[0_1px_0_0_var(--rule)] backdrop-blur-md'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8" aria-label="Main">
        <Link
          href="/"
          className="font-display group -ml-1 inline-flex items-center gap-2 rounded-md px-1 py-2 text-[1.05rem] font-semibold tracking-[-0.02em]"
        >
          <ContourMark className="text-foreground size-6 transition-transform duration-500 ease-[var(--ease-survey)] group-hover:rotate-[24deg]" />
          Nils Lutz
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'marginalia relative inline-flex h-10 items-center gap-1.5 rounded-md px-3 transition-colors duration-150 ease-out',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className={cn('tabular-nums', active ? 'text-ochre-ink' : 'opacity-60')}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.name}
                {active && (
                  <span
                    aria-hidden="true"
                    className="bg-ochre absolute inset-x-3 bottom-1.5 h-px"
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </Link>
            )
          })}
          <span className="bg-border mx-2 h-5 w-px" aria-hidden="true" />
          <ModeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ModeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="text-foreground inline-flex size-11 items-center justify-center rounded-md transition-[scale] duration-150 ease-out active:scale-[0.96]"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={isOpen ? 'x' : 'menu'}
                initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                className="inline-flex"
                aria-hidden="true"
              >
                {isOpen ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeOut' } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-background shadow-[0_1px_0_0_var(--rule)] md:hidden"
          >
            <ul className="space-y-0.5 px-5 pt-1 pb-5">
              {navItems.map((item, i) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'font-display flex min-h-12 items-baseline gap-3 border-b border-[var(--rule)] py-3 text-2xl font-medium tracking-[-0.02em]',
                        active ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <span className="marginalia text-ochre-ink">{String(i + 1).padStart(2, '0')}</span>
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
