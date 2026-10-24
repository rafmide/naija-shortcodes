/**
 * Vercel entrypoint. Vercel looks for a default-exported Hono app in `src/index.ts` and
 * serves everything in `public/` from its CDN, so `serveStatic` is deliberately absent here.
 * See `src/dev.ts` for the local server that does serve `public/`.
 */
import type { Hono } from 'hono'
import { createApp } from './app.js'
import type { AppEnv } from './types.js'

const app: Hono<AppEnv> = createApp()

export default app
