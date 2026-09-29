import { ArrowUpRight } from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
import { WallText } from '@/components/ui/wall-text'
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

const achievements = [
  'SAP Community Fan 2022',
  'Open Documentation Initiative Contributor',
  'SAP Community Code Challenge Participant',
  'Coffee Corner Connoisseur',
  'Multiple SAP TechEd Attendee (2020-2022)',
]

const philosophy = [
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

const stats = [
  { value: '249', label: 'Community Badges' },
  { value: '5', label: 'Devtoberfest Years' },
  { value: 'Finalist', label: 'Devtoberfest 2021' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="label-caps text-muted-foreground flex items-center gap-3">
      <span className="bg-brass inline-block h-px w-8" aria-hidden="true" />
      {children}
    </h2>
  )
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 pt-32 md:px-8 md:pt-44">
        <div className="mx-auto max-w-[88rem] space-y-32 md:space-y-44">
          <div className="grid gap-12 lg:grid-cols-12">
            <PageHeader className="lg:col-span-6" room="Room 01 — Biography" title="About Me" />
            <p className="text-foreground/85 text-lg leading-relaxed lg:col-span-6 lg:pt-16 lg:text-xl">
              I design and build Side-by-Side Extensions with <strong>CAP</strong>, <strong>RAP</strong>, and{' '}
              <strong>Fiori</strong> on SAP BTP. My primary focus is on <strong>Clean Core</strong> compliance,
              event-driven architectures, and distinct &quot;Separation of Concerns&quot;. Increasingly, my work has
              shifted from building individual solutions to shaping the <strong>target architecture</strong> and the{' '}
              <strong>development standards</strong> the whole SAP landscape is built on.
            </p>
          </div>

          <section className="space-y-10">
            <SectionLabel>Enterprise Pragmatism</SectionLabel>
            <WallText className="font-display max-w-5xl text-[clamp(1.9rem,4vw,3.6rem)] leading-[1.1] font-light">
              I believe in <em>Enterprise Pragmatism.</em> Software used in large corporations must be robust,
              maintainable, and deliver measurable value.
            </WallText>
            <p className="text-muted-foreground max-w-2xl text-lg">
              I advocate for modern development practices not just because they are trendy, but because they
              significantly reduce the Total Cost of Ownership (TCO) and enable sustainable innovation.
            </p>
          </section>

          <section className="space-y-12">
            <SectionLabel>Philosophy &amp; Methodology</SectionLabel>
            <dl className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {philosophy.map((pr, i) => (
                <div key={pr.title} className="border-border border-t pt-5">
                  <dt className="flex items-baseline gap-3">
                    <span className="label-caps text-muted-foreground">{['i', 'ii', 'iii', 'iv'][i]}.</span>
                    <span className="font-display text-2xl">{pr.title}</span>
                  </dt>
                  <dd className="text-muted-foreground mt-3 text-[0.98rem]">{pr.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="grid gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <SectionLabel>Community Engagement</SectionLabel>
              <p className="text-foreground/85 text-lg">
                Active member of the <strong>SAP Community</strong> with <strong>249 badges</strong> earned through
                tutorials, contributions, and event participation. Regular participant in <strong>Devtoberfest</strong>{' '}
                (2021-2025), achieving finalist status in 2021.
              </p>
              <a
                href="https://community.sap.com/t5/user/viewprofilepage/user-id/73"
                target="_blank"
                rel="noopener noreferrer"
                className="label-caps text-brass-ink group inline-flex h-11 items-center gap-2"
              >
                View Full Profile on SAP Community
                <ArrowUpRight
                  className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </a>
            </div>
            <div className="lg:col-span-7">
              <dl className="grid grid-cols-3 gap-3 md:gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="bg-card/70 shadow-border flex flex-col-reverse rounded-lg p-4 md:p-5">
                    <dt className="label-caps text-muted-foreground mt-3">{s.label}</dt>
                    <dd className="font-display text-[clamp(1.6rem,4vw,3.4rem)] leading-none font-light tabular-nums">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8">
                <h3 className="label-caps text-muted-foreground">Key Achievements</h3>
                <ul className="mt-3">
                  {achievements.map((a) => (
                    <li key={a} className="border-border flex items-center gap-4 border-b py-3">
                      <span className="bg-brass size-1 shrink-0 rounded-full" aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-10">
            <SectionLabel>Experience</SectionLabel>
            <ol className="border-border border-t">
              {experience.map((item) => (
                <li
                  key={`${item.company}-${item.period}`}
                  className="border-border grid gap-x-8 gap-y-2 border-b py-8 md:grid-cols-12"
                >
                  <p className="label-caps text-muted-foreground pt-2 tabular-nums md:col-span-3">{item.period}</p>
                  <div className="md:col-span-4">
                    <h3 className="font-display text-[1.8rem] leading-tight">{item.role}</h3>
                    <p className="text-muted-foreground italic">{item.company}</p>
                  </div>
                  <p className="text-foreground/80 md:col-span-5 md:pt-2">{item.description}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-10">
            <SectionLabel>Education</SectionLabel>
            <ol className="border-border border-t">
              {education.map((item) => (
                <li key={item.school} className="border-border grid gap-x-8 gap-y-2 border-b py-8 md:grid-cols-12">
                  <p className="label-caps text-muted-foreground pt-2 tabular-nums md:col-span-3">{item.period}</p>
                  <div className="md:col-span-4">
                    <h3 className="font-display text-[1.8rem] leading-tight">{item.degree}</h3>
                    <p className="text-muted-foreground italic">{item.field}</p>
                  </div>
                  <div className="md:col-span-5 md:pt-2">
                    <p className="text-foreground">{item.school}</p>
                    <p className="text-foreground/80">{item.description}</p>
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
