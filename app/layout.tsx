import type { Metadata } from 'next'
import { Anybody, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { GlobalEffects } from '@/components/ui/global-effects'
import { StructuredData } from '@/components/ui/structured-data'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { GridOverlay } from '@/components/ui/grid-overlay'
import { cn } from '@/lib/utils'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

// One variable grotesk across weights AND widths (wdth 50-150, wght 100-900)
const anybody = Anybody({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-anybody',
  axes: ['wdth'],
  display: 'swap',
})

// Mono for small labels, indices and code
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nilslutz.de'),
  title: {
    default: 'Nils Lutz - SAP Solution Architect & Lead Developer',
    template: '%s | Nils Lutz',
  },
  description:
    'SAP Solution Architect specializing in Clean Core architecture, Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP. Expert in event-driven architectures and enterprise integration patterns.',
  keywords: [
    'SAP BTP',
    'SAP CAP',
    'SAP RAP',
    'SAP Fiori',
    'Clean Core',
    'Side-by-Side Extensions',
    'SAP Solution Architect',
    'SAP HANA Cloud',
    'Cloud Foundry',
    'Event-Driven Architecture',
    'Enterprise Architecture',
    'SAP UI5',
    'TypeScript',
    'Node.js',
  ],
  authors: [{ name: 'Nils Lutz', url: 'https://nilslutz.de' }],
  creator: 'Nils Lutz',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nilslutz.de',
    siteName: 'Nils Lutz - SAP Solution Architect',
    title: 'Nils Lutz - SAP Solution Architect & Lead Developer',
    description:
      'SAP Solution Architect specializing in Clean Core architecture, Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nils Lutz - SAP Solution Architect',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nils Lutz - SAP Solution Architect',
    description:
      'SAP Solution Architect specializing in Clean Core architecture, Side-by-Side Extensions with CAP, RAP, and Fiori.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code', // Add after Google Search Console setup
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(anybody.variable, jetbrains.variable)}>
      <head>
        <StructuredData />
      </head>
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="label bg-signal text-ink fixed top-2 left-2 z-[100] -translate-y-24 px-3 py-2 focus-visible:translate-y-0"
          >
            Skip to content
          </a>
          <SmoothScroll />
          {/* Visible grid-thinking: the 12-column poster grid behind everything */}
          <GridOverlay />
          {/* Global Effects (Matrix Easter Egg) */}
          <GlobalEffects />
          <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
