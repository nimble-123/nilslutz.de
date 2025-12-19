'use client'

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { motion } from 'framer-motion'
import {
  Monitor,
  Laptop,
  Keyboard,
  Mouse,
  Code2,
  Terminal,
  Package,
  Cloud,
  Headphones,
  Rocket,
  Server,
  Database,
  Boxes,
} from 'lucide-react'

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
      <main className="container mx-auto flex-1 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">What I Use</h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Hardware, software, and tools for SAP BTP development. Optimized for Clean Core, CAP, and Side-by-Side
              Extensions.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-16">
            {categories.map((category, categoryIndex) => (
              <motion.section
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <category.icon className="text-primary h-7 w-7" />
                  <h2 className="text-2xl font-bold tracking-tight">{category.title}</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: itemIndex * 0.05 }}
                      className="glass-card group rounded-xl p-6 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{item.emoji}</span>
                        <div className="flex-1 space-y-1">
                          <h3 className="leading-tight font-semibold">{item.name}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Footer Note */}
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Note:</strong> This list reflects my personal preferences. I update it
              occasionally when my setup changes.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
