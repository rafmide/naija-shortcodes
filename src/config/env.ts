import { z } from 'zod'

/** Some dashboards pass empty strings for unset values. Treat them as unset. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional())

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  SITE_URL: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.url().default('https://naija-shortcodes.vercel.app'),
  ),
  VERCEL_GIT_COMMIT_SHA: optional(z.string()),
})

export type Env = z.infer<typeof envSchema>

export const parseEnv = (source: Record<string, string | undefined>): Env => {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid environment: ${problems}`)
  }
  return result.data
}

let cached: Env | undefined

/** Parsed once per process. Throws on a malformed environment so the deploy fails loudly. */
export const getEnv = (): Env => {
  cached ??= parseEnv(process.env)
  return cached
}

export const resetEnvForTests = (): void => {
  cached = undefined
}
