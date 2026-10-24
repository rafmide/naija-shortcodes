import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { createApp } from './app.js'
import { getEnv } from './config/env.js'
import { logger } from './lib/logger.js'

// Local only. In production Vercel serves public/ from the CDN and ignores serveStatic.
const app = createApp({ staticFiles: serveStatic({ root: './public' }) })

const { PORT } = getEnv()
serve({ fetch: app.fetch, port: PORT }, (info) => {
  logger.info(`naija-shortcodes listening on http://localhost:${info.port}`)
})
