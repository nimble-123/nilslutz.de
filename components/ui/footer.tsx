import Link from 'next/link'
import { profile } from '@/content/profile'
import packageJson from '@/package.json'
import { ContourMark } from '@/components/ui/contour-mark'

const external = [
  { label: 'GitHub', href: profile.socials.github },
  { label: 'LinkedIn', href: profile.socials.linkedin },
  { label: 'SAP Community', href: profile.socials.community },
]

/** The sheet's legend strip — every map ends with one. */
export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-[var(--foreground)]/80 md:mt-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-12 md:gap-8 md:py-16">
          <div className="space-y-4 md:col-span-5">
            <p className="font-display inline-flex items-center gap-2 text-lg font-semibold tracking-[-0.02em]">
              <ContourMark className="size-6" />
              {profile.name}
            </p>
            <p className="text-muted-foreground max-w-sm font-serif text-[1.05rem] leading-relaxed">
              {profile.role}. Surveying enterprise landscapes and building clean, maintainable solutions on top of them.
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="marginalia text-muted-foreground mb-3">Channels</p>
            <ul className="space-y-1">
              {external.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary inline-flex min-h-9 items-center transition-colors duration-150"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${profile.socials.email}`}
                  className="hover:text-primary inline-flex min-h-9 items-center transition-colors duration-150"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="marginalia text-muted-foreground mb-3">Legend</p>
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5 text-sm">
              <dt aria-hidden="true">
                <svg width="36" height="8" viewBox="0 0 36 8">
                  <path d="M0 4 Q9 0 18 4 T36 4" fill="none" stroke="var(--contour)" strokeWidth="1" />
                </svg>
              </dt>
              <dd className="text-muted-foreground">Contour · 10 m interval</dd>
              <dt aria-hidden="true">
                <svg width="36" height="8" viewBox="0 0 36 8">
                  <path d="M0 4 Q9 0 18 4 T36 4" fill="none" stroke="var(--contour)" strokeWidth="2.2" />
                </svg>
              </dt>
              <dd className="text-muted-foreground">Index contour · 50 m</dd>
              <dt aria-hidden="true" className="flex justify-center">
                <svg width="12" height="11" viewBox="0 0 12 11">
                  <path d="M6 1 L11 10 H1 Z" fill="none" stroke="var(--foreground)" strokeWidth="1.2" />
                  <circle cx="6" cy="7" r="1.2" fill="var(--foreground)" />
                </svg>
              </dt>
              <dd className="text-muted-foreground">Survey point · case study</dd>
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[var(--rule)] py-6 md:flex-row md:items-center md:justify-between">
          <div className="marginalia text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>&copy; {new Date().getFullYear()} Nils Lutz</span>
            <span>Sheet nilslutz.de · Ed. v{packageJson.version}</span>
            <span className="hidden sm:inline">53°08′N 08°13′E</span>
          </div>
          <div className="flex items-center gap-6">
            <ScaleBar />
            <Link href="/legal-notice" className="marginalia text-muted-foreground hover:text-foreground">
              Legal Notice
            </Link>
            <Link href="/privacy-policy" className="marginalia text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function ScaleBar() {
  return (
    <div className="hidden items-end gap-2 lg:flex" aria-hidden="true">
      <div className="flex h-2 w-24 overflow-hidden shadow-[0_0_0_1px_var(--foreground)]">
        <span className="bg-foreground w-1/4" />
        <span className="w-1/4" />
        <span className="bg-foreground w-1/4" />
        <span className="w-1/4" />
      </div>
      <span className="marginalia text-muted-foreground leading-none">1 km</span>
    </div>
  )
}
