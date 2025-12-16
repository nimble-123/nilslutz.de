'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'

import { TypewriterEffect } from '@/components/ui/typewriter-effect'

import { profile } from '@/content/profile'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative mx-auto max-w-5xl py-20 md:py-32">
      {/* Background Gradient */}
      <div className="from-primary/20 via-background to-background absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] opacity-50 blur-3xl dark:opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-6xl">
          {profile.name}
          <span className="text-muted-foreground mt-4 block text-xl font-normal md:text-2xl">{profile.role}</span>
        </h1>

        <TypewriterEffect
          className="text-foreground/80 max-w-2xl text-xl leading-relaxed md:text-2xl"
          segments={[
            { text: 'I build ' },
            {
              text: 'Clean-Core compliant',
              className: 'text-primary font-medium',
            },
            { text: ' Side-by-Side Extensions with ' },
            { text: 'BTP/CAP/RAP/Fiori', className: 'font-medium' },
            { text: ' – robust, documented, and operable.' },
          ]}
        />

        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/work"
            className={cn(
              'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none'
            )}
          >
            {profile.ctas.primary}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

          <Link
            href="/contact"
            className={cn(
              'border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none'
            )}
          >
            {profile.ctas.secondary}
            <Mail className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
