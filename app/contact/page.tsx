import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import { Metadata } from 'next'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
import { AvailabilityBadge } from '@/components/ui/availability-badge'
import { profile } from '@/content/profile'

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
      <main className="flex-1 px-4 pt-32 md:px-8 md:pt-44">
        <div className="mx-auto grid max-w-[88rem] gap-20 lg:grid-cols-12">
          <PageHeader
            className="lg:col-span-7"
            room="Room 05 — Correspondence"
            title="Get in Touch"
            lead="Interested in robust SAP BTP architectures or Clean Core strategies?"
          >
            <div className="pt-4">
              <p className="label-caps text-muted-foreground mb-3">Current Availability</p>
              <AvailabilityBadge />
            </div>
          </PageHeader>

          <ul className="border-border self-end border-t lg:col-span-5">
            {channels.map((c) => (
              <li key={c.label} className="border-border border-b">
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group hover:bg-foreground/[0.025] flex items-center gap-5 px-1 py-6 transition-colors duration-150"
                >
                  <c.icon className="text-muted-foreground size-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="label-caps text-muted-foreground block">{c.label}</span>
                    <span className="font-display mt-1 block truncate text-[1.7rem] leading-tight">{c.value}</span>
                    <span className="text-muted-foreground text-[0.92rem]">{c.note}</span>
                  </span>
                  <ArrowUpRight
                    className="text-brass-ink size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  )
}
