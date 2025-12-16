import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { getCaseStudies } from '@/lib/content'
import { CaseStudyList } from '@/components/specialized/case-study-list'

export default async function WorkPage() {
  const caseStudies = await getCaseStudies()

  return (
    <>
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Case Studies</h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Selected projects demonstrating Clean Core architecture, SAP BTP extensions, and enterprise integration
              patterns.
            </p>
          </div>

          <CaseStudyList items={caseStudies} />
        </div>
      </main>
      <Footer />
    </>
  )
}
