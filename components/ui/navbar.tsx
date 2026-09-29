'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { ModeToggle } from '@/components/ui/theme-toggle'
import { getLenis } from '@/lib/motion/scroll'
import { cn } from '@/lib/utils'

export const navItems = [
  { name: 'About', href: '/about' },
  { name: 'Case Studies', href: '/work' },
  { name: 'Notes', href: '/notes' },
  { name: 'Tools', href: '/tools' },
  { name: 'Contact', href: '/contact' },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [pathname])

  // Freeze the page behind the full-screen menu
  React.useEffect(() => {
    const lenis = getLenis()
    if (isOpen) lenis?.stop()
    else lenis?.start()
    document.documentElement.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  return (
    <header className="bg-background/92 sticky top-0 z-50 w-full shadow-[0_1px_0_var(--rule)] backdrop-blur-md">
      <nav aria-label="Main" className="shell grid-poster h-14 items-center">
        <Link
          href="/"
          className="press col-span-2 -ml-2 inline-flex h-11 items-center self-center justify-self-start px-2 text-[0.95rem] font-black tracking-[-0.01em] uppercase [font-stretch:125%] md:col-span-3"
        >
          Nils Lutz
        </Link>

        <p className="label text-muted-foreground col-span-3 hidden lg:block">SAP Solution Architect — DE</p>

        <ul className="col-span-5 hidden items-center gap-1 md:col-start-6 md:flex lg:col-start-7">
          {navItems.map((item, i) => {
            const active = isActive(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group inline-flex h-11 items-center gap-1.5 px-2 text-sm font-semibold transition-colors duration-150 ease-out',
                    active ? 'text-signal' : 'text-foreground hover:text-signal'
                  )}
                >
                  <span className="label text-muted-foreground group-hover:text-signal transition-colors duration-150">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="col-span-2 flex items-center justify-end gap-1 md:col-span-1 md:col-start-12">
          <ModeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="press text-foreground hover:bg-foreground hover:text-background inline-flex size-11 items-center justify-center md:hidden"
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
              >
                {isOpen ? (
                  <X className="size-6" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Menu className="size-6" strokeWidth={2} aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.15, ease: 'easeOut' } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-background fixed inset-x-0 top-14 bottom-0 md:hidden"
          >
            <ul className="shell flex h-full flex-col justify-center gap-1 pb-16">
              {navItems.map((item, i) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href} className="shadow-[0_1px_0_var(--rule)]">
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'type-display flex items-baseline gap-3 py-3 text-[2.6rem] transition-colors duration-150',
                        active ? 'text-signal' : 'text-foreground'
                      )}
                    >
                      <span className="label text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
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
