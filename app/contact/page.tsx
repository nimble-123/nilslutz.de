import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { AvailabilityBadge } from '@/components/ui/availability-badge'
import { profile } from '@/content/profile'
import { Metadata } from 'next'
import { PageHeader, pageMain } from '@/components/ui/page-header'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch for SAP BTP architecture consulting, Clean Core strategies, or Side-by-Side Extension development. Available for enterprise projects and technical consulting.',
  openGraph: {
    title: 'Contact - Nils Lutz',
    description: 'Interested in robust SAP BTP architectures or Clean Core strategies? Get in touch.',
    url: 'https://nilslutz.de/contact',
  },
}

const channels = [
  { k: 'Email', v: profile.socials.email, href: `mailto:${profile.socials.email}`, note: 'Send me a message' },
  { k: 'LinkedIn', v: 'in/nlsltz', href: profile.socials.linkedin, note: 'Connect professionally', external: true },
  { k: 'GitHub', v: 'nimble-123', href: profile.socials.github, note: 'Check my code', external: true },
  {
    k: 'SAP Community',
    v: 'Profile',
    href: profile.socials.community,
    note: 'Community contributions',
    external: true,
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className={pageMain}>
        <PageHeader
          label="Contact"
          title="Get in Touch"
          intro="Interested in robust SAP BTP architectures or Clean Core strategies?"
        >
          <AvailabilityBadge className="mt-8" />
        </PageHeader>

        <ul className="border-foreground border-t">
          {channels.map((c) => (
            <li key={c.k} className="border-border border-b">
              <a
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="grid-line group items-baseline gap-y-1 py-5 md:py-6"
              >
                <span className="label col-span-2 md:col-span-1">{c.k}</span>
                <span className="col-span-2 text-[1.125rem] tracking-[-0.015em] md:text-[1.375rem]">
                  <span className="ink-link">{c.v}</span>
                  {c.external && <span className="text-muted-foreground"> ↗</span>}
                </span>
                <span className="text-muted-foreground hidden text-right md:block">{c.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  )
}
