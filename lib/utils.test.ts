import { describe, it, expect } from 'vitest'
import { cn, stripLeadingTitle } from '@/lib/utils'

describe('cn', () => {
  it('joins multiple class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b')
  })

  it('resolves conditional (clsx) objects', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })

  it('merges conflicting Tailwind utilities (last wins)', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('keeps non-conflicting Tailwind utilities', () => {
    expect(cn('text-sm font-bold', 'text-foreground')).toBe('text-sm font-bold text-foreground')
  })
})

describe('stripLeadingTitle', () => {
  it('drops a leading level-1 heading', () => {
    expect(stripLeadingTitle('\n# Title\n\nBody')).toBe('\nBody')
  })

  it('keeps content that does not start with a level-1 heading', () => {
    expect(stripLeadingTitle('Intro\n# Later')).toBe('Intro\n# Later')
    expect(stripLeadingTitle('## Section\nBody')).toBe('## Section\nBody')
  })
})
