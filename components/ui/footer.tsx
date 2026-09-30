import Link from 'next/link'
import { profile } from '@/content/profile'
import packageJson from '@/package.json'

const socials = [
  { label: 'GitHub', href: profile.socials.github, external: true },
  { label: 'LinkedIn', href: profile.socials.linkedin, external: true },
  { label: 'SAP Community', href: profile.socials.community, external: true },
  { label: 'Email', href: `mailto:${profile.socials.email}`, external: false },
]

export function Footer() {
  return (
    <footer className="border-border text-foreground mt-24 border-t">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-12 md:grid-cols-12 md:px-8 md:py-16">
        <div className="md:col-span-5">
          <p className="opsz-display text-4xl leading-none font-light tracking-[-0.03em] md:text-5xl">{profile.name}</p>
          <p className="text-muted-foreground mt-4 max-w-sm text-base">
            {profile.role}. Building clean, maintainable, and robust enterprise solutions.
          </p>
        </div>

        <nav aria-label="Elsewhere" className="md:col-span-4">
          <p className="eyebrow text-muted-foreground mb-3">Elsewhere</p>
          <ul className="space-y-1">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="hover:text-oxide inline-flex h-9 items-center text-lg transition-colors duration-150"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col justify-between gap-6 md:col-span-3 md:items-end md:text-right">
          <div className="flex gap-5 font-mono text-xs">
            <Link
              href="/legal-notice"
              className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center transition-colors duration-150"
            >
              Legal Notice
            </Link>
            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center transition-colors duration-150"
            >
              Privacy Policy
            </Link>
          </div>
          <p className="text-muted-foreground font-mono text-xs tabular-nums">
            &copy; {new Date().getFullYear()} Nils Lutz. All rights reserved. · v{packageJson.version}
          </p>
        </div>
      </div>
    </footer>
  )
}
