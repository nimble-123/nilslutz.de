export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Nils Lutz',
    url: 'https://nilslutz.de',
    jobTitle: 'SAP Solution Architect & Lead Developer',
    description:
      'SAP Solution Architect specializing in Clean Core architecture, Side-by-Side Extensions with CAP, RAP, and Fiori on SAP BTP.',
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
      'Side-by-Side Extensions',
      'SAP HANA Cloud',
      'Cloud Foundry',
      'Event-Driven Architecture',
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
