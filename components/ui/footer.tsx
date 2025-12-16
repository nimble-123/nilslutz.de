import { profile } from '@/content/profile'

export function Footer() {
  return (
    <footer className="glass mt-20 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">{profile.name}</h3>
            <p className="text-muted-foreground max-w-sm text-sm">
              {profile.role}. Building clean, maintainable, and robust enterprise solutions.
            </p>
          </div>

          <div className="flex flex-col space-y-4 md:items-end">
            <div className="text-muted-foreground flex gap-6 text-sm font-medium">
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                LinkedIn
              </a>
              <a href={`mailto:${profile.socials.email}`} className="hover:text-primary transition-colors">
                Email
              </a>
            </div>
            <p className="text-muted-foreground text-xs">
              &copy; {new Date().getFullYear()} Nils Lutz. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
