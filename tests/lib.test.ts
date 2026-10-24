import { describe, expect, it } from 'vitest'
import {
  digitsOnly,
  fillTemplate,
  hasUnfilledPlaceholders,
  isFillable,
  placeholders,
  toTelHref,
} from '../src/lib/dial.js'
import { daysSince, isStale } from '../src/lib/staleness.js'
import { parseEnv } from '../src/config/env.js'
import { parseFinderQuery } from '../src/lib/directory.js'

describe('dial helpers', () => {
  it('percent-encodes # so dialers keep it', () => {
    expect(toTelHref('*737#')).toBe('tel:*737%23')
    expect(toTelHref('*565*0#')).toBe('tel:*565*0%23')
  })

  it('fills only digits and leaves unfilled slots in place', () => {
    expect(fillTemplate('*737*{amount}#', { amount: '5000' })).toBe('*737*5000#')
    expect(fillTemplate('*901*{amount}*{phone}#', { amount: '500' })).toBe('*901*500*{phone}#')
    expect(hasUnfilledPlaceholders('*901*500*{phone}#')).toBe(true)
    expect(hasUnfilledPlaceholders('*901*500#')).toBe(false)
  })

  it('cannot be used to inject dial-string control characters', () => {
    expect(digitsOnly('5*0#0;+')).toBe('500')
    expect(fillTemplate('*737*{amount}#', { amount: '1#*2' })).toBe('*737*12#')
    expect(fillTemplate('*737*{amount}#', { amount: '#*' })).toBe('*737*{amount}#')
  })

  it('never treats a PIN or NIN placeholder as fillable', () => {
    expect(placeholders('*311*{pin}#')).toEqual(['pin'])
    expect(isFillable('*311*{pin}#')).toBe(false)
    expect(isFillable('*737*{amount}#')).toBe(true)
    expect(isFillable('*310#')).toBe(true)
  })
})

describe('staleness', () => {
  const now = new Date('2026-10-23T12:00:00Z')
  it('counts whole days and never goes negative', () => {
    expect(daysSince('2026-10-23', now)).toBe(0)
    expect(daysSince('2026-10-13', now)).toBe(10)
    expect(daysSince('2027-01-01', now)).toBe(0)
  })
  it('flags entries after 90 days, not before', () => {
    expect(isStale('2026-07-25', now)).toBe(false) // 90 days
    expect(isStale('2026-07-24', now)).toBe(true) // 91 days
  })
  it('treats an unparseable date as stale', () => {
    expect(isStale('garbage', now)).toBe(true)
  })
})

describe('env', () => {
  it('applies defaults and treats empty strings as unset', () => {
    const env = parseEnv({ SITE_URL: '' })
    expect(env.PORT).toBe(3000)
    expect(env.SITE_URL).toBe('http://localhost:3000')
  })
  it('fails loudly on a malformed value', () => {
    expect(() => parseEnv({ SITE_URL: 'not a url' })).toThrow(/Invalid environment/)
  })
})

describe('finder query parsing', () => {
  it('falls back to defaults instead of throwing', () => {
    const q = parseFinderQuery({
      q: 'x'.repeat(500),
      category: 'bogus',
      limit: '-4',
      featured: 'maybe',
    })
    expect(q.category).toBeUndefined()
    expect(q.limit).toBeUndefined()
    expect(q.featured).toBe(false)
    expect(q.q).toBe('')
  })
  it('treats category=all as no filter and parses a valid limit', () => {
    const q = parseFinderQuery({ q: ' gtb ', category: 'all', limit: '8', featured: '1' })
    expect(q).toEqual({ q: 'gtb', category: undefined, limit: 8, featured: true })
  })
})
