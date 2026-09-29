/** The layers of the practice, top (what users touch) to bottom (what everything rests on). */
export type Stratum = {
  numeral: string
  name: string
  era: string
  depth: string
  text: string
  stack: string[]
  pattern: 'laminae' | 'stipple' | 'hatch' | 'bedrock'
}

export const strata: Stratum[] = [
  {
    numeral: 'I',
    name: 'Fiori / UI5',
    era: 'Surface',
    depth: '0 – 120 m',
    text: 'The layer people touch. SAP UI5 and Fiori Elements, built to the Fiori guidelines — they are there for a reason: consistent UX reduces training costs and increases adoption.',
    stack: ['SAP UI5', 'Fiori Elements', 'OData v4'],
    pattern: 'laminae',
  },
  {
    numeral: 'II',
    name: 'CAP / RAP',
    era: 'Application',
    depth: '120 – 340 m',
    text: 'Side-by-Side apps with CAP (Node.js / TypeScript) or RAP on-stack. Domain logic behind clear seams — repositories, commands, strategies — and automated quality gates on every change.',
    stack: ['SAP CAP', 'ABAP RAP', 'TypeScript', 'Node.js'],
    pattern: 'stipple',
  },
  {
    numeral: 'III',
    name: 'SAP BTP',
    era: 'Platform',
    depth: '340 – 610 m',
    text: 'Cloud Foundry, HANA Cloud, Destinations and Event Mesh. Systems decoupled through event-driven architecture and robust API management instead of point-to-point wiring.',
    stack: ['Cloud Foundry', 'HANA Cloud', 'Event Mesh', 'API Management'],
    pattern: 'hatch',
  },
  {
    numeral: 'IV',
    name: 'Clean Core',
    era: 'Bedrock',
    depth: '610 m +',
    text: 'Strict separation of standard and custom code. Extensions run side-by-side on BTP or via released APIs on-stack — the target architecture and development standards everything else rests on.',
    stack: ['Released APIs', 'Target Architecture', 'Dev Standards', 'ADRs'],
    pattern: 'bedrock',
  },
]
