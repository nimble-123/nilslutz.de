import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader, PageShell } from '@/components/ui/page-header'
import { wavePath } from '@/components/specialized/tide/wave-path'

export { metadata } from './metadata'

// Timeline data
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
    devgree: 'Master of Science (M.Sc.)',
    field: 'Business Informatics',
    school: 'Carl von Ossietzky University Oldenburg',
    period: '2015 - 2018',
    description: 'Focus on Workflow Management and Business Intelligence.',
  },
  {
    devgree: 'Bachelor of Science (B.Sc.)',
    field: 'Business Informatics',
    school: 'Jade University of Applied Sciences',
    period: '2011 - 2015',
    description: 'Thesis on SAP UI5 prototyping and efficient UI object usage.',
  },
]

const stats = [
  { value: '249', label: 'Community Badges' },
  { value: '5', label: 'Devtoberfest Years' },
  { value: 'Finalist', label: 'Devtoberfest 2021' },
]

const achievements = [
  'SAP Community Fan 2022',
  'Open Documentation Initiative Contributor',
  'SAP Community Code Challenge Participant',
  'Coffee Corner Connoisseur',
  'Multiple SAP TechEd Attendee (2020-2022)',
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

function SectionTitle({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div className="col-span-12 lg:col-span-3">
      <p className="eyebrow text-oxide tabular-nums">{no}</p>
      <h2 className="opsz-headline mt-2 text-[1.75rem] leading-[1.05] tracking-[-0.02em] md:text-[2rem]">{children}</h2>
    </div>
  )
}

function Timeline({
  items,
}: {
  items: Array<{ title: string; org: string; period: string; description: string; field?: string }>
}) {
  return (
    <ol className="col-span-12 lg:col-span-9">
      {items.map((item, i) => (
        <li key={`${item.title}-${item.period}`} className="relative pb-10 last:pb-0">
          <div className="grid grid-cols-12 gap-x-6 gap-y-2">
            <span className="text-muted-foreground col-span-12 font-mono text-xs tabular-nums md:col-span-3">
              {item.period}
            </span>
            <div className="col-span-12 md:col-span-9">
              <h3 className="opsz-headline text-[1.35rem] leading-tight tracking-[-0.01em]">{item.title}</h3>
              <p className="eyebrow text-foreground/75 mt-1.5">{item.org}</p>
              {item.field && <p className="text-muted-foreground mt-1 italic">{item.field}</p>}
              <p className="text-muted-foreground mt-3 max-w-2xl leading-snug">{item.description}</p>
            </div>
          </div>
          <svg aria-hidden="true" viewBox="0 0 1000 24" preserveAspectRatio="none" className="mt-8 h-4 w-full">
            <path
              d={wavePath(i + 3, 24, 10)}
              fill="none"
              className="stroke-foreground/20"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </li>
      ))}
    </ol>
  )
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader eyebrow="About · Nils Lutz" title="About Me" />

        <section className="grid grid-cols-12 gap-x-6 gap-y-6 py-14 md:py-20">
          <div className="col-span-12 lg:col-span-9 lg:col-start-4">
            <p className="opsz-headline text-[1.45rem] leading-[1.25] tracking-[-0.01em] md:text-[2rem] md:leading-[1.18]">
              I design and build Side-by-Side Extensions with <strong className="font-medium">CAP</strong>,{' '}
              <strong className="font-medium">RAP</strong>, and <strong className="font-medium">Fiori</strong> on SAP
              BTP. My primary focus is on <strong className="font-medium">Clean Core</strong> compliance, event-driven
              architectures, and distinct &quot;Separation of Concerns&quot;. Increasingly, my work has shifted from
              building individual solutions to shaping the <strong className="font-medium">target architecture</strong>{' '}
              and the <strong className="font-medium">development standards</strong> the whole SAP landscape is built
              on.
            </p>
            <p className="text-muted-foreground mt-8 max-w-3xl text-lg leading-relaxed">
              I believe in <strong className="text-foreground font-medium">Enterprise Pragmatism</strong>. Software used
              in large corporations must be robust, maintainable, and deliver measurable value. I advocate for modern
              development practices not just because they are trendy, but because they significantly reduce the Total
              Cost of Ownership (TCO) and enable sustainable innovation.
            </p>
          </div>
        </section>

        <section className="border-border grid grid-cols-12 gap-x-6 gap-y-8 border-t py-14 md:py-20">
          <SectionTitle no="01">Community Engagement</SectionTitle>
          <div className="col-span-12 lg:col-span-9">
            <p className="max-w-3xl text-lg leading-relaxed">
              Active member of the <strong className="font-medium">SAP Community</strong> with{' '}
              <strong className="font-medium">249 badges</strong> earned through tutorials, contributions, and event
              participation. Regular participant in <strong className="font-medium">Devtoberfest</strong> (2021-2025),
              achieving finalist status in 2021.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((s) => (
                <li key={s.label} className="bg-card shadow-border rounded-2xl p-6">
                  <p className="opsz-display text-oxide text-[2.75rem] leading-none font-light tracking-[-0.03em] tabular-nums">
                    {s.value}
                  </p>
                  <p className="eyebrow text-muted-foreground mt-3">{s.label}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <h3 className="eyebrow text-muted-foreground">Key Achievements</h3>
              <ul className="mt-3">
                {achievements.map((a) => (
                  <li key={a} className="border-border flex items-baseline gap-3 border-b py-3 text-[1.05rem]">
                    <span aria-hidden="true" className="bg-oxide size-1.5 shrink-0 translate-y-[-2px] rotate-45" />
                    {a}
                  </li>
                ))}
              </ul>
              <a
                href="https://community.sap.com/t5/user/viewprofilepage/user-id/73"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-oxide mt-5 inline-flex h-10 items-center font-mono text-[0.8125rem] transition-colors duration-150"
              >
                View Full Profile on SAP Community →
              </a>
            </div>
          </div>
        </section>

        <section className="border-border grid grid-cols-12 gap-x-6 gap-y-8 border-t py-14 md:py-20">
          <SectionTitle no="02">Philosophy &amp; Methodology</SectionTitle>
          <div className="col-span-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-9">
            {principles.map((p) => (
              <div key={p.title} className="bg-card shadow-border rounded-2xl p-6">
                <h3 className="opsz-headline text-xl tracking-[-0.01em]">{p.title}</h3>
                <p className="text-muted-foreground mt-2 leading-snug">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-border grid grid-cols-12 gap-x-6 gap-y-8 border-t py-14 md:py-20">
          <SectionTitle no="03">Experience</SectionTitle>
          <Timeline
            items={experience.map((e) => ({
              title: e.role,
              org: e.company,
              period: e.period,
              description: e.description,
            }))}
          />
        </section>

        <section className="border-border grid grid-cols-12 gap-x-6 gap-y-8 border-t py-14 md:py-20">
          <SectionTitle no="04">Education</SectionTitle>
          <Timeline
            items={education.map((e) => ({
              title: e.devgree,
              org: e.school,
              field: e.field,
              period: e.period,
              description: e.description,
            }))}
          />
        </section>
      </PageShell>
      <Footer />
    </>
  )
}
