import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
import { profile } from '@/content/profile'

// Metadata lives in ./metadata.ts (re-exported below)
export { metadata } from './metadata'

const experience = [
  {
    role: 'Lead Software Engineer',
    company: 'Netze BW GmbH',
    period: 'Dec 2024 - Present',
    description:
      'Shaping the target architecture and development standards (Clean Core, API-first, event-driven integration) for the SAP landscape. Leading the Clean Core initiative and contributing to cross-team architecture governance.',
  },
  {
    role: 'Senior Software Engineer',
    company: 'Netze BW GmbH',
    period: 'Aug 2023 - Dec 2024',
    description: 'SAP S/4HANA and SAP BTP development. Driving cloud transformation projects.',
  },
  {
    role: 'Senior Software Engineer',
    company: 'BTC - Business Technology Consulting AG',
    period: 'Jun 2020 - Aug 2023',
    description:
      'Technical consulting and solution architecture for SAP Fiori projects. Development of Cloud and On-Premise apps (S/4HANA, BTP). Fiori Launchpad configuration and SAP Gateway integration.',
  },
  {
    role: 'Team Lead Backend Development',
    company: 'ZEIT GmbH & Co. KG',
    period: 'Apr 2016 - Jan 2020',
    description:
      'Coordinating ABAP development. Training and support for SAP UI5 frontend development. System administration for SAP Dev systems in the cloud (AWS).',
  },
  {
    role: 'IT Consultant (Freelance)',
    company: 'Freelancer',
    period: 'Mar 2015 - Mar 2016',
    description: 'Consulting and software development in the SAP environment for the energy sector.',
  },
  {
    role: 'Student Internship',
    company: 'abat',
    period: 'Aug 2014 - Feb 2015',
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

function SectionTitle({ code, children }: { code: string; children: React.ReactNode }) {
  return (
    <div className="md:col-span-4">
      <p className="label-mono text-sodium mb-3 tabular-nums">{code}</p>
      <h2 className="font-serif text-4xl leading-none md:text-5xl">{children}</h2>
    </div>
  )
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1 px-4 pt-12 pb-24 md:px-10 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <PageHeader
            code="01"
            channel="About"
            title={
              <>
                About <em>me</em>
              </>
            }
          />

          <section className="grid gap-10 py-16 md:grid-cols-12 md:py-24">
            <SectionTitle code="1.1">
              Enterprise <em>pragmatism</em>
            </SectionTitle>
            <div className="text-foreground/85 space-y-6 text-lg leading-relaxed md:col-span-7 md:col-start-6">
              <p>
                I design and build Side-by-Side Extensions with <strong className="text-foreground">CAP</strong>,{' '}
                <strong className="text-foreground">RAP</strong>, and <strong className="text-foreground">Fiori</strong>{' '}
                on SAP BTP. My primary focus is on <strong className="text-foreground">Clean Core</strong> compliance,
                event-driven architectures, and distinct &quot;Separation of Concerns&quot;. Increasingly, my work has
                shifted from building individual solutions to shaping the{' '}
                <strong className="text-foreground">target architecture</strong> and the{' '}
                <strong className="text-foreground">development standards</strong> the whole SAP landscape is built on.
              </p>
              <p>
                I believe in <strong className="text-foreground">Enterprise Pragmatism</strong>. Software used in large
                corporations must be robust, maintainable, and deliver measurable value. I advocate for modern
                development practices not just because they are trendy, but because they significantly reduce the Total
                Cost of Ownership (TCO) and enable sustainable innovation.
              </p>
            </div>
          </section>

          <section className="border-hairline grid gap-10 border-t py-16 md:grid-cols-12 md:py-24">
            <SectionTitle code="1.2">
              Philosophy & <em>method</em>
            </SectionTitle>
            <ol className="grid gap-px md:col-span-7 md:col-start-6 md:grid-cols-2">
              {principles.map((p, i) => (
                <li key={p.title} className="surface rounded-2xl p-6">
                  <p className="label-mono text-sodium tabular-nums">P·{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 font-serif text-2xl">{p.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{p.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-hairline grid gap-10 border-t py-16 md:grid-cols-12 md:py-24">
            <SectionTitle code="1.3">
              Community <em>signal</em>
            </SectionTitle>
            <div className="md:col-span-7 md:col-start-6">
              <p className="text-foreground/85 text-lg leading-relaxed">
                Active member of the <strong className="text-foreground">SAP Community</strong> with{' '}
                <strong className="text-foreground">249 badges</strong> earned through tutorials, contributions, and
                event participation. Regular participant in <strong className="text-foreground">Devtoberfest</strong>{' '}
                (2021-2025), achieving finalist status in 2021.
              </p>
              <dl className="border-hairline mt-10 grid grid-cols-3 border-y">
                {[
                  ['249', 'Community Badges'],
                  ['5', 'Devtoberfest Years'],
                  ['Finalist', 'Devtoberfest 2021'],
                ].map(([v, k]) => (
                  <div
                    key={k}
                    className="border-hairline border-r py-6 pr-4 last:border-r-0 [&:not(:first-child)]:pl-4"
                  >
                    <dd className="text-sodium font-serif text-4xl tabular-nums md:text-5xl">{v}</dd>
                    <dt className="label-mono text-muted-foreground mt-2">{k}</dt>
                  </div>
                ))}
              </dl>
              <ul className="mt-8 space-y-2">
                {achievements.map((a) => (
                  <li key={a} className="text-foreground/80 flex items-baseline gap-3 text-sm">
                    <span
                      className="bg-sodium/70 inline-block h-px w-3 shrink-0 translate-y-[-3px]"
                      aria-hidden="true"
                    />
                    {a}
                  </li>
                ))}
              </ul>
              <a
                href={profile.socials.community}
                target="_blank"
                rel="noopener noreferrer"
                className="label-mono text-sodium mt-6 inline-flex h-11 items-center hover:underline"
              >
                View Full Profile on SAP Community →
              </a>
            </div>
          </section>

          <section className="border-hairline grid gap-10 border-t py-16 md:grid-cols-12 md:py-24">
            <SectionTitle code="1.4">Experience</SectionTitle>
            <ol className="md:col-span-7 md:col-start-6">
              {experience.map((item) => (
                <li
                  key={item.period}
                  className="border-hairline grid gap-2 border-b py-7 first:pt-0 md:grid-cols-[10rem_1fr] md:gap-6"
                >
                  <p className="label-mono text-muted-foreground pt-1.5 tabular-nums">{item.period}</p>
                  <div>
                    <h3 className="font-serif text-2xl leading-tight">{item.role}</h3>
                    <p className="text-sodium mt-1 text-sm">{item.company}</p>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-hairline grid gap-10 border-t py-16 md:grid-cols-12 md:py-24">
            <SectionTitle code="1.5">Education</SectionTitle>
            <ol className="md:col-span-7 md:col-start-6">
              {education.map((item) => (
                <li
                  key={item.period}
                  className="border-hairline grid gap-2 border-b py-7 first:pt-0 md:grid-cols-[10rem_1fr] md:gap-6"
                >
                  <p className="label-mono text-muted-foreground pt-1.5 tabular-nums">{item.period}</p>
                  <div>
                    <h3 className="font-serif text-2xl leading-tight">{item.degree}</h3>
                    <p className="text-sodium mt-1 text-sm">{item.school}</p>
                    <p className="text-foreground/70 mt-1 text-sm italic">{item.field}</p>
                    <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
