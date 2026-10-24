import { z } from 'zod'
import { CATEGORIES, type Category, type Provider } from '../data/schema.js'
import { providers } from '../data/index.js'
import { search, type SearchHit } from './search.js'

/** Curated order for the landing-page preview. Everything else is alphabetical. */
export const FEATURED_IDS = [
  'gtbank',
  'access-bank',
  'zenith-bank',
  'uba',
  'first-bank',
  'opay',
  'mobile-networks',
  'nibss-bvn',
] as const

export interface FinderQuery {
  q: string
  category: Category | undefined
  limit: number | undefined
  featured: boolean
}

const finderSchema = z.object({
  q: z.string().trim().max(60).catch(''),
  category: z.enum(CATEGORIES).optional().catch(undefined),
  limit: z.coerce.number().int().min(1).max(50).optional().catch(undefined),
  featured: z
    .string()
    .optional()
    .transform((v) => v === '1')
    .catch(false),
})

/** Never throws: malformed or hostile query strings fall back to defaults. */
export const parseFinderQuery = (raw: Record<string, string | undefined>): FinderQuery => {
  const parsed = finderSchema.parse({
    q: raw['q'] ?? '',
    category: raw['category'] === 'all' ? undefined : raw['category'],
    limit: raw['limit'],
    featured: raw['featured'],
  })
  return {
    q: parsed.q,
    category: parsed.category,
    limit: parsed.limit,
    featured: parsed.featured,
  }
}

const featuredOrder = (list: readonly Provider[]): SearchHit[] => {
  const rank = new Map<string, number>(FEATURED_IDS.map((id, i) => [id, i]))
  return list
    .filter((p) => rank.has(p.id))
    .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
    .map((provider) => ({ provider, score: 0 }))
}

export const listProviders = ({ q, category, limit, featured }: FinderQuery): SearchHit[] => {
  if (featured && q === '' && category === undefined) {
    const picked = featuredOrder(providers)
    return limit ? picked.slice(0, limit) : picked
  }
  return search(providers, q, { category, limit })
}

/** Canonical, shareable URL for a finder state. Empty values are dropped. */
export const finderUrl = ({ q, category }: Pick<FinderQuery, 'q' | 'category'>): string => {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (category) params.set('category', category)
  const qs = params.toString()
  return qs ? `/directory?${qs}` : '/directory'
}
