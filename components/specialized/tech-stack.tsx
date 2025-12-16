export function TechStack() {
  const stack = [
    'Next.js',
    'TypeScript',
    'Tailwind CSS', // Frontend
    'SAP CAP',
    'SAP RAP',
    'Node.js', // Backend
    'SAP BTP',
    'SAP HANA',
    'Event Mesh', // Platform
    'OData v4',
    'Fiori Elements',
    'Docker', // Tech
  ]

  return (
    <section className="border-t py-12">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-12">
        <h3 className="text-muted-foreground text-sm font-semibold tracking-wider whitespace-nowrap uppercase">
          Tech Stack
        </h3>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {stack.map((tech) => (
            <span
              key={tech}
              className="text-foreground/80 hover:text-primary cursor-default text-lg font-medium transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
