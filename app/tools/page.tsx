import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader, PageShell } from '@/components/ui/page-header'
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
        emoji: '💻',
      },
      {
        name: 'Gigabyte M32U',
        description: '32" 4K Monitor - maximum workspace for code & debugging',
        emoji: '🖥️',
      },
      {
        name: 'Dell U2715H',
        description: '27" 1440p - secondary monitor for documentation & testing',
        emoji: '🖥️',
      },
      {
        name: 'Keychron K3 Pro (QWERTZ Mac)',
        description: 'Low-profile mechanical for extended coding sessions',
        emoji: '⌨️',
      },
      {
        name: 'Logitech G502 (Wired)',
        description: 'Precision & programmable buttons',
        emoji: '🖱️',
      },
      {
        name: 'Apple AirPods 3rd Gen',
        description: 'Wireless audio for meetings & focus time',
        emoji: '🎧',
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
        emoji: '🆚',
      },
      {
        name: 'Warp Terminal',
        description: 'Modern terminal with Starship prompt, Zsh & auto-suggestions',
        emoji: '⚡',
      },
      {
        name: 'Starship Prompt',
        description: 'Custom config with Git status, Node version & time display',
        emoji: '🚀',
      },
      {
        name: 'Git + GitHub CLI',
        description: 'Version control & CI/CD integration',
        emoji: '🔀',
      },
      {
        name: 'Docker Desktop',
        description: 'Containerized services & local SAP HANA',
        emoji: '🐳',
      },
      {
        name: 'Terraform',
        description: 'Infrastructure as Code for BTP landscapes',
        emoji: '🏗️',
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
        emoji: '📦',
      },
      {
        name: 'SAP Fiori Tools',
        description: 'Application generator, guided development, XML toolkit',
        emoji: '🎨',
      },
      {
        name: 'ESLint + Prettier',
        description: 'Code quality & formatting',
        emoji: '✨',
      },
      {
        name: 'GitLens',
        description: 'Git blame & history visualization',
        emoji: '🔍',
      },
      {
        name: 'ABAP Development Tools (ADT)',
        description: 'Eclipse plugin for RAP & ABAP development',
        emoji: '🔧',
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
        emoji: '🚀',
      },
      {
        name: 'SAP UI5 / Fiori Elements',
        description: 'Enterprise-grade frontend framework',
        emoji: '🎭',
      },
      {
        name: 'SAP HANA Cloud',
        description: 'In-memory database for CAP persistence',
        emoji: '💾',
      },
      {
        name: 'SAP BTP Cloud Foundry',
        description: 'Deployment platform for side-by-side extensions',
        emoji: '☁️',
      },
      {
        name: 'SAP Event Mesh',
        description: 'Event-driven architecture & integration',
        emoji: '📡',
      },
      {
        name: 'Connectivity & Destination Service',
        description: 'Secure on-premise connectivity via Cloud Connector',
        emoji: '🔐',
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
        emoji: '📮',
      },
      {
        name: 'DBeaver',
        description: 'Universal database tool (SAP HANA, PostgreSQL, etc.)',
        emoji: '🗄️',
      },
      {
        name: 'draw.io (diagrams.net)',
        description: 'Architecture diagrams & flowcharts',
        emoji: '📊',
      },
      {
        name: 'Obsidian',
        description: 'Note-taking & knowledge management (docs as code)',
        emoji: '📝',
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
        emoji: '📋',
      },
      {
        name: 'Obsidian',
        description: 'Personal knowledge management & Zettelkasten',
        emoji: '🧠',
      },
      {
        name: 'Gifox',
        description: 'Lightweight GIF recording for demos & bug reports',
        emoji: '🎬',
      },
      {
        name: 'Shottr',
        description: 'Screenshot tool with annotations & OCR',
        emoji: '📸',
      },
      {
        name: 'Maccy',
        description: 'Clipboard manager for macOS',
        emoji: '📋',
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
        emoji: '🔵',
      },
      {
        name: 'Node.js (LTS)',
        description: 'Runtime for CAP backend services',
        emoji: '🟢',
      },
      {
        name: 'npm',
        description: 'Default package manager (proven & stable)',
        emoji: '📦',
      },
      {
        name: 'ESLint + Husky',
        description: 'Pre-commit hooks for code quality',
        emoji: '🐶',
      },
      {
        name: 'Jest',
        description: 'Unit & integration testing',
        emoji: '🧪',
      },
      {
        name: 'GitHub Actions',
        description: 'CI/CD pipelines (build, test, deploy)',
        emoji: '⚙️',
      },
    ],
  },
]

export default function UsesPage() {
  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          eyebrow="Tools · What I use"
          title="What I Use"
          lede="Hardware, software, and tools for SAP BTP development. Optimized for Clean Core, CAP, and Side-by-Side Extensions."
        />

        <div className="py-6 md:py-10">
          {categories.map((category, ci) => (
            <section
              key={category.title}
              aria-labelledby={`tools-${ci}`}
              className="border-border grid grid-cols-12 gap-x-6 gap-y-6 border-b py-10 last:border-b-0 md:py-14"
            >
              <div className="col-span-12 lg:col-span-3">
                <div className="flex items-center gap-3">
                  <category.icon className="text-oxide size-5" strokeWidth={1.5} aria-hidden="true" />
                  <span className="eyebrow text-muted-foreground tabular-nums">{String(ci + 1).padStart(2, '0')}</span>
                </div>
                <h2
                  id={`tools-${ci}`}
                  className="opsz-headline mt-3 text-[1.6rem] leading-[1.05] tracking-[-0.02em] md:text-[1.9rem]"
                >
                  {category.title}
                </h2>
              </div>
              <ul className="col-span-12 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:col-span-9">
                {category.items.map((item) => (
                  <li key={item.name} className="border-border border-t py-4">
                    <h3 className="text-[1.1rem] leading-tight font-medium">{item.name}</h3>
                    <p className="text-muted-foreground mt-1 text-[0.95rem] leading-snug">{item.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="text-muted-foreground border-border mb-6 border-t pt-8 font-mono text-xs leading-relaxed">
          <strong className="text-foreground font-medium">Note:</strong> This list reflects my personal preferences. I
          update it occasionally when my setup changes.
        </p>
      </PageShell>
      <Footer />
    </>
  )
}
