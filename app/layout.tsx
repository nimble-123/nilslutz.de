import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ParticleBackground } from '@/components/ui/particle-background'
import { clsx } from 'clsx'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nils Lutz - SAP Solution Architect',
  description: 'Clean Core, Side-by-Side Extensions, SAP BTP. Portfolio of Nils Lutz.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx(
          inter.variable,
          'bg-background text-foreground min-h-screen font-sans antialiased transition-colors duration-300'
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Particle Background - Global */}
          <ParticleBackground className="fixed inset-0 z-0 h-full w-full" />
          <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
