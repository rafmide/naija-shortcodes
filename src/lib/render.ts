import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

/**
 * Hono's `c.html` does not add a doctype for JSX. Without one browsers fall into quirks mode,
 * so every full page goes through here. HTMX fragments use plain `c.html`.
 */
export const renderPage = (
  c: Context,
  node: { toString(): string },
  status: StatusCode = 200,
): Response => c.html(`<!DOCTYPE html>${node.toString()}`, status as 200)
