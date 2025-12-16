import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Hero } from '@/components/specialized/hero'
import { Services } from '@/components/specialized/services'
import { FeaturedWork } from '@/components/specialized/featured-work'
import { TechStack } from '@/components/specialized/tech-stack'
import { getCaseStudies } from '@/lib/content'

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
