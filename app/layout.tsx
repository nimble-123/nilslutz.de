import type { Metadata, Viewport } from 'next'
import { Alegreya_Sans, Cormorant } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { GlobalEffects } from '@/components/ui/global-effects'
import { StructuredData } from '@/components/ui/structured-data'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { cn } from '@/lib/utils'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const display = Cormorant({
  subsets: ['latin'],
  variable: '--font-display-face',
  style: ['normal', 'italic'],
  display: 'swap',
})

const text = Alegreya_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-text',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ebe5da' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
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
    <html lang="en" suppressHydrationWarning className={cn(display.variable, text.variable)}>
      <head>
        {/* Marks JS as available so the one orchestrated intro can start from hidden (CSS reveals it anyway after 4s). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <StructuredData />
      </head>
      <body className="bg-background text-foreground min-h-screen font-sans text-[17px] leading-relaxed">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SmoothScroll />
          <GlobalEffects />
          <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
