import type { MiddlewareHandler } from 'hono'

const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Inline style attributes are used for CSS custom properties and by GSAP. Scripts stay strict.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

/** Swagger UI ships its own inline bootstrap and loads assets from jsDelivr. Scoped to /api/docs only. */
const DOCS_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
  "img-src 'self' data: https://cdn.jsdelivr.net",
  "font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join('; ')

export const securityHeaders = (): MiddlewareHandler => async (c, next) => {
  await next()
  const isDocs = c.req.path === '/api/docs'
  c.header('Content-Security-Policy', isDocs ? DOCS_CSP : DEFAULT_CSP)
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Cross-Origin-Opener-Policy', 'same-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
}
