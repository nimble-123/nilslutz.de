import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { TerrainHero } from '@/components/specialized/terrain-hero'
import { StrataSection } from '@/components/specialized/strata-section'
import { SurveyRegister } from '@/components/specialized/survey-register'
import { FieldJournal } from '@/components/specialized/field-journal'
import { BaseCamp } from '@/components/specialized/base-camp'
import { SectionHeading } from '@/components/ui/sheet-header'
import { DepthGauge } from '@/components/ui/depth-gauge'
import { getCaseStudies, getNotes } from '@/lib/content'
import { surveyPoint } from '@/lib/survey'

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
  const allCaseStudies = await getCaseStudies()
  const featured = allCaseStudies.filter((cs) => cs.featured).slice(0, 6)
  const register = featured.map((cs, i) => ({
    slug: cs.slug,
    title: cs.title,
    summary: cs.summary,
    period: cs.period,
    role: cs.role,
    tags: cs.tags,
    point: surveyPoint(cs.slug, i, featured.length),
  }))

  const notes = await getNotes()
  const journal = notes.slice(0, 5).map((n, i) => ({
    slug: n.slug,
    title: n.title,
    summary: n.summary,
    date: n.date,
    tags: n.tags,
    entry: notes.length - i,
  }))

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div data-depth="Surface">
          <TerrainHero />
        </div>
        <div data-depth="Strata">
          <StrataSection />
        </div>

        <section
          data-depth="Survey"
          aria-labelledby="survey-title"
          className="mx-auto max-w-[1400px] px-5 pt-24 md:px-8 md:pt-36"
        >
          <SectionHeading
            id="survey-title"
            numeral="III"
            kicker="Survey points · selected case studies"
            title={
              <>
                Where the ground
                <br className="hidden md:block" /> was surveyed
              </>
            }
            lede="Each project is a fixed point: a problem measured, an architecture laid down, an outcome recorded."
            className="mb-12 md:mb-20"
          />
          <SurveyRegister items={register} />
          <div className="mt-10 flex justify-end">
            <Link
              href="/work"
              className="btn shadow-border hover:shadow-border-hover pr-3.5 pl-4 transition-[scale,box-shadow]"
            >
              Full survey register
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          data-depth="Journal"
          aria-labelledby="journal-title"
          className="mx-auto max-w-[1400px] px-5 pt-28 md:px-8 md:pt-40"
        >
          <SectionHeading
            id="journal-title"
            numeral="IV"
            kicker="Field journal · notes"
            title="Notes from the field"
            lede="Pattern libraries, architectural thoughts and pragmatic guides — written down while the ground was still fresh."
            className="mb-10 md:mb-16"
          />
          <FieldJournal entries={journal} />
          <div className="mt-10 flex justify-end">
            <Link
              href="/notes"
              className="btn shadow-border hover:shadow-border-hover pr-3.5 pl-4 transition-[scale,box-shadow]"
            >
              Open the full journal
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <div data-depth="Base camp">
          <BaseCamp />
        </div>
      </main>
      <Footer />
      <DepthGauge />
    </>
  )
}
