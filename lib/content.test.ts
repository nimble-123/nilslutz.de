import { describe, it, expect } from 'vitest'
import { getCaseStudies, getCaseStudyBySlug, getNotes, getNoteBySlug } from '@/lib/content'

describe('getCaseStudies', () => {
  it('returns a non-empty list with the expected shape', async () => {
    const studies = await getCaseStudies()
    expect(studies.length).toBeGreaterThan(0)
    for (const study of studies) {
      expect(typeof study.slug).toBe('string')
      expect(study.slug.length).toBeGreaterThan(0)
      expect(typeof study.title).toBe('string')
      expect(Array.isArray(study.tags)).toBe(true)
      expect(Array.isArray(study.stack)).toBe(true)
      expect(typeof study.content).toBe('string')
    }
  })

  it('sorts featured case studies before non-featured ones', async () => {
    const studies = await getCaseStudies()
    const firstNonFeatured = studies.findIndex((s) => !s.featured)
    if (firstNonFeatured === -1) return // all featured, nothing to assert
    const afterFirstNonFeatured = studies.slice(firstNonFeatured)
    expect(afterFirstNonFeatured.every((s) => !s.featured)).toBe(true)
  })
})

describe('getCaseStudyBySlug', () => {
  it('returns the matching case study', async () => {
    const studies = await getCaseStudies()
    const target = studies[0]
    const found = await getCaseStudyBySlug(target.slug)
    expect(found?.slug).toBe(target.slug)
  })

  it('returns null for an unknown slug', async () => {
    expect(await getCaseStudyBySlug('does-not-exist-xyz')).toBeNull()
  })
})

describe('getNotes', () => {
  it('returns a non-empty list with the expected shape', async () => {
    const notes = await getNotes()
    expect(notes.length).toBeGreaterThan(0)
    for (const note of notes) {
      expect(typeof note.slug).toBe('string')
      expect(typeof note.title).toBe('string')
      expect(typeof note.date).toBe('string')
      expect(typeof note.content).toBe('string')
    }
  })

  it('sorts notes by date descending', async () => {
    const notes = await getNotes()
    for (let i = 1; i < notes.length; i++) {
      const prev = new Date(notes[i - 1].date).getTime()
      const curr = new Date(notes[i].date).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })
})

describe('getNoteBySlug', () => {
  it('returns the matching note', async () => {
    const notes = await getNotes()
    const target = notes[0]
    const found = await getNoteBySlug(target.slug)
    expect(found?.slug).toBe(target.slug)
  })

  it('returns null for an unknown slug', async () => {
    expect(await getNoteBySlug('does-not-exist-xyz')).toBeNull()
  })
})

describe('withoutDuplicateTitle', () => {
  it('drops a leading heading that repeats the title', async () => {
    const { withoutDuplicateTitle } = await import('@/lib/content')
    const body = '# Repository Pattern in SAP CAP\n\nText'
    expect(withoutDuplicateTitle(body, 'Repository Pattern in SAP CAP').trim()).toBe('Text')
  })

  it('keeps section-style openers', async () => {
    const { withoutDuplicateTitle } = await import('@/lib/content')
    const body = '# Problem\n\nText'
    expect(withoutDuplicateTitle(body, 'Event-Driven Architecture with Event Mesh')).toBe(body)
  })
})
