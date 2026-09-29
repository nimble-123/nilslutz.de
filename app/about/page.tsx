import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { SheetHeader } from '@/components/ui/sheet-header'
import { StrataSwatch } from '@/components/ui/strata-swatch'
import { TrigPoint } from '@/components/ui/trig-point'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export { metadata } from './metadata'

const experience = [
  {
    role: 'Lead Software Engineer',
    company: 'Netze BW GmbH',
    period: 'Dec 2024 - Present',
    years: 1.5,
    description:
      'Shaping the target architecture and development standards (Clean Core, API-first, event-driven integration) for the SAP landscape. Leading the Clean Core initiative and contributing to cross-team architecture governance.',
  },
  {
    role: 'Senior Software Engineer',
    company: 'Netze BW GmbH',
    period: 'Aug 2023 - Dec 2024',
    years: 1.4,
    description: 'SAP S/4HANA and SAP BTP development. Driving cloud transformation projects.',
  },
  {
    role: 'Senior Software Engineer',
    company: 'BTC - Business Technology Consulting AG',
    period: 'Jun 2020 - Aug 2023',
    years: 3.2,
    description:
      'Technical consulting and solution architecture for SAP Fiori projects. Development of Cloud and On-Premise apps (S/4HANA, BTP). Fiori Launchpad configuration and SAP Gateway integration.',
  },
  {
    role: 'Team Lead Backend Development',
    company: 'ZEIT GmbH & Co. KG',
    period: 'Apr 2016 - Jan 2020',
    years: 3.8,
    description:
      'Coordinating ABAP development. Training and support for SAP UI5 frontend development. System administration for SAP Dev systems in the cloud (AWS).',
  },
  {
    role: 'IT Consultant (Freelance)',
    company: 'Freelancer',
    period: 'Mar 2015 - Mar 2016',
    years: 1,
    description: 'Consulting and software development in the SAP environment for the energy sector.',
  },
  {
    role: 'Student Internship',
    company: 'abat',
    period: 'Aug 2014 - Feb 2015',
    years: 0.6,
    description: 'Prototypical implementation of SAP UI5 applications and analysis of efficient UI object usage.',
  },
]

const education = [
  {
    degree: 'Master of Science (M.Sc.)',
    field: 'Business Informatics',
    school: 'Carl von Ossietzky University Oldenburg',
    period: '2015 - 2018',
    description: 'Focus on Workflow Management and Business Intelligence.',
  },
  {
    degree: 'Bachelor of Science (B.Sc.)',
    field: 'Business Informatics',
    school: 'Jade University of Applied Sciences',
    period: '2011 - 2015',
    description: 'Thesis on SAP UI5 prototyping and efficient UI object usage.',
  },
]

const principles = [
  {
    title: 'Docs as Code',
    text: 'Documentation lives with the code. I use arc42-light and ADRs to capture architectural decisions where they happen.',
  },
  {
    title: 'Clean Core',
    text: 'Strict separation of standard and custom code. Extensions run Side-by-Side on BTP or via released APIs on-stack.',
  },
  {
    title: 'Automated Quality Gates',
    text: 'CI/CD pipelines are mandatory. Static code analysis (ESLint, ABAP Test Cockpit) ensures consistent quality.',
  },
  {
    title: 'User Centricity',
    text: 'Fiori Guidelines are there for a reason. Consistent UX reduces training costs and increases adoption.',
  },
]

const achievements = [
  'SAP Community Fan 2022',
  'Open Documentation Initiative Contributor',
  'SAP Community Code Challenge Participant',
  'Coffee Corner Connoisseur',
  'Multiple SAP TechEd Attendee (2020-2022)',
]

const patterns = ['laminae', 'stipple', 'hatch', 'bedrock'] as const

