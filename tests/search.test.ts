import { describe, expect, it } from 'vitest'
import { providers } from '../src/data/index.js'
import { normalize, search, withinDistance } from '../src/lib/search.js'

const top = (q: string, opts?: Parameters<typeof search>[2]): string | undefined =>
  search(providers, q, opts)[0]?.provider.id

describe('search ranking', () => {
  it('resolves nicknames, brand names and full names to the same provider', () => {
    for (const q of ['gtb', 'GTBank', 'gtco', 'guaranty trust', 'Guaranty Trust Bank']) {
      expect(top(q), q).toBe('gtbank')
    }
  })

  it('finds a provider from its code, with or without the star and hash', () => {
    for (const q of ['737', '*737#', '*737']) expect(top(q), q).toBe('gtbank')
    expect(top('*901#')).toBe('access-bank')
  })

  it('tolerates a typo in a long enough word', () => {
    expect(top('zenth')).toBe('zenith-bank')
    expect(top('guarantee trust')).toBe('gtbank')
    expect(top('palmpya')).toBe('palmpay')
  })

  it('maps every network name to the shared harmonised entry', () => {
    for (const q of ['mtn', 'airtel', 'glo', '9mobile', 't2', 'etisalat']) {
      expect(top(q), q).toBe('mobile-networks')
    }
  })

  it('finds government services by what people call them', () => {
    expect(top('bvn')).toBe('nibss-bvn')
    expect(top('nin')).toBe('nimc-nin')
  })

  it('matches on what a code does, not only on who owns it', () => {
    const ids = search(providers, 'airtime').map((h) => h.provider.id)
    expect(ids).toContain('gtbank')
    expect(ids).toContain('mobile-networks')
  })

  it('requires every token to match (AND semantics)', () => {
    expect(search(providers, 'gtbank zenith')).toHaveLength(0)
  })

  it('returns everything alphabetically for an empty query', () => {
    const hits = search(providers, '   ')
    expect(hits).toHaveLength(providers.length)
    const names = hits.map((h) => h.provider.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('honours category and limit', () => {
    const fintech = search(providers, '', { category: 'fintech' })
    expect(fintech.length).toBeGreaterThan(0)
    expect(fintech.every((h) => h.provider.category === 'fintech')).toBe(true)
    expect(search(providers, '', { limit: 3 })).toHaveLength(3)
    expect(top('gtb', { category: 'fintech' })).toBeUndefined()
  })

  it('returns nothing for gibberish and never throws on hostile input', () => {
    expect(search(providers, 'qzxqzxqzx')).toHaveLength(0)
    expect(() => search(providers, '<script>alert(1)</script>'.repeat(10))).not.toThrow()
    expect(() => search(providers, '(((*+?[')).not.toThrow()
  })

  it('ranks an exact name above a partial match', () => {
    const hits = search(providers, 'access')
    expect(hits[0]?.provider.id).toBe('access-bank')
  })
})

describe('helpers', () => {
  it('normalizes accents, case and punctuation', () => {
    expect(normalize('  *737#  ')).toBe('737')
    expect(normalize('Café  Bank!')).toBe('cafe bank')
  })

  it('withinDistance respects its budget', () => {
    expect(withinDistance('zenith', 'zenth', 1)).toBe(true)
    expect(withinDistance('zenith', 'zen', 1)).toBe(false)
    expect(withinDistance('abc', 'abc', 0)).toBe(true)
  })
})
