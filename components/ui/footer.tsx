import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { profile } from '@/content/profile'
import packageJson from '@/package.json'

const index = [
  { name: 'About', href: '/about' },
  { name: 'Case Studies', href: '/work' },
  { name: 'Notes', href: '/notes' },
  { name: 'Tools', href: '/tools' },
  { name: 'Contact', href: '/contact' },
]

const elsewhere = [
  { name: 'GitHub', href: profile.socials.github },
  { name: 'LinkedIn', href: profile.socials.linkedin },
  { name: 'SAP Community', href: profile.socials.community },
]

const linkClass = 'hover:text-signal inline-flex min-h-8 items-center transition-colors duration-150 ease-out'

export function Footer() {
  return (
    <footer className="bg-foreground text-background relative z-10 mt-24 overflow-hidden">
      <div className="shell grid-poster gap-y-12 pt-16 pb-10 md:pt-24">
        <div className="col-span-4 md:col-span-7">
          <p className="label text-background/60 mb-6">(End) — Get in touch</p>
          <a
            href={`mailto:${profile.socials.email}`}
            className="group hover:text-signal inline-flex items-start gap-2 text-[clamp(1.9rem,6.4vw,6rem)] leading-[0.9] font-black tracking-[-0.02em] break-all [font-stretch:112.5%] transition-colors duration-150 ease-out"
          >
            {profile.socials.email}
            <ArrowUpRight
              className="mt-[0.1em] size-[0.6em] shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </a>
          <p className="text-background/70 mt-6 max-w-md text-sm">
            {profile.role}. Building clean, maintainable, and robust enterprise solutions.
          </p>
        </div>

        <nav aria-label="Footer" className="col-span-2 md:col-span-2 md:col-start-9">
          <p className="label text-background/60 mb-4">Index</p>
          <ul className="space-y-1 text-sm font-semibold">
            {index.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-2">
          <p className="label text-background/60 mb-4">Elsewhere</p>
          <ul className="space-y-1 text-sm font-semibold">
            {elsewhere.map((item) => (
              <li key={item.href}>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {item.name}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${profile.socials.email}`} className={linkClass}>
                Email
              </a>
            </li>
          </ul>
        </div>

        <div className="label text-background/60 col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 shadow-[0_-1px_0_rgb(255_255_255/0.14)] md:col-span-12 dark:shadow-[0_-1px_0_rgb(0_0_0/0.14)]">
          <span>
            &copy; {new Date().getFullYear()} Nils Lutz. All rights reserved. · v{packageJson.version}
          </span>
          <Link href="/legal-notice" className={linkClass}>
            Legal Notice
          </Link>
          <Link href="/privacy-policy" className={linkClass}>
            Privacy Policy
          </Link>
          <span className="md:ml-auto">Code MIT · Content CC BY-NC-SA 4.0</span>
        </div>
      </div>

      {/* Cropped wordmark: the poster's last line bleeds off the sheet */}
      <p
        aria-hidden="true"
        className="type-display text-background/[0.08] -mb-[0.22em] px-2 text-center text-[24vw] leading-[0.8] whitespace-nowrap select-none"
      >
        Nils Lutz
      </p>
    </footer>
  )
}
