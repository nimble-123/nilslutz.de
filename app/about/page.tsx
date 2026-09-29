import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
import { metadata as aboutMetadata } from './metadata'

export const metadata = aboutMetadata

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

function SectionHead({ index, title, id }: { index: string; title: string; id: string }) {
  return (
    <div className="grid-poster items-end gap-y-3 pb-5 shadow-[0_2px_0_var(--foreground)]">
      <p className="label col-span-4 md:col-span-3">
        <span className="text-signal">({index})</span>
      </p>
      <h2
        id={id}
        className="col-span-4 text-[clamp(2rem,4.6vw,4.4rem)] leading-[0.92] font-black tracking-[-0.02em] uppercase [font-stretch:125%] md:col-span-9"
      >
        {title}
      </h2>
    </div>
  )
}

function Timeline({
  rows,
}: {
  rows: { key: string; period: string; title: string; subtitle: string; detail?: string; description: string }[]
}) {
  return (
    <ol>
      {rows.map((row) => (
        <li key={row.key} className="grid-poster gap-y-2 py-6 shadow-[0_1px_0_var(--rule)] md:py-8">
          <p className="label text-muted-foreground col-span-4 md:col-span-3">{row.period}</p>
          <div className="col-span-4 md:col-span-4">
            <h3 className="text-xl leading-tight font-extrabold [font-stretch:112.5%]">{row.title}</h3>
            <p className="text-signal mt-1 text-sm font-bold">{row.subtitle}</p>
            {row.detail && <p className="text-muted-foreground mt-1 text-sm">{row.detail}</p>}
          </div>
          <p className="text-muted-foreground col-span-4 text-[0.95rem] leading-snug md:col-span-5">
            {row.description}
          </p>
        </li>
      ))}
    </ol>
  )
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <PageHeader index="01" label="About" title="About Me" aside="SAP Solution Architect" />

        <div className="shell space-y-24 md:space-y-32">
          {/* Profile */}
          <section aria-label="Profile" className="grid-poster gap-y-6">
            <p className="col-span-4 text-[clamp(1.4rem,2.6vw,2.4rem)] leading-[1.15] font-semibold tracking-[-0.01em] md:col-span-8">
              I design and build Side-by-Side Extensions with <strong className="font-black">CAP</strong>,{' '}
              <strong className="font-black">RAP</strong>, and <strong className="font-black">Fiori</strong> on SAP BTP.
              My primary focus is on <strong className="text-signal font-black">Clean Core</strong> compliance,
              event-driven architectures, and distinct &quot;Separation of Concerns&quot;. Increasingly, my work has
              shifted from building individual solutions to shaping the{' '}
              <strong className="font-black">target architecture</strong> and the{' '}
              <strong className="font-black">development standards</strong> the whole SAP landscape is built on.
            </p>
            <p className="text-muted-foreground col-span-4 max-w-[52ch] text-lg leading-relaxed md:col-span-5 md:col-start-8">
              I believe in <strong className="text-foreground">Enterprise Pragmatism</strong>. Software used in large
              corporations must be robust, maintainable, and deliver measurable value. I advocate for modern development
              practices not just because they are trendy, but because they significantly reduce the Total Cost of
              Ownership (TCO) and enable sustainable innovation.
            </p>
          </section>

          {/* Community */}
          <section aria-labelledby="community" className="space-y-10">
            <SectionHead id="community" index="A" title="Community Engagement" />
            <div className="grid-poster gap-y-10">
              <p className="col-span-4 max-w-[52ch] text-lg leading-relaxed md:col-span-5">
                Active member of the <strong>SAP Community</strong> with <strong>249 badges</strong> earned through
                tutorials, contributions, and event participation. Regular participant in <strong>Devtoberfest</strong>{' '}
                (2021-2025), achieving finalist status in 2021.
              </p>
              <dl className="col-span-4 grid grid-cols-3 gap-4 md:col-span-7">
                {[
                  { value: '249', label: 'Community Badges' },
                  { value: '5', label: 'Devtoberfest Years' },
                  { value: 'Finalist', label: 'Devtoberfest 2021' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col-reverse justify-end gap-2 pt-3 shadow-[0_-2px_0_var(--foreground)]"
                  >
                    <dt className="label text-muted-foreground">{stat.label}</dt>
                    <dd className="text-signal text-[clamp(1.6rem,4.4vw,4.4rem)] leading-none font-black [font-stretch:87.5%] tabular-nums">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="col-span-4 md:col-span-7 md:col-start-6">
                <h3 className="label text-muted-foreground mb-3">Key Achievements</h3>
                <ul>
                  {achievements.map((a) => (
                    <li key={a} className="flex items-center gap-3 py-2.5 font-semibold shadow-[0_1px_0_var(--rule)]">
                      <span className="bg-signal size-2 shrink-0" aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://community.sap.com/t5/user/viewprofilepage/user-id/73"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press bg-foreground text-background hover:bg-signal hover:text-ink mt-6 inline-flex h-11 items-center px-4 text-xs font-bold tracking-wide uppercase"
                >
                  View Full Profile on SAP Community →
                </a>
              </div>
            </div>
          </section>

          {/* Philosophy */}
          <section aria-labelledby="philosophy" className="space-y-10">
            <SectionHead id="philosophy" index="B" title="Philosophy & Methodology" />
            <div className="grid grid-cols-1 gap-px bg-[var(--rule)] shadow-[0_0_0_1px_var(--rule)] md:grid-cols-2">
              {principles.map((p, i) => (
                <div key={p.title} className="bg-background flex min-h-56 flex-col justify-between gap-8 p-6 md:p-8">
                  <span className="label text-signal">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-[clamp(1.6rem,3vw,2.6rem)] leading-none font-black uppercase [font-stretch:125%]">
                      {p.title}
                    </h3>
                    <p className="text-muted-foreground mt-4 max-w-[46ch] leading-snug">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Experience */}
          <section aria-labelledby="experience" className="space-y-2">
            <SectionHead id="experience" index="C" title="Experience" />
            <Timeline
              rows={experience.map((e) => ({
                key: `${e.company}-${e.period}`,
                period: e.period,
                title: e.role,
                subtitle: e.company,
                description: e.description,
              }))}
            />
          </section>

          {/* Education */}
          <section aria-labelledby="education" className="space-y-2">
            <SectionHead id="education" index="D" title="Education" />
            <Timeline
              rows={education.map((e) => ({
                key: e.school,
                period: e.period,
                title: e.devgree,
                subtitle: e.school,
                detail: e.field,
                description: e.description,
              }))}
            />
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
