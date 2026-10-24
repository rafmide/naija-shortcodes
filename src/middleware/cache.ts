import type { MiddlewareHandler } from 'hono'

/**
 * Content is static between deploys, so let the CDN hold pages briefly and revalidate in the
 * background. Responses that already set Cache-Control (errors) are left alone.
 */
export const publicCache =
  (sMaxAgeSeconds = 300): MiddlewareHandler =>
  async (c, next) => {
    await next()
    if (c.req.method !== 'GET' || c.res.status !== 200 || c.res.headers.has('Cache-Control')) return
    c.header(
      'Cache-Control',
      `public, max-age=0, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=3600`,
    )
  }
