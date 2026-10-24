import type { FC, PropsWithChildren } from 'hono/jsx'
import { getEnv } from '../config/env.js'
import { site } from '../config/site.js'
import { asset } from '../lib/assets.js'
import { VENDOR } from '../lib/vendor.js'
import { Footer } from './components/footer.js'
import { Header } from './components/header.js'

export interface LayoutProps {
  title: string
  description?: string
  path: string
  /** Load GSAP + ScrollTrigger and the landing-page choreography. */
  animated?: boolean
  noindex?: boolean
}

const HTMX_CONFIG = JSON.stringify({
  allowEval: false,
  allowScriptTags: false,
  selfRequestsOnly: true,
  includeIndicatorStyles: false,
  historyCacheSize: 0,
  refreshOnHistoryMiss: true,
  defaultSettleDelay: 0,
  // htmx ignores 4xx/5xx by default. The form returns 422/429/503 fragments that must be shown.
  responseHandling: [
    { code: '204', swap: false },
    { code: '[23]..', swap: true },
    { code: '422', swap: true },
    { code: '429', swap: true },
    { code: '503', swap: true },
    { code: '[45]..', swap: false, error: true },
  ],
})

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  title,
  description = site.description,
  path,
  animated = false,
  noindex = false,
  children,
}) => {
  const origin = getEnv().SITE_URL.replace(/\/$/, '')
  const fullTitle = path === '/' ? `${site.name}: ${site.tagline}` : `${title} · ${site.name}`
  const url = `${origin}${path}`

  return (
    <html lang="en" class="no-js">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light" />
        {noindex ? <meta name="robots" content="noindex" /> : null}
        <link rel="canonical" href={url} />
        <meta property="og:site_name" content={site.name} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:locale" content={site.locale} />
        <meta property="og:image" content={`${origin}/og.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="htmx-config" content={HTMX_CONFIG} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
        />
        <link rel="stylesheet" href={asset('/css/app.css')} />
        <script src={asset('/js/boot.js')}></script>
        <script src={VENDOR.htmx} defer></script>
        {animated ? <script src={VENDOR.gsap} defer></script> : null}
        {animated ? <script src={VENDOR.scrollTrigger} defer></script> : null}
        <script src={asset('/js/app.js')} defer></script>
        <script src={asset('/js/copy.js')} defer></script>
        {animated ? <script src={asset('/js/home.js')} defer></script> : null}
      </head>
      <body>
        <a class="skip-link" href="#main">
          Skip to content
        </a>
        <Header path={path} />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
