'use client'

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { motion } from 'framer-motion'

// Note: Metadata export doesn't work with 'use client', use layout.tsx or page metadata wrapper
// For SEO purposes, consider extracting animations to a separate client component

// Timeline data
const experience = [
  {
    role: 'Lead Software Engineer',
    company: 'Netze BW GmbH',
    period: 'Dec 2024 - Present',
    description: 'Focus on SAP S/4HANA and SAP BTP architectures. Leading the Clean Core initiative.',
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

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl space-y-16">
          {/* Profile Section */}
          <section className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">About Me</h1>
            <div className="prose dark:prose-invert prose-p:text-muted-foreground prose-strong:text-foreground max-w-none text-lg leading-relaxed">
              <p>
                I design and build Side-by-Side Extensions with <strong>CAP</strong>, <strong>RAP</strong>, and{' '}
                <strong>Fiori</strong> on SAP BTP. My primary focus is on <strong>Clean Core</strong> compliance,
                event-driven architectures, and distinct &quot;Separation of Concerns&quot;.
              </p>

              <br></br>

              <p>
                I believe in <strong>Enterprise Pragmatism</strong>. Software used in large corporations must be robust,
                maintainable, and deliver measurable value. I advocate for modern development practices not just because
                they are trendy, but because they significantly reduce the Total Cost of Ownership (TCO) and enable
                sustainable innovation.
              </p>
            </div>
          </section>

          {/* Community Engagement Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Community Engagement</h2>
            <div className="prose dark:prose-invert prose-p:text-muted-foreground prose-strong:text-foreground max-w-none text-lg leading-relaxed">
              <p>
                Active member of the <strong>SAP Community</strong> with <strong>249 badges</strong> earned through
                tutorials, contributions, and event participation. Regular participant in <strong>Devtoberfest</strong>{' '}
                (2021-2025), achieving finalist status in 2021.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="text-primary text-3xl font-bold">249</div>
                <div className="text-muted-foreground mt-2 text-sm font-medium">Community Badges</div>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="text-primary text-3xl font-bold">5</div>
                <div className="text-muted-foreground mt-2 text-sm font-medium">Devtoberfest Years</div>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="text-primary text-3xl font-bold">Finalist</div>
                <div className="text-muted-foreground mt-2 text-sm font-medium">Devtoberfest 2021</div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-4 font-semibold">Key Achievements</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>✅ SAP Community Fan 2022</li>
                <li>✅ Open Documentation Initiative Contributor</li>
                <li>✅ SAP Community Code Challenge Participant</li>
                <li>✅ Coffee Corner Connoisseur</li>
                <li>✅ Multiple SAP TechEd Attendee (2020-2022)</li>
              </ul>
              <a
                href="https://community.sap.com/t5/user/viewprofilepage/user-id/73"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary mt-4 inline-block text-sm font-medium hover:underline"
              >
                View Full Profile on SAP Community →
              </a>
            </div>
          </section>

          {/* Philosophy Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Philosophy & Methodology</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-2 font-semibold">Docs as Code</h3>
                <p className="text-muted-foreground text-sm">
                  Documentation lives with the code. I use arc42-light and ADRs to capture architectural decisions where
                  they happen.
                </p>
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-2 font-semibold">Clean Core</h3>
                <p className="text-muted-foreground text-sm">
                  Strict separation of standard and custom code. Extensions run Side-by-Side on BTP or via released APIs
                  on-stack.
                </p>
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-2 font-semibold">Automated Quality Gates</h3>
                <p className="text-muted-foreground text-sm">
                  CI/CD pipelines are mandatory. Static code analysis (ESLint, ABAP Test Cockpit) ensures consistent
                  quality.
                </p>
              </div>
              <div className="glass-card rounded-xl p-6">
                <h3 className="mb-2 font-semibold">User Centricity</h3>
                <p className="text-muted-foreground text-sm">
                  Fiori Guidelines are there for a reason. Consistent UX reduces training costs and increases adoption.
                </p>
              </div>
            </div>
          </section>

          {/* Experience Section */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Experience</h2>
            <div className="border-primary/20 relative ml-3 space-y-12 border-l">
              {experience.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative ml-8"
                >
                  <span className="border-background bg-primary absolute top-1 -left-[41px] h-5 w-5 rounded-full border-4" />
                  <div className="glass-card rounded-xl p-6 transition-colors hover:bg-white/5">
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-primary text-lg font-bold">{item.role}</h3>
                      <span className="text-muted-foreground bg-secondary/50 rounded px-2 py-1 font-mono text-sm">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-md text-foreground mb-2 font-semibold">{item.company}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight">Education</h2>
            <div className="border-primary/20 relative ml-3 space-y-12 border-l">
              {education.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative ml-8"
                >
                  <span className="border-background bg-primary absolute top-1 -left-[41px] h-5 w-5 rounded-full border-4" />
                  <div className="glass-card rounded-xl p-6 transition-colors hover:bg-white/5">
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-primary text-lg font-bold">{item.devgree}</h3>
                      <span className="text-muted-foreground bg-secondary/50 rounded px-2 py-1 font-mono text-sm">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-md text-foreground mb-1 font-semibold">{item.school}</p>
                    <p className="text-foreground/80 mb-2 text-sm italic">{item.field}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
