'use client'

import { motion } from 'framer-motion'
import { Layers, Database, Workflow } from 'lucide-react'

const services = [
  {
    title: 'Clean Core & Architecture',
    description:
      'Strategic consulting for S/4HANA transformations. Avoiding technical debt through strict Clean Core Compliance.',
    icon: Layers,
  },
  {
    title: 'SAP BTP Extensions',
    description:
      'Development of scalable Side-by-Side Apps with CAP (Node.js/Java) or RAP (Steampunk/Private Cloud). Integration via BTP Destinations.',
    icon: Database,
  },
  {
    title: 'Integration & Events',
    description:
      'Decoupling systems via Event-Driven Architecture (Event Mesh) and robust API Management (Cloud Integration/APIM).',
    icon: Workflow,
  },
]

export function Services() {
  return (
    <section className="py-12 md:py-24">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight">What I do</h2>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="glass-card group rounded-xl p-6"
          >
            <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 w-fit rounded-lg p-3 transition-colors">
              <service.icon className="text-primary h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
            <p className="text-muted-foreground">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
