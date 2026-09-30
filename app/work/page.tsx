import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getCaseStudies } from '@/lib/content'
import { CaseStudyList } from '@/components/specialized/case-study-list'
import { Metadata } from 'next'
import { PageHeader, pageMain } from '@/components/ui/page-header'

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

  return (
    <>
      <Navbar />
      <main className={pageMain}>
        <PageHeader
          label="Work"
          title="Case Studies"
          intro="Selected projects demonstrating Clean Core architecture, SAP BTP extensions, and enterprise integration patterns."
        />
        <CaseStudyList
          items={caseStudies.map(({ slug, title, summary, tags, period, role }) => ({
            slug,
            title,
            summary,
            tags,
            period,
            role,
          }))}
        />
      </main>
      <Footer />
    </>
  )
}
