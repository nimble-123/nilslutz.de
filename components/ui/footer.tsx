import Link from 'next/link'
import { profile } from '@/content/profile'
import packageJson from '@/package.json'

const correspondence = [
  { label: 'GitHub', href: profile.socials.github, external: true },
  { label: 'LinkedIn', href: profile.socials.linkedin, external: true },
  { label: 'SAP Community', href: profile.socials.community, external: true },
  { label: 'Email', href: `mailto:${profile.socials.email}`, external: false },
]

export function Footer() {
  return (
    <footer className="relative z-10 mt-32 px-4 pb-10 md:px-8">
      <div className="mx-auto max-w-[88rem]">
        <div className="hairline" />
        <div className="grid grid-cols-1 gap-12 pt-12 md:grid-cols-12">
          <div className="space-y-3 md:col-span-5">
            <p className="font-display text-4xl leading-none font-light">{profile.name}</p>
            <p className="text-muted-foreground max-w-sm">
              {profile.role}. Building clean, maintainable, and robust enterprise solutions.
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="label-caps text-muted-foreground mb-4">Correspondence</p>
            <ul className="grid grid-cols-2 gap-x-6">
              {correspondence.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="hover:text-brass-ink inline-flex h-10 items-center transition-colors duration-150"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 md:text-right">
            <p className="label-caps text-muted-foreground mb-4">Colophon</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                <Link href="/legal-notice" className="hover:text-foreground inline-flex h-8 items-center">
                  Legal Notice
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground inline-flex h-8 items-center">
                  Privacy Policy
                </Link>
              </li>
              <li className="pt-2 tabular-nums">
                &copy; {new Date().getFullYear()} Nils Lutz. All rights reserved. · v{packageJson.version}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
