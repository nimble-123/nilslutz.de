import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { PageHeader } from '@/components/ui/page-header'
import { Laptop, Code2, Package, Cloud, Rocket, Server, Boxes } from 'lucide-react'
import { metadata as toolsMetadata } from './metadata'

export const metadata = toolsMetadata

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
      <main className="flex-1 px-4 pt-32 md:px-8 md:pt-44">
        <div className="mx-auto max-w-[88rem] space-y-24">
          <PageHeader
            room="Room 04 — Inventory"
            title="What I Use"
            lead="Hardware, software, and tools for SAP BTP development. Optimized for Clean Core, CAP, and Side-by-Side Extensions."
          />

          <div className="space-y-20">
            {categories.map((category, ci) => (
              <section key={category.title} className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <p className="label-caps text-muted-foreground flex items-center gap-3 tabular-nums">
                    <category.icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
                    Vitrine {String(ci + 1).padStart(2, '0')}
                  </p>
                  <h2 className="font-display mt-3 text-[2.2rem] leading-tight font-light">{category.title}</h2>
                </div>
                <ul className="border-border border-t lg:col-span-8">
                  {category.items.map((item) => (
                    <li
                      key={item.name}
                      className="border-border grid gap-x-8 gap-y-1 border-b py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                    >
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-muted-foreground text-[0.97rem]">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="text-muted-foreground border-brass max-w-2xl border-l pl-5 italic">
            <strong className="text-foreground not-italic">Note:</strong> This list reflects my personal preferences. I
            update it occasionally when my setup changes.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
