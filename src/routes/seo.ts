import { Hono } from 'hono'
import { getEnv } from '../config/env.js'
import { latestCheckedAt, providers } from '../data/index.js'
import type { AppEnv } from '../types.js'

export const seoRoutes = (): Hono<AppEnv> => {
  const app = new Hono<AppEnv>()
  const origin = (): string => getEnv().SITE_URL.replace(/\/$/, '')

  app.get('/robots.txt', (c) =>
    c.text(
      `User-agent: *\nAllow: /\nDisallow: /directory/results\n\nSitemap: ${origin()}/sitemap.xml\n`,
      200,
      {
        'Cache-Control': 'public, max-age=0, s-maxage=86400',
      },
    ),
  )

  app.get('/sitemap.xml', (c) => {
    const lastmod = latestCheckedAt()
    const paths = ['/', '/directory', '/about', ...providers.map((p) => `/p/${p.id}`)]
    const urls = paths
      .map((p) => `  <url><loc>${origin()}${p}</loc><lastmod>${lastmod}</lastmod></url>`)
      .join('\n')
    return c.body(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      200,
      {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=86400',
      },
    )
  })

  app.get('/health', (c) =>
    c.json({ status: 'ok', providers: providers.length }, 200, { 'Cache-Control': 'no-store' }),
  )

  return app
}
