import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { GlobalEffects } from '@/components/ui/global-effects'
import { StructuredData } from '@/components/ui/structured-data'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { cn } from '@/lib/utils'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f7f5' },
    { media: '(prefers-color-scheme: dark)', color: '#08080a' },
  ],
}

/**
 * Runs before first paint: when motion is allowed, hide the hero intro so the one orchestrated
 * page load can draw the line from a point. Falls back to the static presentation if the WebGL
 * story never reports in.
 */
const lineBootScript = `(function(){try{var d=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.line='static';return}d.dataset.line='pending';setTimeout(function(){if(d.dataset.line==='pending')d.dataset.line='static'},4000)}catch(e){}})()`

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
    <html lang="en" suppressHydrationWarning className={cn(geist.variable, geistMono.variable)}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: lineBootScript }} />
        <StructuredData />
      </head>
      <body
        className={cn('bg-background text-foreground min-h-screen font-sans text-[0.875rem] leading-[1.6] antialiased')}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SmoothScroll />
          {/* Global Effects (Konami easter egg) */}
          <GlobalEffects />
          <div className="relative flex min-h-screen flex-col">{children}</div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
