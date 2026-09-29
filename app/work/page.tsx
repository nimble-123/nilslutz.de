import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getCaseStudies } from '@/lib/content'
import { CaseStudyList } from '@/components/specialized/case-study-list'
import { SheetHeader } from '@/components/ui/sheet-header'
import { surveyPoint } from '@/lib/survey'
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
  const items = caseStudies.map((cs, i) => ({
    slug: cs.slug,
    title: cs.title,
    summary: cs.summary,
    period: cs.period,
    role: cs.role,
    tags: cs.tags,
    featured: cs.featured,
    point: surveyPoint(cs.slug, i, caseStudies.length),
  }))

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SheetHeader
          sheet="Sheet 03"
          kicker="Survey register"
          title="Case Studies"
          lede="Selected projects demonstrating Clean Core architecture, SAP BTP extensions, and enterprise integration patterns — each one a fixed survey point."
        />
        <div className="mx-auto max-w-[1400px] px-5 pt-10 md:px-8 md:pt-14">
          <CaseStudyList items={items} />
        </div>
      </main>
      <Footer />
    </>
  )
}
