import type { MiddlewareHandler } from 'hono'
import { requestId } from 'hono/request-id'
import type { Logger } from 'pino'
import { logger } from '../lib/logger.js'
import type { AppEnv } from '../types.js'

export const withRequestId = requestId()

/** One structured line per request. Health checks are skipped so they do not drown real traffic. */
export const requestLog = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const log: Logger = logger.child({ requestId: c.get('requestId') })
  c.set('log', log)
  const started = performance.now()
  await next()
  if (c.req.path === '/health') return
  log.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round(performance.now() - started),
    },
    'request',
  )
}
