import type { Category, Provider } from '../data/schema.js'

export interface SearchOptions {
  category?: Category | undefined
  limit?: number | undefined
}

export interface SearchHit {
  provider: Provider
  score: number
}

/** Lowercase, strip accents and punctuation. `*` and `#` are dropped so "*737#" and "737" compare equal. */
export const normalize = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** Edit distance with an early exit once it exceeds `max`. Used for typo tolerance only. */
export const withinDistance = (a: string, b: string, max: number): boolean => {
  if (Math.abs(a.length - b.length) > max) return false
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const value = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost)
      row.push(value)
      rowMin = Math.min(rowMin, value)
    }
    if (rowMin > max) return false
    prev = row
  }
  return (prev[b.length] ?? Number.POSITIVE_INFINITY) <= max
}

const typoBudget = (length: number): number => (length >= 7 ? 2 : length >= 4 ? 1 : 0)

interface Index {
  /** Full names and aliases, normalized. */
  names: string[]
  /** Individual words from names and aliases. */
  words: string[]
  /** First digit group of every code, e.g. "737". */
  prefixes: Set<string>
  /** Every digit run in every code. */
  digits: string[]
  /** Words from code labels, e.g. "airtime". */
  labels: string[]
  category: string
}

const indexCache = new WeakMap<Provider, Index>()

const indexOf = (provider: Provider): Index => {
  const cached = indexCache.get(provider)
  if (cached) return cached
  const names = [provider.name, ...provider.aliases].map(normalize)
  const built: Index = {
    names,
    words: [...new Set(names.flatMap((n) => n.split(' ')))],
    prefixes: new Set(
      provider.codes.map((c) => c.code.replace(/\D/g, ' ').trim().split(' ')[0] ?? ''),
    ),
    digits: provider.codes.flatMap((c) => c.code.split(/\D+/).filter(Boolean)),
    labels: [
      ...new Set(provider.codes.flatMap((c) => normalize(`${c.label} ${c.action}`).split(' '))),
    ],
    category: provider.category,
  }
  indexCache.set(provider, built)
  return built
}

const scoreToken = (token: string, index: Index): number => {
  if (/^\d+$/.test(token)) {
    if (index.prefixes.has(token)) return 90
    if (index.digits.includes(token)) return 60
    if (index.digits.some((d) => d.startsWith(token))) return 40
    return 0
  }
  let best = 0
  for (const word of index.words) {
    if (word === token) best = Math.max(best, 85)
    else if (word.startsWith(token)) best = Math.max(best, 70)
    else if (token.length >= 3 && word.includes(token)) best = Math.max(best, 45)
    else if (token.length >= 4 && withinDistance(word, token, typoBudget(token.length)))
      best = Math.max(best, 35)
  }
  for (const label of index.labels) {
    if (label === token) best = Math.max(best, 30)
    else if (token.length >= 3 && label.startsWith(token)) best = Math.max(best, 22)
  }
  if (index.category.startsWith(token) && token.length >= 3) best = Math.max(best, 20)
  return best
}

/**
 * Ranks providers for a free-text query.
 * Every token must match something (AND semantics); an exact full-name or alias match wins outright.
 * Pure and synchronous: 22 providers do not need an index service.
 */
export const search = (
  providers: readonly Provider[],
  query: string,
  { category, limit }: SearchOptions = {},
): SearchHit[] => {
  const pool = category ? providers.filter((p) => p.category === category) : [...providers]
  const normalized = normalize(query)
  const byName = (a: SearchHit, b: SearchHit): number =>
    a.provider.name.localeCompare(b.provider.name)

  if (normalized === '') {
    const all = pool.map((provider) => ({ provider, score: 0 })).sort(byName)
    return limit ? all.slice(0, limit) : all
  }

  const tokens = normalized.split(' ')
  const hits: SearchHit[] = []
  for (const provider of pool) {
    const index = indexOf(provider)
    const scores = tokens.map((t) => scoreToken(t, index))
    if (scores.some((s) => s === 0)) continue
    let score = scores.reduce((sum, s) => sum + s, 0) / scores.length
    if (index.names.includes(normalized)) score += 100
    else if (index.names.some((n) => n.startsWith(normalized))) score += 25
    hits.push({ provider, score })
  }
  hits.sort((a, b) => b.score - a.score || byName(a, b))
  return limit ? hits.slice(0, limit) : hits
}
