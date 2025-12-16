import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { profile } from '@/content/profile'
import { Mail, Linkedin, Github } from 'lucide-react'

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto flex-1 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-2xl space-y-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Get in Touch</h1>
          <p className="text-muted-foreground text-xl">
            Interested in robust SAP BTP architectures or Clean Core strategies?
          </p>

          <div className="glass-card rounded-xl p-8 text-center">
            <h2 className="mb-4 text-lg font-semibold">Current Availability</h2>
            <div className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Open for Inhouse & Consulting (BTP / Architecture)
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <a
              href={`mailto:${profile.socials.email}`}
              className="glass-card group flex flex-col items-center rounded-xl p-6 transition-transform hover:scale-[1.02]"
            >
              <Mail className="text-primary mb-4 h-8 w-8 transition-transform group-hover:scale-110" />
              <span className="font-semibold">Email</span>
              <span className="text-muted-foreground text-sm">Send me a message</span>
            </a>

            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card group flex flex-col items-center rounded-xl p-6 transition-transform hover:scale-[1.02]"
            >
              <Linkedin className="mb-4 h-8 w-8 text-[#0077b5] transition-transform group-hover:scale-110" />
              <span className="font-semibold">LinkedIn</span>
              <span className="text-muted-foreground text-sm">Connect professionally</span>
            </a>

            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card group flex flex-col items-center rounded-xl p-6 transition-transform hover:scale-[1.02]"
            >
              <Github className="text-foreground mb-4 h-8 w-8 transition-transform group-hover:scale-110" />
              <span className="font-semibold">GitHub</span>
              <span className="text-muted-foreground text-sm">Check my code</span>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
