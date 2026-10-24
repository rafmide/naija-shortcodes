import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/create-app.js'

const ORIGIN = 'http://localhost'

describe('pages', () => {
  const app = createApp()

  it.each(['/', '/directory', '/directory?q=gtb', '/p/gtbank', '/p/mobile-networks', '/about'])(
    'GET %s renders a full HTML document with a doctype',
    async (path) => {
      const res = await app.request(`${ORIGIN}${path}`)
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toContain('text/html')
      const html = await res.text()
      expect(html.startsWith('<!DOCTYPE html>')).toBe(true)
      expect(html).toContain('<title>')
      expect(html).toContain('rel="canonical"')
    },
  )

  it('serves the designed 404 page for unknown pages and unknown providers', async () => {
    for (const path of ['/nope', '/p/does-not-exist']) {
      const res = await app.request(`${ORIGIN}${path}`)
      expect(res.status).toBe(404)
      const html = await res.text()
      expect(html).toContain('isn&#39;t in the directory')
      expect(html).toContain('noindex')
    }
  })

  it('escapes hostile search input instead of reflecting it', async () => {
    const payload = '"><script>alert(1)</script>'
    const res = await app.request(`${ORIGIN}/directory?q=${encodeURIComponent(payload)}`)
    const html = await res.text()
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(res.status).toBe(200)
  })

  it('keeps every dial link well-formed (# is percent-encoded)', async () => {
    const html = await (await app.request(`${ORIGIN}/p/gtbank`)).text()
    expect(html).toContain('href="tel:*737%23"')
    expect(html).not.toMatch(/href="tel:[^"]*#/)
  })

  it('never renders a Dial or Copy button for a code that needs a PIN', async () => {
    const html = await (await app.request(`${ORIGIN}/p/mobile-networks`)).text()
    const row = html.split('data-template="*311*{pin}#"')[1]?.split('</li>')[0] ?? ''
    expect(row).not.toContain('data-copy')
    expect(row).not.toContain('data-dial')
    expect(row).toContain('Never type a card PIN into any website')
  })

  it('flags entries not rechecked in over 90 days', async () => {
    const future = createApp({ now: () => new Date('2027-03-01T00:00:00Z') })
    const html = await (await future.request(`${ORIGIN}/p/gtbank`)).text()
    expect(html).toContain('badge-warn')
    expect(html).toContain('over 90 days')
    const fresh = await (await app.request(`${ORIGIN}/p/gtbank`)).text()
    expect(fresh).not.toContain('badge-warn')
  })
})

describe('static assets', () => {
  const app = createApp()

  it('every local script, stylesheet, icon and font a page references exists in public/', async () => {
    for (const path of ['/', '/directory', '/p/gtbank', '/about']) {
      const html = await (await app.request(`${ORIGIN}${path}`)).text()
      const refs = [...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)]
        .map((m) => m[1] ?? '')
        .map((ref) => ref.split('?')[0] ?? '')
        .filter((ref) => /\.(js|css|svg|png|woff2)$/.test(ref))
      expect(refs.length, path).toBeGreaterThan(3)
      for (const ref of refs) {
        expect(existsSync(join(process.cwd(), 'public', ref)), `${path} -> ${ref}`).toBe(true)
      }
    }
  })
})

describe('directory fragment (htmx)', () => {
  const app = createApp()

  it('returns a fragment, not a document, and pushes the canonical page URL', async () => {
    const res = await app.request(`${ORIGIN}/directory/results?q=gtb&category=bank`)
    const html = await res.text()
    expect(html.startsWith('<!DOCTYPE')).toBe(false)
    expect(html).toContain('GTBank')
    expect(res.headers.get('hx-push-url')).toBe('/directory?q=gtb&category=bank')
    expect(res.headers.get('x-robots-tag')).toBe('noindex')
  })

  it('does not push a URL for the embedded landing preview', async () => {
    const res = await app.request(`${ORIGIN}/directory/results?limit=8&featured=1`)
    expect(res.headers.get('hx-push-url')).toBeNull()
  })

  it('shows a helpful empty state', async () => {
    const html = await (await app.request(`${ORIGIN}/directory/results?q=zzzzzz`)).text()
    expect(html).toContain('Nothing matches')
  })
})

