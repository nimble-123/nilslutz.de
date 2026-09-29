import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader, PageShell } from '@/components/ui/page-header'
import { AvailabilityBadge } from '@/components/ui/availability-badge'
import { profile } from '@/content/profile'
import { Mail, Linkedin, Github, ArrowUpRight } from 'lucide-react'
import { Metadata } from 'next'

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
  {
    label: 'Email',
    note: 'Send me a message',
    value: profile.socials.email,
    href: `mailto:${profile.socials.email}`,
    icon: Mail,
    external: false,
  },
  {
    label: 'LinkedIn',
    note: 'Connect professionally',
    value: 'in/nlsltz',
    href: profile.socials.linkedin,
    icon: Linkedin,
    external: true,
  },
  {
    label: 'GitHub',
    note: 'Check my code',
    value: 'nimble-123',
    href: profile.socials.github,
    icon: Github,
    external: true,
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          eyebrow="Contact · Signal"
          title="Get in Touch"
          lede="Interested in robust SAP BTP architectures or Clean Core strategies?"
        />
        <div className="grid grid-cols-12 gap-x-6 gap-y-10 py-12 md:py-16">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="eyebrow text-muted-foreground">Current Availability</h2>
            <AvailabilityBadge className="mt-4" />
          </div>
          <ul className="col-span-12 grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-8">
            {channels.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group bg-card shadow-border hover:shadow-border-hover flex h-full flex-col rounded-2xl p-6 transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]"
                >
                  <span className="flex items-center justify-between">
                    <c.icon className="text-foreground size-5" strokeWidth={1.5} aria-hidden="true" />
                    <ArrowUpRight
                      className="text-muted-foreground group-hover:text-oxide size-4 transition-colors duration-150"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="opsz-headline mt-10 text-2xl tracking-[-0.015em]">{c.label}</span>
                  <span className="text-muted-foreground mt-1 text-sm">{c.note}</span>
                  <span className="mt-4 truncate font-mono text-xs text-[var(--slate)]">{c.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </PageShell>
      <Footer />
    </>
  )
}
