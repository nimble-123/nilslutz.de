import type { BundledLanguage } from 'shiki'
import cdsGrammar from './cds.tmLanguage.json'
import abapcdsGrammar from './abapcds.tmLanguage.json'

export const customLanguages = [
  {
    id: 'cds',
    scopeName: 'source.cds',
    grammar: cdsGrammar,
    aliases: ['cap', 'capcds'],
  },
  {
    id: 'abapcds',
    scopeName: 'source.abapcds',
    grammar: abapcdsGrammar,
    aliases: ['abapcds'],
  },
] as const

export type CustomLanguage = 'cds' | 'abapcds'
export type SupportedLanguage = BundledLanguage | CustomLanguage