describe('JSON API', () => {
  const app = createApp()

  it('ranks nicknames and returns sources and staleness', async () => {
    const res = await app.request(`${ORIGIN}/api/search?q=gtb`)
    expect(res.status).toBe(200)
    expect(res.headers.get('access-control-allow-origin')).toBe('*')
    const body = (await res.json()) as {
      count: number
      results: { id: string; codes: { stale: boolean; sources: unknown[] }[] }[]
    }
    expect(body.results[0]?.id).toBe('gtbank')
    expect(body.results[0]?.codes[0]?.stale).toBe(false)
    expect(body.results[0]?.codes[0]?.sources.length).toBeGreaterThan(0)
  })

  it('rejects invalid queries with a structured 400', async () => {
    const res = await app.request(`${ORIGIN}/api/search?limit=999`)
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string; issues: { path: string }[] }
    expect(body.error).toBe('invalid_request')
    expect(body.issues[0]?.path).toBe('limit')
  })

  it('returns one provider, or a JSON 404', async () => {
    expect((await app.request(`${ORIGIN}/api/providers/opay`)).status).toBe(200)
    const missing = await app.request(`${ORIGIN}/api/providers/nope`)
    expect(missing.status).toBe(404)
    expect(missing.headers.get('content-type')).toContain('application/json')
  })

  it('publishes an OpenAPI 3.1 document covering every route', async () => {
    const doc = (await (await app.request(`${ORIGIN}/api/openapi.json`)).json()) as {
      openapi: string
      servers: { url: string }[]
      paths: Record<string, unknown>
    }
    expect(doc.openapi).toBe('3.1.0')
    // Paths are relative to the /api server, so Swagger "Try it out" calls the right URL.
    expect(doc.servers[0]?.url).toBe('/api')
    expect(Object.keys(doc.paths).sort()).toEqual(['/providers', '/providers/{id}', '/search'])
  })

  it('serves Swagger UI with its own relaxed CSP, and only there', async () => {
    const docs = await app.request(`${ORIGIN}/api/docs`)
    expect(docs.status).toBe(200)
    expect(docs.headers.get('content-security-policy')).toContain('cdn.jsdelivr.net')
    const home = await app.request(`${ORIGIN}/`)
    expect(home.headers.get('content-security-policy')).not.toContain('jsdelivr')
  })
})

describe('security headers and meta routes', () => {
  const app = createApp()

  it('sets a strict CSP and friends on pages and errors alike', async () => {
    for (const path of ['/', '/nope', '/api/search?limit=999']) {
      const res = await app.request(`${ORIGIN}${path}`)
      const csp = res.headers.get('content-security-policy') ?? ''
      expect(csp, path).toContain("script-src 'self'")
      expect(csp, path).toContain("frame-ancestors 'none'")
      expect(res.headers.get('x-content-type-options'), path).toBe('nosniff')
      expect(res.headers.get('referrer-policy'), path).toBe('strict-origin-when-cross-origin')
      expect(res.headers.get('strict-transport-security'), path).toContain('max-age=')
    }
  })

  it('has no inline scripts anywhere (script-src is strictly self)', async () => {
    for (const path of ['/', '/directory', '/p/gtbank', '/about']) {
      const html = await (await app.request(`${ORIGIN}${path}`)).text()
      const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>/g)]
      expect(inline, path).toHaveLength(0)
    }
  })

  it('serves robots, sitemap and health', async () => {
    expect(await (await app.request(`${ORIGIN}/robots.txt`)).text()).toContain('Sitemap:')
    const sitemap = await (await app.request(`${ORIGIN}/sitemap.xml`)).text()
    expect(sitemap).toContain('/p/gtbank')
    expect(sitemap).not.toContain('/directory/results')
    expect(
      ((await (await app.request(`${ORIGIN}/health`)).json()) as { status: string }).status,
    ).toBe('ok')
  })

  it('caches pages at the CDN', async () => {
    const page = await app.request(`${ORIGIN}/about`)
    expect(page.headers.get('cache-control')).toContain('s-maxage=300')
  })
})
