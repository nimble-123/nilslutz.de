'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { ModeToggle } from '@/components/ui/theme-toggle'
import { profile } from '@/content/profile'
import { navItems } from '@/components/ui/nav-items'
import { cn } from '@/lib/utils'

/**
 * A single row of small type. On the home page it is part of the one orchestrated
 * entrance (`intro`), everywhere else it is simply there.
 */
export function Navbar({ intro = false }: { intro?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [pathname])

  React.useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className={cn('absolute inset-x-0 top-0 z-40', intro && 'intro-item')} data-intro="nav">
      <div className="frame flex h-16 items-center justify-between">
        <Link href="/" className="relative -mx-2 px-2 py-3 text-[0.8125rem] font-medium tracking-[-0.005em]">
          {profile.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'ink-link text-[0.8125rem] transition-colors duration-150 ease-out',
                isActive(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
          <ModeToggle className="-mr-3" />
        </nav>

        <div className="flex items-center md:hidden">
          <ModeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="-mr-2 inline-flex h-11 min-w-11 items-center justify-end px-2 text-[0.8125rem] transition-transform duration-150 ease-out active:scale-[0.96]"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.15, ease: 'easeOut' } }}
            transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
            className="bg-background fixed inset-x-0 top-16 bottom-0 md:hidden"
          >
            <ul className="frame">
              {navItems.map((item) => (
                <li key={item.href} className="border-border border-b first:border-t">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'flex h-14 items-center justify-between text-base',
                      isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.name}
                    {isActive(item.href) && <span className="bg-foreground h-px w-4" aria-hidden="true" />}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
