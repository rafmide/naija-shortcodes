/**
 * Vercel entrypoint. `pnpm build` compiles this to `dist/index.js`, which Vercel uses as the
 * function entrypoint (see `vercel.json`). Vercel serves everything in `public/` from its CDN,
 * so `serveStatic` is deliberately absent here. See `src/dev.ts` for the local server.
 *
 * The value import of Hono is intentional: Vercel's Hono builder only recognizes compiled
 * entrypoints that import the package.
 */
import { Hono } from 'hono'
import { createApp } from './create-app.js'
import type { AppEnv } from './types.js'

const app: Hono<AppEnv> = createApp()

export { Hono }
export default app
