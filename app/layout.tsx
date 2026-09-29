import type { Metadata } from 'next'
import type { Viewport } from 'next'
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { GlobalEffects } from '@/components/ui/global-effects'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { StructuredData } from '@/components/ui/structured-data'
import { cn } from '@/lib/utils'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#05070c',
  colorScheme: 'dark',
}

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
    <html lang="en" className={cn(sans.variable, serif.variable, mono.variable)}>
      <head>
        <StructuredData />
      </head>
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="label-mono bg-sodium text-primary-foreground sr-only z-[70] rounded-md px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <div className="signal-backdrop" aria-hidden="true" />
        <SmoothScroll />
        <GlobalEffects />
        <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
        <div className="signal-grain" aria-hidden="true" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
