import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Hero } from '@/components/specialized/hero'
import { Services } from '@/components/specialized/services'
import { FeaturedWork } from '@/components/specialized/featured-work'
import { TechStack } from '@/components/specialized/tech-stack'
import { getCaseStudies } from '@/lib/content'
import { Metadata } from 'next'

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
  const featured = allCaseStudies.filter((cs) => cs.featured).slice(0, 3)

  return (
    <>
      <Navbar />
      <main className="container mx-auto flex-1 px-4">
        <Hero />
        <Services />
        <FeaturedWork caseStudies={featured} />
        <TechStack />
      </main>
      <Footer />
    </>
  )
}
