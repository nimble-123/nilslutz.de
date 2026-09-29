import type { CaseStudy } from '@/lib/content'
import { EXHIBIT_COUNT } from './story'

export type Exhibit = {
  no: string
  kind: string
  title: string
  date?: string
  medium: string
  credit?: string
  text: string
  href?: string
}

/** The three disciplines (formerly "What I do") — the core and its two extensions. */
const services: Exhibit[] = [
  {
    no: '00',
    kind: 'The Core',
    title: 'Clean Core & Architecture',
    medium: 'Strict Clean Core compliance, S/4HANA',
    text: 'Strategic consulting for S/4HANA transformations. Avoiding technical debt through strict Clean Core Compliance.',
    credit: 'The piece that never moves',
  },
  {
    no: '01',
    kind: 'Extension',
    title: 'SAP BTP Extensions',
    medium: 'CAP (Node.js/Java), RAP, BTP Destinations',
    text: 'Development of scalable Side-by-Side Apps with CAP (Node.js/Java) or RAP (Steampunk/Private Cloud). Integration via BTP Destinations.',
  },
  {
    no: '02',
    kind: 'Extension',
    title: 'Integration & Events',
    medium: 'Event Mesh, Cloud Integration, API Management',
    text: 'Decoupling systems via Event-Driven Architecture (Event Mesh) and robust API Management (Cloud Integration/APIM).',
  },
]

export function buildExhibits(caseStudies: CaseStudy[]): Exhibit[] {
  const works = [...caseStudies.filter((c) => c.featured), ...caseStudies.filter((c) => !c.featured)]
  const needed = EXHIBIT_COUNT - services.length
  const studies: Exhibit[] = works.slice(0, needed).map((cs, i) => ({
    no: String(services.length + i).padStart(2, '0'),
    kind: 'Case study',
    title: cs.title,
    date: cs.period,
    medium: cs.stack.slice(0, 3).join(', '),
    credit: cs.role,
    text: cs.summary,
    href: `/work/${cs.slug}`,
  }))
  return [...services, ...studies]
}
