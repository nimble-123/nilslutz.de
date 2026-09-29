import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader, PageShell } from '@/components/ui/page-header'
import { getCaseStudies } from '@/lib/content'
import { CaseStudyList } from '@/components/specialized/case-study-list'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies',
  description:
    'Selected SAP BTP projects demonstrating Clean Core architecture, Side-by-Side Extensions, event-driven integration, and enterprise patterns. Real-world implementations with CAP, RAP, and Fiori.',
  openGraph: {
    title: 'Case Studies - Nils Lutz',
    description:
      'Selected SAP BTP projects demonstrating Clean Core architecture, Side-by-Side Extensions, and enterprise integration patterns.',
    url: 'https://nilslutz.de/work',
  },
}

export default async function WorkPage() {
  const caseStudies = await getCaseStudies()
  const items = caseStudies.map(({ slug, title, summary, tags, period, role, metrics }) => ({
    slug,
    title,
    summary,
    tags,
    period,
    role,
    metrics,
  }))

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          eyebrow={
            <>
              Work · <span className="tabular-nums">{String(items.length).padStart(2, '0')}</span> tide lines
            </>
          }
          title="Case Studies"
          lede="Selected projects demonstrating Clean Core architecture, SAP BTP extensions, and enterprise integration patterns."
        />
        <CaseStudyList items={items} />
      </PageShell>
      <Footer />
    </>
  )
}
