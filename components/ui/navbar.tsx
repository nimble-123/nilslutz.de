'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'About', href: '/about', code: '01' },
  { name: 'Case Studies', href: '/work', code: '02' },
  { name: 'Notes', href: '/notes', code: '03' },
  { name: 'Tools', href: '/tools', code: '04' },
  { name: 'Contact', href: '/contact', code: '05' },
]

const iconSwap = {
  initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  transition: { type: 'spring' as const, duration: 0.3, bounce: 0 },
}

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header
      className={cn(
        'top-0 z-50 w-full',
        overlay ? 'fixed' : 'sticky',
        'bg-[linear-gradient(to_bottom,rgb(5_7_12/0.92),rgb(5_7_12/0.6)_60%,transparent)]'
      )}
    >
      <nav aria-label="Main" className="flex h-16 items-center justify-between px-4 md:h-20 md:px-10">
        <Link href="/" className="group -ml-1 flex h-11 items-center gap-2.5 px-1">
          <span
            aria-hidden="true"
            className="bg-sodium size-2 rounded-full shadow-[0_0_12px_2px_rgb(255_138_43/0.6)] transition-[scale] duration-150 ease-out group-hover:scale-125"
          />
          <span className="font-serif text-2xl leading-none tracking-tight">Nils Lutz</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'label-mono flex h-10 items-center gap-1.5 rounded-full px-3.5 transition-colors duration-150',
                  isActive(item.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className={cn('tabular-nums', isActive(item.href) ? 'text-sodium' : 'text-muted-foreground/50')}>
                  {item.code}
                </span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="text-foreground -mr-2 inline-flex size-11 items-center justify-center rounded-full transition-[scale] duration-150 ease-out active:scale-[0.96] md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={isOpen ? 'x' : 'menu'} {...iconSwap} className="flex">
              {isOpen ? (
                <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeOut' } }}
            className="bg-ink/95 border-hairline border-b backdrop-blur-md md:hidden"
          >
            <ul className="px-4 pt-2 pb-6">
              {navItems.map((item) => (
                <li key={item.href} className="border-hairline border-b last:border-b-0">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className="flex h-14 items-baseline gap-4"
                  >
                    <span className="label-mono text-sodium tabular-nums">{item.code}</span>
                    <span className={cn('font-serif text-3xl', isActive(item.href) && 'italic')}>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
