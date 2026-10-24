import { Hono } from 'hono'
import { getProvider } from '../data/index.js'
import { finderUrl, listProviders, parseFinderQuery } from '../lib/directory.js'
import { renderPage } from '../lib/render.js'
import { publicCache } from '../middleware/cache.js'
import type { AppEnv } from '../types.js'
import { ProviderGrid } from '../views/components/finder.js'
import { Layout } from '../views/layout.js'
import { AboutPage } from '../views/pages/about.js'
import { DirectoryPage } from '../views/pages/directory.js'
import { HomePage } from '../views/pages/home.js'
import { ProviderPage } from '../views/pages/provider.js'

export const pageRoutes = (): Hono<AppEnv> => {
  const app = new Hono<AppEnv>()

  app.use('*', publicCache(300))

  app.get('/', (c) => {
    const hits = listProviders({ q: '', category: undefined, limit: 8, featured: true })
    return renderPage(
      c,
      <Layout title="Home" path="/" animated>
        <HomePage hits={hits} />
      </Layout>,
    )
  })

  app.get('/directory', (c) => {
    const query = parseFinderQuery(c.req.query())
    const hits = listProviders({ ...query, limit: undefined, featured: false })
    return renderPage(
      c,
      <Layout
        title={query.q ? `Search: ${query.q}` : 'Directory'}
        description="Search USSD codes for Nigerian banks, fintechs, mobile networks and government services."
        path="/directory"
        noindex={query.q !== ''}
      >
        <DirectoryPage hits={hits} q={query.q} category={query.category} />
      </Layout>,
    )
  })

  /** HTMX fragment. A dedicated route (not an HX-Request branch) keeps CDN caching and history restore safe. */
  app.get('/directory/results', (c) => {
    const query = parseFinderQuery(c.req.query())
    const hits = listProviders(query)
    c.header('X-Robots-Tag', 'noindex')
    // Push the canonical full-page URL, never the fragment URL. The embedded preview does not push.
    if (query.limit === undefined) c.header('HX-Push-Url', finderUrl(query))
    return c.html(<ProviderGrid hits={hits} q={query.q} />)
  })

  app.get('/p/:id', (c) => {
    const provider = getProvider(c.req.param('id'))
    if (!provider) return c.notFound()
    const codes = provider.codes.map((x) => x.code).join(', ')
    return renderPage(
      c,
      <Layout
        title={`${provider.name} USSD codes`}
        description={`${provider.name} USSD codes: ${codes}. Each code lists its sources and when it was last checked.`}
        path={`/p/${provider.id}`}
      >
        <ProviderPage provider={provider} now={c.get('now')()} />
      </Layout>,
    )
  })

  app.get('/about', (c) =>
    renderPage(
      c,
      <Layout
        title="How codes are verified"
        description="How Naija Shortcodes verifies USSD codes, what it leaves out, and how to contribute."
        path="/about"
      >
        <AboutPage />
      </Layout>,
    ),
  )

  return app
}
