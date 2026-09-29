'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { ModeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'About', href: '/about' },
  { name: 'Case Studies', href: '/work' },
  { name: 'Notes', href: '/notes' },
  { name: 'Tools', href: '/tools' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [openPath, setOpenPath] = React.useState<string | null>(null)
  const isOpen = openPath === pathname
  const [solid, setSolid] = React.useState(false)
  const isHome = pathname === '/'

  React.useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      if (!isHome) return setSolid(window.scrollY > 8)
      const story = document.getElementById('monolith')
      setSolid(story ? story.getBoundingClientRect().bottom < 72 : window.scrollY > 8)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [isHome])

  React.useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenPath(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ease-out',
        solid || isOpen
          ? 'bg-background/85 shadow-[0_1px_0_var(--border)] backdrop-blur-md backdrop-saturate-150'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-16 max-w-[88rem] items-center justify-between px-4 md:h-20 md:px-8">
        <Link
          href="/"
          className="font-display -ml-1 inline-flex h-11 items-center px-1 text-[1.7rem] leading-none font-medium tracking-[-0.01em] transition-opacity duration-150 hover:opacity-70"
        >
          Nils Lutz
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'label-caps relative inline-flex h-11 items-center px-3 transition-colors duration-150',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
                <span
                  aria-hidden="true"
                  className={cn(
                    'bg-brass absolute inset-x-3 bottom-2.5 h-px origin-left transition-[scale] duration-300 ease-(--ease-gallery)',
                    active ? 'scale-x-100' : 'scale-x-0'
                  )}
                />
              </Link>
            )
          })}
          <span className="bg-border mx-3 h-5 w-px" aria-hidden="true" />
          <ModeToggle />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ModeToggle showLabel={false} />
          <button
            type="button"
            onClick={() => setOpenPath(isOpen ? null : pathname)}
            className="label-caps text-foreground inline-flex h-11 min-w-11 items-center justify-center px-2 transition-[scale] duration-150 ease-out active:scale-[0.96]"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
            <span aria-hidden="true">{isOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeOut' } }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="bg-background/95 h-[calc(100svh-4rem)] backdrop-blur-md md:hidden"
          >
            <ol className="flex flex-col gap-1 px-4 pt-6">
              {navItems.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-baseline gap-4 py-3',
                      pathname === item.href ? 'text-foreground' : 'text-foreground/80'
                    )}
                  >
                    <span className="label-caps text-muted-foreground w-8 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-4xl font-light">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
