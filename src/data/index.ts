import { providers as raw } from './providers.js'
import { directorySchema, type Category, type Provider } from './schema.js'

/** Validated once at module load. A malformed entry crashes boot instead of reaching users. */
export const providers: readonly Provider[] = directorySchema.parse(raw)

const byId = new Map(providers.map((p) => [p.id, p]))

export const getProvider = (id: string): Provider | undefined => byId.get(id)

export const CATEGORY_LABELS: Record<Category, string> = {
  bank: 'Banks',
  fintech: 'Fintechs',
  network: 'Networks',
  government: 'Government',
}

export const categoryCounts = (): Record<Category, number> => {
  const counts: Record<Category, number> = { bank: 0, fintech: 0, network: 0, government: 0 }
  for (const p of providers) counts[p.category] += 1
  return counts
}

export const totalCodes = (): number => providers.reduce((sum, p) => sum + p.codes.length, 0)

export const latestCheckedAt = (): string =>
  providers
    .flatMap((p) => p.codes.map((c) => c.checkedAt))
    .sort()
    .at(-1) ?? ''

export type { Category, Provider, UssdCode } from './schema.js'
