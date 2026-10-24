import { swaggerUI } from '@hono/swagger-ui'
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { getProvider, providers } from '../data/index.js'
import { ACTIONS, CATEGORIES, VERIFICATION_LEVELS, type Provider } from '../data/schema.js'
import { search } from '../lib/search.js'
import { isStale } from '../lib/staleness.js'
import { publicCache } from '../middleware/cache.js'
import type { AppEnv } from '../types.js'

const SourceDto = z.object({ label: z.string(), url: z.url() }).openapi('Source')

const CodeDto = z
  .object({
    action: z.enum(ACTIONS),
    label: z.string().openapi({ example: 'Buy airtime for your own number' }),
    code: z
      .string()
      .openapi({ example: '*737*{amount}#', description: 'Placeholders appear in braces.' }),
    note: z.string().optional(),
    verification: z.enum(VERIFICATION_LEVELS),
    checkedAt: z.iso.date().openapi({ example: '2026-10-23' }),
    stale: z.boolean().openapi({ description: 'True when not rechecked in over 90 days.' }),
    sources: z.array(SourceDto),
  })
  .openapi('Code')

const ProviderDto = z
  .object({
    id: z.string().openapi({ example: 'gtbank' }),
    name: z.string().openapi({ example: 'GTBank' }),
    category: z.enum(CATEGORIES),
    aliases: z.array(z.string()),
    note: z.string().optional(),
    codes: z.array(CodeDto),
  })
  .openapi('Provider')

const ErrorDto = z
  .object({
    error: z.string(),
    issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
  })
  .openapi('Error')

const toDto = (p: Provider, now: Date): z.infer<typeof ProviderDto> => ({
  id: p.id,
  name: p.name,
  category: p.category,
  aliases: p.aliases,
  ...(p.note ? { note: p.note } : {}),
  codes: p.codes.map((c) => ({
    action: c.action,
    label: c.label,
    code: c.code,
    ...(c.note ? { note: c.note } : {}),
    verification: c.verification,
    checkedAt: c.checkedAt,
    stale: isStale(c.checkedAt, now),
    sources: c.sources,
  })),
})

const searchRoute = createRoute({
  method: 'get',
  path: '/search',
  summary: 'Search providers',
  description:
    'Ranks providers by name, nickname ("gtb"), code ("737") and what the code does. Tolerates small typos.',
  tags: ['Directory'],
  request: {
    query: z.object({
      q: z.string().trim().max(60).optional().openapi({ example: 'gtb' }),
      category: z.enum(CATEGORIES).optional(),
      limit: z.coerce.number().int().min(1).max(50).optional().openapi({ example: 10 }),
    }),
  },
  responses: {
    200: {
      description: 'Ranked matches',
      content: {
        'application/json': {
          schema: z.object({
            query: z.string(),
            count: z.number().int(),
            results: z.array(ProviderDto),
          }),
        },
      },
    },
    400: { description: 'Invalid query', content: { 'application/json': { schema: ErrorDto } } },
  },
})

const listRoute = createRoute({
  method: 'get',
  path: '/providers',
  summary: 'List all providers',
  tags: ['Directory'],
  request: { query: z.object({ category: z.enum(CATEGORIES).optional() }) },
  responses: {
    200: {
      description: 'Every provider, alphabetical',
      content: {
        'application/json': {
          schema: z.object({ count: z.number().int(), results: z.array(ProviderDto) }),
        },
      },
    },
    400: { description: 'Invalid query', content: { 'application/json': { schema: ErrorDto } } },
  },
})

const getRouteDef = createRoute({
  method: 'get',
  path: '/providers/{id}',
  summary: 'Get one provider',
  tags: ['Directory'],
  request: { params: z.object({ id: z.string().min(1).max(60).openapi({ example: 'gtbank' }) }) },
  responses: {
    200: { description: 'The provider', content: { 'application/json': { schema: ProviderDto } } },
    404: { description: 'Unknown provider', content: { 'application/json': { schema: ErrorDto } } },
  },
})

export const apiRoutes = (): OpenAPIHono<AppEnv> => {
  const api = new OpenAPIHono<AppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: 'invalid_request',
            issues: result.error.issues.map((i) => ({
              path: i.path.join('.'),
              message: i.message,
            })),
          },
          400,
        )
      }
      return undefined
    },
  })

  api.use('*', cors({ origin: '*', allowMethods: ['GET', 'OPTIONS'] }), publicCache(300))

  api.openapi(searchRoute, (c) => {
    const { q = '', category, limit = 20 } = c.req.valid('query')
    const now = c.get('now')()
    const hits = search(providers, q, { category, limit })
    return c.json(
      { query: q, count: hits.length, results: hits.map((h) => toDto(h.provider, now)) },
      200,
    )
  })

  api.openapi(listRoute, (c) => {
    const { category } = c.req.valid('query')
    const now = c.get('now')()
    const hits = search(providers, '', { category })
    return c.json({ count: hits.length, results: hits.map((h) => toDto(h.provider, now)) }, 200)
  })

  api.openapi(getRouteDef, (c) => {
    const provider = getProvider(c.req.valid('param').id)
    if (!provider) return c.json({ error: 'not_found' }, 404)
    return c.json(toDto(provider, c.get('now')()), 200)
  })

  api.doc31('/openapi.json', {
    openapi: '3.1.0',
    // Routes are defined relative to the /api mount, so say so or "Try it out" hits the wrong URL.
    servers: [{ url: '/api' }],
    info: {
      title: 'Naija Shortcodes API',
      version: '1.0.0',
      description:
        'Read-only, CORS-enabled JSON over the directory. Every code carries its sources, verification level and last-checked date.',
    },
    tags: [{ name: 'Directory', description: 'Providers and their USSD codes' }],
  })

  api.get('/docs', swaggerUI({ url: '/api/openapi.json' }))

  return api
}
