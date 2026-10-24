import { z } from 'zod'

export const CATEGORIES = ['bank', 'fintech', 'network', 'government'] as const
export const ACTIONS = [
  'menu',
  'balance',
  'airtime',
  'data',
  'transfer',
  'identity',
  'support',
  'other',
] as const

/** `official` = published by the regulator or operator. `corroborated` = 2+ independent sources agree. */
export const VERIFICATION_LEVELS = ['official', 'corroborated'] as const

/** A star-hash USSD string (placeholders in braces) or a plain 3 to 4 digit short number. */
const CODE_PATTERN = /^(\*[0-9]+(\*([0-9]+|\{[a-z]+\}))*#|[0-9]{3,4})$/

export const sourceSchema = z.object({
  label: z.string().min(2),
  url: z.url().refine((u) => u.startsWith('https://'), 'sources must use https'),
})

export const codeSchema = z.object({
  action: z.enum(ACTIONS),
  label: z.string().min(3).max(80),
  code: z.string().regex(CODE_PATTERN, 'invalid USSD code format'),
  note: z.string().max(240).optional(),
  verification: z.enum(VERIFICATION_LEVELS),
  /** Date the entry was last cross-checked against its sources (YYYY-MM-DD). */
  checkedAt: z.iso.date(),
  sources: z.array(sourceSchema).min(1),
})

export const providerSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(2).max(60),
  category: z.enum(CATEGORIES),
  aliases: z.array(z.string().min(2)).default([]),
  note: z.string().max(280).optional(),
  codes: z.array(codeSchema).min(1),
})

export const directorySchema = z
  .array(providerSchema)
  .min(1)
  .superRefine((providers, ctx) => {
    const ids = new Set<string>()
    for (const [i, provider] of providers.entries()) {
      if (ids.has(provider.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate provider id "${provider.id}"`,
          path: [i, 'id'],
        })
      }
      ids.add(provider.id)
      const seen = new Set<string>()
      for (const [j, entry] of provider.codes.entries()) {
        const key = `${entry.action}:${entry.code}`
        if (seen.has(key)) {
          ctx.addIssue({
            code: 'custom',
            message: `duplicate code ${entry.code} (${entry.action}) in "${provider.id}"`,
            path: [i, 'codes', j],
          })
        }
        seen.add(key)
      }
    }
  })

export type Category = (typeof CATEGORIES)[number]
export type Action = (typeof ACTIONS)[number]
export type Source = z.infer<typeof sourceSchema>
export type UssdCode = z.infer<typeof codeSchema>
export type Provider = z.infer<typeof providerSchema>
