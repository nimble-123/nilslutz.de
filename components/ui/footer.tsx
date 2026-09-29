import Link from 'next/link'
import { profile } from '@/content/profile'
import packageJson from '@/package.json'

const socials = [
  { name: 'GitHub', href: profile.socials.github },
  { name: 'LinkedIn', href: profile.socials.linkedin },
  { name: 'SAP Community', href: profile.socials.community },
]

export function Footer() {
  return (
    <footer className="border-hairline bg-ink/80 relative z-[5] border-t backdrop-blur-sm">
      <div className="grid grid-cols-1 gap-10 px-4 py-10 md:grid-cols-12 md:px-10 md:py-14">
        <div className="md:col-span-5">
          <p className="font-serif text-3xl leading-none">{profile.name}</p>
          <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
            {profile.role}. Building clean, maintainable, and robust enterprise solutions.
          </p>
        </div>

        <nav aria-label="Social" className="md:col-span-4">
          <p className="label-mono text-muted-foreground/60 mb-3">Channels</p>
          <ul className="space-y-1">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-sodium inline-flex h-8 items-center text-sm transition-colors duration-150"
                >
                  {s.name}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${profile.socials.email}`}
                className="text-foreground/80 hover:text-sodium inline-flex h-8 items-center text-sm transition-colors duration-150"
              >
                Email
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col justify-between gap-6 md:col-span-3 md:items-end md:text-right">
          <ul className="label-mono text-muted-foreground flex gap-5">
            <li>
              <Link href="/legal-notice" className="hover:text-foreground transition-colors duration-150">
                Legal Notice
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors duration-150">
                Privacy Policy
              </Link>
            </li>
          </ul>
          <p className="label-mono text-muted-foreground/70 tabular-nums">
            &copy; {new Date().getFullYear()} Nils Lutz · v{packageJson.version}
          </p>
        </div>
      </div>
    </footer>
  )
}
