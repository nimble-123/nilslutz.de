import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { AvailabilityBadge } from '@/components/ui/availability-badge'
import { PageHeader } from '@/components/ui/page-header'
import { profile } from '@/content/profile'
import { ArrowUpRight } from 'lucide-react'
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
  { code: 'CH·01', name: 'Email', hint: 'Send me a message', href: `mailto:${profile.socials.email}`, external: false },
  { code: 'CH·02', name: 'LinkedIn', hint: 'Connect professionally', href: profile.socials.linkedin, external: true },
  { code: 'CH·03', name: 'GitHub', hint: 'Check my code', href: profile.socials.github, external: true },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 px-4 pt-12 pb-24 md:px-10 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            code="05"
            channel="Contact"
            title={
              <>
                Get in <em className="text-sodium">touch</em>
              </>
            }
            lede="Interested in robust SAP BTP architectures or Clean Core strategies?"
          >
            <div className="mt-8">
              <h2 className="sr-only">Current Availability</h2>
              <AvailabilityBadge />
            </div>
          </PageHeader>

          <ul className="mt-4">
            {channels.map((c) => (
              <li key={c.name} className="border-hairline border-b">
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group grid grid-cols-[4rem_1fr_auto] items-center gap-4 py-8 md:grid-cols-[6rem_1fr_16rem_auto] md:py-10"
                >
                  <span className="label-mono text-sodium tabular-nums">{c.code}</span>
                  <span className="group-hover:text-sodium font-serif text-5xl leading-none transition-colors duration-150 md:text-7xl">
                    {c.name}
                  </span>
                  <span className="text-muted-foreground hidden text-sm md:block">{c.hint}</span>
                  <ArrowUpRight
                    className="text-muted-foreground group-hover:text-sodium size-6 transition-colors duration-150"
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
