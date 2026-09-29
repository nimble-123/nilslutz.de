import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
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

  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 px-4 pt-12 pb-24 md:px-10 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            code="02"
            channel="Work"
            title="Case Studies"
            lede="Selected projects demonstrating Clean Core architecture, SAP BTP extensions, and enterprise integration patterns."
          />
          <CaseStudyList items={caseStudies} />
        </div>
      </main>
      <Footer />
    </>
  )
}
