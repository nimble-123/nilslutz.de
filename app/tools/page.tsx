import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
import { metadata as toolsMetadata } from './metadata'

export const metadata = toolsMetadata

const categories = [
  {
    title: 'Hardware',
    items: [
      {
        name: 'Mac Mini 2024 (M4)',
        description: '16 GB RAM, 256 GB SSD - compact power for CAP/RAP development',
      },
      {
        name: 'Gigabyte M32U',
        description: '32" 4K Monitor - maximum workspace for code & debugging',
      },
      {
        name: 'Dell U2715H',
        description: '27" 1440p - secondary monitor for documentation & testing',
      },
      {
        name: 'Keychron K3 Pro (QWERTZ Mac)',
        description: 'Low-profile mechanical for extended coding sessions',
      },
      {
        name: 'Logitech G502 (Wired)',
        description: 'Precision & programmable buttons',
      },
      {
        name: 'Apple AirPods 3rd Gen',
        description: 'Wireless audio for meetings & focus time',
      },
    ],
  },
  {
    title: 'Development Environment',
    items: [
      {
        name: 'VS Code / BAS / Eclipse',
        description: 'Multi-IDE setup: VS Code (CAP), BAS (Cloud), Eclipse (ABAP/ADT)',
      },
      {
        name: 'Warp Terminal',
        description: 'Modern terminal with Starship prompt, Zsh & auto-suggestions',
      },
      {
        name: 'Starship Prompt',
        description: 'Custom config with Git status, Node version & time display',
      },
      {
        name: 'Git + GitHub CLI',
        description: 'Version control & CI/CD integration',
      },
      {
        name: 'Docker Desktop',
        description: 'Containerized services & local SAP HANA',
      },
      {
        name: 'Terraform',
        description: 'Infrastructure as Code for BTP landscapes',
      },
    ],
  },
  {
    title: 'Editor Extensions',
    items: [
      {
        name: 'SAP CDS Language Support',
        description: 'Syntax highlighting & IntelliSense for CDS (VS Code/BAS)',
      },
      {
        name: 'SAP Fiori Tools',
        description: 'Application generator, guided development, XML toolkit',
      },
      {
        name: 'ESLint + Prettier',
        description: 'Code quality & formatting',
      },
      {
        name: 'GitLens',
        description: 'Git blame & history visualization',
      },
      {
        name: 'ABAP Development Tools (ADT)',
        description: 'Eclipse plugin for RAP & ABAP development',
      },
    ],
  },
  {
    title: 'SAP & Cloud Stack',
    items: [
      {
        name: 'SAP CAP',
        description: 'Backend framework for side-by-side extensions',
      },
      {
        name: 'SAP UI5 / Fiori Elements',
        description: 'Enterprise-grade frontend framework',
      },
      {
        name: 'SAP HANA Cloud',
        description: 'In-memory database for CAP persistence',
      },
      {
        name: 'SAP BTP Cloud Foundry',
        description: 'Deployment platform for side-by-side extensions',
      },
      {
        name: 'SAP Event Mesh',
        description: 'Event-driven architecture & integration',
      },
      {
        name: 'Connectivity & Destination Service',
        description: 'Secure on-premise connectivity via Cloud Connector',
      },
    ],
  },
  {
    title: 'Development Tools',
    items: [
      {
        name: 'Postman',
        description: 'API testing, documentation & collections',
      },
      {
        name: 'DBeaver',
        description: 'Universal database tool (SAP HANA, PostgreSQL, etc.)',
      },
      {
        name: 'draw.io (diagrams.net)',
        description: 'Architecture diagrams & flowcharts',
      },
      {
        name: 'Obsidian',
        description: 'Note-taking & knowledge management (docs as code)',
      },
    ],
  },
  {
    title: 'Productivity & Organization',
    items: [
      {
        name: 'Notion',
        description: 'Project management & team documentation',
      },
      {
        name: 'Obsidian',
        description: 'Personal knowledge management & Zettelkasten',
      },
      {
        name: 'Gifox',
        description: 'Lightweight GIF recording for demos & bug reports',
      },
      {
        name: 'Shottr',
        description: 'Screenshot tool with annotations & OCR',
      },
      {
        name: 'Maccy',
        description: 'Clipboard manager for macOS',
      },
    ],
  },
  {
    title: 'Tech Stack Preferences',
    items: [
      {
        name: 'TypeScript',
        description: 'Type safety is non-negotiable',
      },
      {
        name: 'Node.js (LTS)',
        description: 'Runtime for CAP backend services',
      },
      {
        name: 'npm',
        description: 'Default package manager (proven & stable)',
      },
      {
        name: 'ESLint + Husky',
        description: 'Pre-commit hooks for code quality',
      },
      {
        name: 'Jest',
        description: 'Unit & integration testing',
      },
      {
        name: 'GitHub Actions',
        description: 'CI/CD pipelines (build, test, deploy)',
      },
    ],
  },
]

export default function UsesPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <PageHeader
          index="04"
          label="Uses"
          title="What I Use"
          aside={`${categories.reduce((n, c) => n + c.items.length, 0)} entries`}
          lede="Hardware, software, and tools for SAP BTP development. Optimized for Clean Core, CAP, and Side-by-Side Extensions."
        />

        <div className="shell space-y-16 md:space-y-24">
          {categories.map((category, ci) => (
            <section key={category.title} aria-labelledby={`cat-${ci}`} className="grid-poster gap-y-6">
              <div className="col-span-4 md:col-span-4">
                <div className="md:sticky md:top-24">
                  <p className="label text-signal">{String(ci + 1).padStart(2, '0')}</p>
                  <h2
                    id={`cat-${ci}`}
                    className="mt-2 text-[clamp(1.8rem,3.2vw,3rem)] leading-[0.95] font-black tracking-[-0.015em] uppercase [font-stretch:112.5%]"
                  >
                    {category.title}
                  </h2>
                </div>
              </div>
              <ul className="col-span-4 shadow-[0_-2px_0_var(--foreground)] md:col-span-8">
                {category.items.map((item) => (
                  <li
                    key={item.name}
                    className="grid grid-cols-1 gap-1 py-4 shadow-[0_1px_0_var(--rule)] md:grid-cols-8 md:gap-6"
                  >
                    <h3 className="font-extrabold md:col-span-3">{item.name}</h3>
                    <p className="text-muted-foreground text-[0.95rem] leading-snug md:col-span-5">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="text-muted-foreground max-w-[60ch] pt-4 leading-relaxed">
            <strong className="text-foreground">Note:</strong> This list reflects my personal preferences. I update it
            occasionally when my setup changes.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
