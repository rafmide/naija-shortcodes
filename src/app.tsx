import { Hono, type MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { renderPage } from './lib/render.js'
import { securityHeaders } from './middleware/security.js'
import { requestLog, withRequestId } from './middleware/request-log.js'
import { apiRoutes } from './routes/api.js'
import { pageRoutes } from './routes/pages.js'
import { seoRoutes } from './routes/seo.js'
import type { AppEnv } from './types.js'
import { Layout } from './views/layout.js'
import { NotFoundPage, ServerErrorPage } from './views/pages/errors.js'

export interface AppDeps {
  now?: () => Date
  /** Local dev only: serves public/. On Vercel the CDN does this, so production passes nothing. */
  staticFiles?: MiddlewareHandler
}

export const createApp = (deps: AppDeps = {}): Hono<AppEnv> => {
  const now = deps.now ?? (() => new Date())
  const app = new Hono<AppEnv>()

  // Order matters: id first so every log line has it, security headers wrap everything.
  app.use('*', withRequestId, async (c, next) => {
    c.set('now', now)
    await next()
  })
  app.use('*', requestLog(), securityHeaders())
  if (deps.staticFiles) app.use('*', deps.staticFiles)

  app.route('/', seoRoutes())
  app.route('/api', apiRoutes())
  app.route('/', pageRoutes())

  app.notFound((c) => {
    if (c.req.path.startsWith('/api/')) return c.json({ error: 'not_found' }, 404)
    return renderPage(
      c,
      <Layout title="Not found" path={c.req.path} noindex>
        <NotFoundPage />
      </Layout>,
      404,
    )
  })

  app.onError((error, c) => {
    // Deliberate client errors (CSRF 403, etc.) keep their status. Only real faults become a 500.
    if (error instanceof HTTPException && error.status < 500) return error.getResponse()
    c.get('log').error({ err: error, path: c.req.path }, 'unhandled error')
    if (c.req.path.startsWith('/api/')) return c.json({ error: 'internal_error' }, 500)
    return renderPage(
      c,
      <Layout title="Something went wrong" path="/" noindex>
        <ServerErrorPage requestId={c.get('requestId')} />
      </Layout>,
      500,
    )
  })

  return app
}
