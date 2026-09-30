'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { ModeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'About', href: '/about' },
  { name: 'Case Studies', href: '/work' },
  { name: 'Notes', href: '/notes' },
  { name: 'Tools', href: '/tools' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [pathname])

  // Overlay header (home): transparent over the water, solid once the next scene reaches it.
  const [solid, setSolid] = React.useState(!overlay)
  React.useEffect(() => {
    if (!overlay) return
    const update = () => {
      const next = document.querySelector('[data-after-hero]')
      setSolid(next ? next.getBoundingClientRect().top <= 64 : window.scrollY > 64)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [overlay])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      data-site-header
      className={cn(
        'top-0 z-50 w-full transition-[background-color,backdrop-filter] duration-200 ease-out',
        overlay ? 'fixed' : 'sticky',
        solid ? 'bg-background/80 backdrop-blur-md' : 'bg-transparent backdrop-blur-none'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="opsz-headline text-foreground -ml-1 inline-flex h-11 items-center px-1 text-[1.35rem] leading-none font-medium tracking-[-0.02em] transition-opacity duration-150 hover:opacity-70"
        >
          Nils Lutz
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'eyebrow relative inline-flex h-10 items-center px-3 transition-colors duration-150',
                isActive(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.name}
              {isActive(item.href) && (
                <span aria-hidden="true" className="bg-oxide absolute inset-x-3 bottom-2 h-px rounded-full" />
              )}
            </Link>
          ))}
          <span className="bg-border mx-2 h-5 w-px" aria-hidden="true" />
          <ModeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ModeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground hover:bg-foreground/[0.06] relative inline-flex size-11 items-center justify-center rounded-full transition-[background-color,scale] duration-150 ease-out active:scale-[0.96]"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={isOpen ? 'close' : 'open'}
                initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                className="inline-flex"
              >
                {isOpen ? (
                  <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeOut' } }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-background/95 shadow-lift mx-3 rounded-2xl p-2 backdrop-blur-md md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'opsz-headline flex h-12 items-center justify-between rounded-lg px-3 text-xl transition-colors duration-150',
                  isActive(item.href) ? 'text-oxide' : 'text-foreground hover:bg-foreground/[0.05]'
                )}
              >
                {item.name}
                <span className="eyebrow text-muted-foreground">{item.href}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