function Block({ numeral, title, children }: { numeral: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-6 border-t border-[var(--rule)] pt-8 md:grid-cols-12 md:gap-8 md:pt-10">
      <h2 className="md:col-span-3">
        <span className="marginalia text-ochre-ink block">{numeral}</span>
        <span className="font-display mt-1 block text-2xl font-semibold tracking-[-0.02em]">{title}</span>
      </h2>
      <div className="md:col-span-9">{children}</div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <SheetHeader sheet="Sheet 02" kicker="Surveyor's record" title="About Me" />

        <div className="mx-auto max-w-[1400px] space-y-16 px-5 pt-12 md:space-y-24 md:px-8 md:pt-16">
          <section className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <p className="marginalia text-muted-foreground md:col-span-3 md:pt-2">Field notes on the surveyor</p>
            <div className="prose-strata max-w-[46rem] text-[1.2rem] md:col-span-9 md:text-[1.3rem]">
              <p>
                I design and build Side-by-Side Extensions with <strong>CAP</strong>, <strong>RAP</strong>, and{' '}
                <strong>Fiori</strong> on SAP BTP. My primary focus is on <strong>Clean Core</strong> compliance,
                event-driven architectures, and distinct &quot;Separation of Concerns&quot;. Increasingly, my work has
                shifted from building individual solutions to shaping the <strong>target architecture</strong> and the{' '}
                <strong>development standards</strong> the whole SAP landscape is built on.
              </p>
              <p>
                I believe in <strong>Enterprise Pragmatism</strong>. Software used in large corporations must be robust,
                maintainable, and deliver measurable value. I advocate for modern development practices not just because
                they are trendy, but because they significantly reduce the Total Cost of Ownership (TCO) and enable
                sustainable innovation.
              </p>
            </div>
          </section>

          <Block numeral="A" title="Stratigraphic column">
            <p className="text-muted-foreground mb-8 max-w-xl font-serif text-lg leading-snug">
              Experience, read like a borehole: the most recent layer on top, band thickness roughly proportional to
              time spent.
            </p>
            <ol>
              {experience.map((item, index) => (
                <li key={index} className="grid grid-cols-[3.5rem_1fr] gap-x-5 md:grid-cols-[5rem_1fr] md:gap-x-8">
                  <StrataSwatch pattern={patterns[index % patterns.length]} className="h-full w-full" />
                  <div
                    className="border-b border-[var(--rule)] py-5"
                    style={{ minHeight: `${Math.max(6, item.years * 3.2)}rem` }}
                  >
                    <p className="marginalia text-muted-foreground tabular-nums">{item.period}</p>
                    <h3 className="font-display mt-1 text-xl font-semibold tracking-[-0.02em]">{item.role}</h3>
                    <p className="text-primary mt-0.5 font-medium">{item.company}</p>
                    <p className="text-muted-foreground mt-2 max-w-2xl font-serif text-[1.05rem] leading-snug">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Block>

          <Block numeral="B" title="Foundation · Education">
            <ol className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {education.map((item) => (
                <li key={item.degree} className="shadow-border bg-paper-raised rounded-md p-6">
                  <p className="marginalia text-muted-foreground tabular-nums">{item.period}</p>
                  <h3 className="font-display mt-1 text-lg font-semibold tracking-[-0.015em]">{item.degree}</h3>
                  <p className="mt-0.5 font-medium">{item.school}</p>
                  <p className="text-muted-foreground font-serif italic">{item.field}</p>
                  <p className="text-muted-foreground mt-2 font-serif leading-snug">{item.description}</p>
                </li>
              ))}
            </ol>
          </Block>

          <Block numeral="C" title="Community Engagement">
            <p className="text-muted-foreground max-w-2xl font-serif text-lg leading-snug">
              Active member of the <strong className="text-foreground">SAP Community</strong> with{' '}
              <strong className="text-foreground">249 badges</strong> earned through tutorials, contributions, and event
              participation. Regular participant in <strong className="text-foreground">Devtoberfest</strong>{' '}
              (2021-2025), achieving finalist status in 2021.
            </p>
            <dl className="mt-8 grid grid-cols-3 border-y border-[var(--foreground)]/80">
              {[
                ['249', 'Community Badges'],
                ['5', 'Devtoberfest Years'],
                ['Finalist', 'Devtoberfest 2021'],
              ].map(([value, label], i) => (
                <div
                  key={label}
                  className={cn(
                    'flex flex-col-reverse justify-end gap-2 py-5',
                    i > 0 && 'border-l border-[var(--rule)] pl-4 md:pl-6'
                  )}
                >
                  <dt className="marginalia text-muted-foreground">{label}</dt>
                  <dd className="font-display text-[clamp(1.5rem,4vw,2.75rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <h3 className="marginalia text-muted-foreground mt-8">Key Achievements</h3>
            <ul className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {achievements.map((a) => (
                <li key={a} className="flex items-center gap-3 border-b border-[var(--rule)] py-2.5">
                  <TrigPoint className="text-ochre-ink size-3.5 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
            <a
              href="https://community.sap.com/t5/user/viewprofilepage/user-id/73"
              target="_blank"
              rel="noopener noreferrer"
              className="btn shadow-border hover:shadow-border-hover mt-6 pr-3.5 pl-4"
            >
              View Full Profile on SAP Community
              <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </a>
          </Block>

          <Block numeral="D" title="Philosophy & Methodology">
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-md bg-[var(--rule)] shadow-[var(--shadow-border)] md:grid-cols-2">
              {principles.map((p, i) => (
                <div key={p.title} className="bg-background p-6">
                  <dt className="font-display flex items-baseline gap-3 text-lg font-semibold tracking-[-0.015em]">
                    <span className="marginalia text-ochre-ink tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    {p.title}
                  </dt>
                  <dd className="text-muted-foreground mt-2 font-serif leading-snug">{p.text}</dd>
                </div>
              ))}
            </dl>
          </Block>
        </div>
      </main>
      <Footer />
    </>
  )
}
