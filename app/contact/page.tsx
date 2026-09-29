import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { AvailabilityBadge } from '@/components/ui/availability-badge'
import { SheetHeader } from '@/components/ui/sheet-header'
import { profile } from '@/content/profile'
import { ArrowUpRight, Mail, Linkedin, Github } from 'lucide-react'
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
      <main className="flex-1">
        <SheetHeader
          sheet="Sheet 06"
          kicker="Base camp · contact"
          title="Get in Touch"
          lede="Interested in robust SAP BTP architectures or Clean Core strategies?"
        >
          <div className="mt-8">
            <p className="marginalia text-muted-foreground mb-2">Current availability</p>
            <AvailabilityBadge />
          </div>
        </SheetHeader>

        <div className="mx-auto max-w-[1400px] px-5 pt-12 md:px-8 md:pt-16">
          <ul className="border-t border-[var(--foreground)]/80">
            {channels.map((c, i) => (
              <li key={c.label} className="border-b border-[var(--rule)]">
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-6 md:grid-cols-[4rem_14rem_1fr_auto] md:py-8"
                >
                  <span className="marginalia text-ochre-ink tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display inline-flex items-center gap-3 text-[clamp(1.5rem,3vw,2.5rem)] font-semibold tracking-[-0.03em]">
                    <c.icon className="text-muted-foreground size-5 md:size-6" strokeWidth={1.5} aria-hidden="true" />
                    <span className="decoration-ochre underline-offset-[6px] group-hover:underline">{c.label}</span>
                  </span>
                  <span className="text-muted-foreground col-start-2 font-serif text-lg md:col-start-auto">
                    {c.note} · <span className="text-foreground">{c.value}</span>
                  </span>
                  <ArrowUpRight
                    className="text-muted-foreground group-hover:text-foreground row-span-2 size-5 transition-[color,translate] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:row-span-1"
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
