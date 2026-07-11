export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nils Lutz',
    url: 'https://nilslutz.de',
    jobTitle: 'SAP Solution Architect',
    description:
      'SAP Solution Architect specializing in Clean Core target architecture, development standards, and Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP.',
    worksFor: {
      '@type': 'Organization',
      name: 'Netze BW GmbH',
    },
    knowsAbout: [
      'SAP BTP',
      'SAP CAP',
      'SAP RAP',
      'SAP Fiori',
      'Clean Core Architecture',
      'Target Architecture',
      'Architecture Governance',
      'Development Standards',
      'API-First Integration',
      'Side-by-Side Extensions',
      'SAP HANA Cloud',
      'Cloud Foundry',
      'Event-Driven Architecture',
      'CloudEvents',
      'TypeScript',
      'Node.js',
    ],
    sameAs: [
      'https://github.com/nimble-123',
      'https://www.linkedin.com/in/nlsltz/',
      'https://community.sap.com/t5/user/viewprofilepage/user-id/73',
    ],
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'Carl von Ossietzky University Oldenburg',
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Jade University of Applied Sciences',
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
}
