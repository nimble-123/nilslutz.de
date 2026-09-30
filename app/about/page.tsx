import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader, pageMain } from '@/components/ui/page-header'

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

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid-line border-foreground gap-y-6 border-t pt-4 pb-20 md:pb-28">
      <h2 className="label col-span-2 md:col-span-1">{label}</h2>
      <div className="col-span-2 md:col-span-3">{children}</div>
    </section>
  )
}

function Rows({ items }: { items: { period: string; title: string; sub: string; text: string }[] }) {
  return (
    <ol>
      {items.map((item) => (
        <li
          key={item.title + item.period}
          className="border-border grid grid-cols-1 gap-y-1 border-b py-5 first:pt-0 md:grid-cols-3 md:gap-x-8"
        >
          <p className="label pt-0.5 tabular-nums">{item.period}</p>
          <div className="md:col-span-2">
            <h3 className="text-[0.9375rem] leading-snug">{item.title}</h3>
            <p className="text-muted-foreground">{item.sub}</p>
            <p className="mt-2 max-w-[36rem]">{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className={pageMain}>
        <PageHeader label="About" title="About Me" />

        <Section label="Profile">
          <div className="max-w-[38rem] space-y-5 text-[1rem] leading-[1.75] md:text-[1.0625rem]">
            <p>
              I design and build Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP. My primary focus is on
              Clean Core compliance, event-driven architectures, and distinct &quot;Separation of Concerns&quot;.
              Increasingly, my work has shifted from building individual solutions to shaping the target architecture
              and the development standards the whole SAP landscape is built on.
            </p>
            <p>
              I believe in Enterprise Pragmatism. Software used in large corporations must be robust, maintainable, and
              deliver measurable value. I advocate for modern development practices not just because they are trendy,
              but because they significantly reduce the Total Cost of Ownership (TCO) and enable sustainable innovation.
            </p>
          </div>
        </Section>

        <Section label="Philosophy & Methodology">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title}>
                <dt className="text-[0.9375rem]">{p.title}</dt>
                <dd className="text-muted-foreground mt-1.5 max-w-[26rem]">{p.text}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section label="Experience">
          <Rows
            items={experience.map((e) => ({ period: e.period, title: e.role, sub: e.company, text: e.description }))}
          />
        </Section>

        <Section label="Education">
          <Rows
            items={education.map((e) => ({
              period: e.period,
              title: e.devgree,
              sub: `${e.school} · ${e.field}`,
              text: e.description,
            }))}
          />
        </Section>

        <Section label="Community Engagement">
          <p className="max-w-[38rem] text-[1rem] leading-[1.75]">
            Active member of the SAP Community with 249 badges earned through tutorials, contributions, and event
            participation. Regular participant in Devtoberfest (2021-2025), achieving finalist status in 2021.
          </p>
          <dl className="border-border mt-10 grid grid-cols-3 border-t">
            {[
              { v: '249', k: 'Community Badges' },
              { v: '5', k: 'Devtoberfest Years' },
              { v: 'Finalist', k: 'Devtoberfest 2021' },
            ].map((s) => (
              <div
                key={s.k}
                className="border-border flex flex-col-reverse border-r py-4 pr-4 last:border-r-0 [&:not(:first-child)]:pl-4"
              >
                <dt className="label mt-2">{s.k}</dt>
                <dd className="text-[1.375rem] leading-none tracking-[-0.02em] tabular-nums md:text-[1.75rem]">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
          <h3 className="label mt-12">Key Achievements</h3>
          <ul className="mt-3">
            {achievements.map((a) => (
              <li key={a} className="border-border border-b py-2">
                {a}
              </li>
            ))}
          </ul>
          <a
            href="https://community.sap.com/t5/user/viewprofilepage/user-id/73"
            target="_blank"
            rel="noopener noreferrer"
            className="ink-link mt-6 inline-block text-[0.8125rem]"
          >
            View full profile on SAP Community ↗
          </a>
        </Section>
      </main>
      <Footer />
    </>
  )
}
