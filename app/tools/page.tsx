import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { SheetHeader } from '@/components/ui/sheet-header'
import { Laptop, Code2, Package, Cloud, Rocket, Server, Boxes } from 'lucide-react'

export { metadata } from './metadata'

const categories = [
  {
    title: 'Hardware',
    icon: Laptop,
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
    icon: Code2,
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
    icon: Package,
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
    icon: Cloud,
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
    icon: Server,
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
    icon: Rocket,
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
    icon: Boxes,
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
      <main className="flex-1">
        <SheetHeader
          sheet="Sheet 05"
          kicker="Field kit · inventory"
          title="What I Use"
          lede="Hardware, software, and tools for SAP BTP development. Optimized for Clean Core, CAP, and Side-by-Side Extensions."
        />

        <div className="mx-auto max-w-[1400px] space-y-14 px-5 pt-12 md:space-y-20 md:px-8 md:pt-16">
          {categories.map((category, categoryIndex) => (
            <section
              key={category.title}
              aria-labelledby={`kit-${categoryIndex}`}
              className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8"
            >
              <div className="md:col-span-3">
                <p className="marginalia text-ochre-ink tabular-nums">
                  Case {String(categoryIndex + 1).padStart(2, '0')}
                </p>
                <h2
                  id={`kit-${categoryIndex}`}
                  className="font-display mt-1 flex items-center gap-2.5 text-2xl font-semibold tracking-[-0.02em]"
                >
                  <category.icon className="text-muted-foreground size-5" strokeWidth={1.5} aria-hidden="true" />
                  {category.title}
                </h2>
              </div>
              <ul className="border-t border-[var(--foreground)]/80 md:col-span-9">
                {category.items.map((item, itemIndex) => (
                  <li
                    key={item.name}
                    className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-[var(--rule)] py-4 md:grid-cols-[3rem_16rem_1fr]"
                  >
                    <span className="marginalia text-muted-foreground pt-1 tabular-nums">
                      {String(itemIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display font-medium tracking-[-0.01em]">{item.name}</span>
                    <span className="text-muted-foreground col-start-2 font-serif leading-snug md:col-start-auto">
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="text-muted-foreground max-w-2xl font-serif text-lg leading-snug md:ml-[25%]">
            <strong className="text-foreground font-semibold">Note:</strong> This list reflects my personal preferences.
            I update it occasionally when my setup changes.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
