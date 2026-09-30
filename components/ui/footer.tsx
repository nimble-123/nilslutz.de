import Link from 'next/link'
import { profile } from '@/content/profile'
import packageJson from '@/package.json'
import { navItems } from '@/components/ui/nav-items'

const socials = [
  { name: 'GitHub', href: profile.socials.github },
  { name: 'LinkedIn', href: profile.socials.linkedin },
  { name: 'SAP Community', href: profile.socials.community },
]

const linkClass = 'ink-link text-muted-foreground hover:text-foreground transition-colors duration-150 ease-out'

export function Footer() {
  return (
    <footer className="frame mt-40 pb-10">
      <div className="grid-line border-border gap-y-8 border-t pt-6 text-[0.8125rem]">
        <div className="col-span-2 md:col-span-1">
          <p className="font-medium">{profile.name}</p>
          <p className="text-muted-foreground">{profile.role}</p>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkClass}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {socials.map((s) => (
            <li key={s.name}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {s.name}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${profile.socials.email}`} className={linkClass}>
              Email
            </a>
          </li>
        </ul>
        <div className="col-span-2 flex flex-col justify-between gap-6 md:col-span-1 md:items-end md:text-right">
          <ul className="space-y-1">
            <li>
              <Link href="/legal-notice" className={linkClass}>
                Legal Notice
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className={linkClass}>
                Privacy Policy
              </Link>
            </li>
          </ul>
          <p className="label tabular-nums">
            &copy; {new Date().getFullYear()} {profile.name} · v{packageJson.version}
          </p>
        </div>
      </div>
    </footer>
  )
}
