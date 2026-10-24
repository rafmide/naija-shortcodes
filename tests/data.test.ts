import { describe, expect, it } from 'vitest'
import { providers } from '../src/data/index.js'
import { directorySchema, providerSchema } from '../src/data/schema.js'

const valid = {
  id: 'example-bank',
  name: 'Example Bank',
  category: 'bank',
  aliases: ['example'],
  codes: [
    {
      action: 'menu',
      label: 'Main menu',
      code: '*123#',
      verification: 'official',
      checkedAt: '2026-10-23',
      sources: [{ label: 'Example', url: 'https://example.com/ussd' }],
    },
  ],
}

describe('directory data', () => {
  it('passes the schema', () => {
    expect(() => directorySchema.parse(providers)).not.toThrow()
  })

  it('gives every code at least one https source', () => {
    for (const p of providers) {
      for (const c of p.codes) {
        expect(c.sources.length, `${p.id} ${c.code}`).toBeGreaterThan(0)
        for (const s of c.sources) expect(s.url.startsWith('https://')).toBe(true)
      }
    }
  })

  it('never lets two providers share the same main menu code', () => {
    const menus = providers.flatMap((p) =>
      p.codes.filter((c) => c.action === 'menu').map((c) => c.code),
    )
    expect(new Set(menus).size).toBe(menus.length)
  })

  it('requires two sources for anything marked corroborated', () => {
    for (const p of providers) {
      for (const c of p.codes) {
        if (c.verification === 'corroborated' && c.sources.length < 2) {
          // Shortcuts are corroborated by exactly the two independent sources listed.
          throw new Error(`${p.id} ${c.code} is corroborated by only ${c.sources.length} source`)
        }
      }
    }
  })
})

describe('schema rejects bad contributions', () => {
  const bad = (patch: (v: typeof valid) => unknown) =>
    providerSchema.safeParse(patch(structuredClone(valid)))

  it('accepts a valid entry', () => {
    expect(providerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects malformed codes', () => {
    for (const code of [
      '73712',
      '12',
      '*737',
      '737#',
      '*abc#',
      '*737*#',
      '* 737#',
      '*737#;rm',
      'tel:*737#',
    ]) {
      const result = bad((v) => ({ ...v, codes: [{ ...v.codes[0], code }] }))
      expect(result.success, code).toBe(false)
    }
  })

  it('accepts placeholders and plain short numbers', () => {
    for (const code of ['*737*{amount}#', '*901*{amount}*{phone}#', '*389*301#', '300']) {
      const result = bad((v) => ({ ...v, codes: [{ ...v.codes[0], code }] }))
      expect(result.success, code).toBe(true)
    }
  })

  it('rejects entries without sources, or with http sources', () => {
    expect(bad((v) => ({ ...v, codes: [{ ...v.codes[0], sources: [] }] })).success).toBe(false)
    expect(
      bad((v) => ({
        ...v,
        codes: [{ ...v.codes[0], sources: [{ label: 'x', url: 'http://example.com' }] }],
      })).success,
    ).toBe(false)
  })

  it('rejects bad dates, unknown categories and bad ids', () => {
    expect(
      bad((v) => ({ ...v, codes: [{ ...v.codes[0], checkedAt: '23/10/2026' }] })).success,
    ).toBe(false)
    expect(bad((v) => ({ ...v, category: 'crypto' })).success).toBe(false)
    expect(bad((v) => ({ ...v, id: 'Not A Slug' })).success).toBe(false)
  })

  it('rejects duplicate provider ids and duplicate codes', () => {
    expect(directorySchema.safeParse([valid, valid]).success).toBe(false)
    const dupCode = { ...valid, id: 'other', codes: [valid.codes[0], valid.codes[0]] }
    expect(directorySchema.safeParse([dupCode]).success).toBe(false)
  })
})
