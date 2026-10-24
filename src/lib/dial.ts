const PLACEHOLDER = /\{([a-z]+)\}/g

/** Placeholders a visitor may fill in on the page. `pin` and `nin` are never collected. */
export const FILLABLE = ['amount', 'phone', 'account'] as const
export type Fillable = (typeof FILLABLE)[number]

export const placeholders = (code: string): string[] =>
  [...code.matchAll(PLACEHOLDER)].map((m) => m[1] ?? '')

/** A code can be dialed straight from the page only when nothing sensitive is left to type. */
export const isFillable = (code: string): boolean =>
  placeholders(code).every((p) => (FILLABLE as readonly string[]).includes(p))

/** `tel:` URIs need `#` percent-encoded, otherwise the fragment is dropped by most dialers. */
export const toTelHref = (code: string): string => `tel:${code.replaceAll('#', '%23')}`

/** Keep digits only so a visitor can never inject `*` or `#` into a dial string. */
export const digitsOnly = (value: string): string => value.replace(/\D+/g, '')

export const fillTemplate = (code: string, values: Partial<Record<string, string>>): string =>
  code.replace(PLACEHOLDER, (whole, key: string) => {
    const filled = digitsOnly(values[key] ?? '')
    return filled === '' ? whole : filled
  })

export const hasUnfilledPlaceholders = (code: string): boolean => /\{[a-z]+\}/.test(code)
