import { Metadata } from 'next'
import { format } from 'date-fns'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { HomeExperience } from '@/components/specialized/signal/home-experience'
import { getCaseStudies, getNotes } from '@/lib/content'
import { decodeEntities } from '@/lib/signal-layout'

export const metadata: Metadata = {
  title: 'Home',
  description:
    'SAP Solution Architect & Lead Developer specializing in Clean Core, Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP. Portfolio and case studies.',
  openGraph: {
    title: 'Nils Lutz - SAP Solution Architect & Lead Developer',
    description:
      'SAP Solution Architect specializing in Clean Core architecture, Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP.',
    url: 'https://nilslutz.de',
  },
}

export default async function Page() {
  const [caseStudies, notes] = await Promise.all([getCaseStudies(), getNotes()])

  return (
    <>
      <Navbar overlay />
      <main id="main" className="flex-1">
        <HomeExperience
          cases={caseStudies.map((c) => ({
            slug: c.slug,
            title: c.title,
            summary: c.summary,
            role: c.role,
            period: c.period,
            tags: c.tags,
            metric: c.metrics?.[0] ? decodeEntities(c.metrics[0]) : undefined,
          }))}
          notes={notes.slice(0, 4).map((n) => ({
            slug: n.slug,
            title: n.title,
            summary: n.summary,
            date: n.date,
            dateLabel: format(new Date(n.date), 'yyyy.MM.dd'),
          }))}
        />
      </main>
      <Footer />
    </>
  )
}
