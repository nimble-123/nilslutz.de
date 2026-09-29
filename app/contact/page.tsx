import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
import { AvailabilityBadge } from '@/components/ui/availability-badge'
import { RiveMachine } from '@/components/ui/rive-machine'
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
  { name: 'Email', hint: 'Send me a message', href: `mailto:${profile.socials.email}`, external: false },
  { name: 'LinkedIn', hint: 'Connect professionally', href: profile.socials.linkedin, external: true },
  { name: 'GitHub', hint: 'Check my code', href: profile.socials.github, external: true },
  { name: 'SAP Community', hint: 'Profile & contributions', href: profile.socials.community, external: true },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <PageHeader
          index="05"
          label="Contact"
          title="Get in Touch"
          lede="Interested in robust SAP BTP architectures or Clean Core strategies?"
        />

        <div className="shell grid-poster gap-y-12">
          <section aria-labelledby="availability" className="col-span-4 space-y-4 md:col-span-7">
            <h2 id="availability" className="label text-muted-foreground">
              Current Availability
            </h2>
            <AvailabilityBadge />

            <ul className="mt-10 shadow-[0_-2px_0_var(--foreground)]">
              {channels.map((c, i) => (
                <li key={c.name} className="shadow-[0_1px_0_var(--rule)]">
                  <a
                    href={c.href}
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-5 md:py-7"
                  >
                    <span className="label text-signal">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="group-hover:text-signal block text-[clamp(1.8rem,4.2vw,3.8rem)] leading-none font-black tracking-[-0.02em] uppercase [font-stretch:125%] transition-colors duration-150 ease-out">
                        {c.name}
                      </span>
                      <span className="label text-muted-foreground mt-2 block">{c.hint}</span>
                    </span>
                    <ArrowUpRight
                      className="group-hover:text-signal size-7 transition-[color,translate] duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:size-10"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <aside className="col-span-4 md:col-span-4 md:col-start-9">
            <div className="md:sticky md:top-24">
              <RiveMachine className="bg-signal" caption="Fig. 1 — Feed it a request" />
              <p className="text-muted-foreground mt-3 text-sm">
                Press “Insert data” — the machine processes it. Your actual request goes to{' '}
                <a
                  href={`mailto:${profile.socials.email}`}
                  className="text-foreground decoration-signal underline decoration-2 underline-offset-2"
                >
                  {profile.socials.email}
                </a>
                .
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
