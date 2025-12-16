import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'

export default function ImpressumPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-12">
        <div className="prose dark:prose-invert mx-auto max-w-2xl">
          <h1>Impressum</h1>
          <p className="text-muted-foreground">[Muster-Impressum / Placeholder]</p>

          <h2>Angaben gemäß § 5 TMG</h2>
          <p>
            Nils Lutz
            <br />
            Musterstraße 123
            <br />
            12345 Musterstadt
          </p>

          <h2>Kontakt</h2>
          <p>
            E-Mail: contact@nilslutz.dev
            <br />
            Telefon: +49 123 456789
          </p>

          <h2>Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
            Gesetzen verantwortlich. (...)
          </p>

          <div className="mt-8 rounded bg-yellow-100 p-4 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            Note: This is a placeholder legal notice. Please replace with your actual legal details before deployment.
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
