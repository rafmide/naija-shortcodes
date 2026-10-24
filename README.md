# Naija Shortcodes

A fast, honest directory of USSD codes for Nigerian banks, fintechs, mobile networks and government services. Every code shows its sources, how trustworthy those sources are, and when it was last checked.

Built with **Hono + TypeScript + HTMX + GSAP + plain CSS**. No frontend framework, no database, no browser build step.

## Quick start

```bash
pnpm install
pnpm dev             # http://localhost:3000
```

| Script                 | What it does                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `pnpm dev`             | Local server with reload. Serves `public/` itself.           |
| `pnpm build`           | Compiles `src/` to `dist/` for the Vercel function.          |
| `pnpm check`           | Typecheck, lint, format check, data validation, tests.       |
| `pnpm test`            | Vitest (unit, data, and HTTP-contract tests).                |
| `pnpm validate:data`   | Schema check on the directory. Runs in CI and pre-commit.    |
| `pnpm check:freshness` | Fails if any entry is older than 90 days. Runs weekly in CI. |
| `pnpm vendor`          | Re-copies htmx and GSAP from `node_modules`.                 |

## Architecture

```
src/
  index.ts            Vercel entrypoint (default-exported Hono app)
  dev.ts              Local server (adds serveStatic, which Vercel ignores)
  create-app.tsx      App factory: middleware order, routes, 404/500
  config/             Zod-validated env, site constants
  data/               schema.ts (Zod) and providers.ts (the directory itself)
  lib/                search ranking, dial helpers, staleness
  middleware/         security headers, caching, request log
  routes/             pages, JSON API, robots/sitemap/health
  views/              Hono JSX layout, components, pages
public/               css, js, vendored htmx/gsap, icons (served by the CDN)
tests/                search, data, helpers, HTTP contract
```

Decisions worth knowing:

- **Server-rendered HTML first.** Pages work with JavaScript off. HTMX enhances search.
- **HTMX fragments have their own route** (`/directory/results`), never an `HX-Request` branch on the page URL. That keeps CDN caching and browser history restore correct. The server sends `HX-Push-Url` with the canonical page URL.
- **Data is a typed module, not JSON.** It is validated by Zod at boot and in CI, so a malformed entry fails the build instead of reaching users. A TypeScript module also avoids JSON-import quirks in Vercel's builder.
- **Search is a pure function** over 22 providers. No index service. Ranking handles nicknames ("gtb"), codes ("737", "\*737#"), what a code does ("airtime") and small typos.

## The data rules

Every entry lives in `src/data/providers.ts`. CI rejects any entry that has a malformed code, a duplicate, or no https source.

- `official`: the regulator or operator publishes it (NCC, NIBSS, NIMC).
- `corroborated`: at least two independent sources agree.
- **If sources contradict each other, the code is left out.** See `/about#left-out` for what was omitted and why (Kuda, Heritage, bank transfer menu numbers, and others).
- `checkedAt` means "cross-checked against the listed sources on that date". It does **not** mean the code was dialed. Do not claim otherwise.
- Entries unchecked for 90 days render a warning on the page, and the weekly `freshness` workflow starts failing.

To contribute: edit `providers.ts`, include a source, run `pnpm check`, open a pull request.

## Design and motion

Visual taste follows the reference: white canvas, tightly tracked grotesk (Geist, loaded from Google Fonts), soft grey surfaces, pill buttons. Blue (`--accent`) is deliberately rare: focus rings, one hero chip and the caret.

Motion follows Emil Kowalski's published rules, encoded as tokens in `public/css/app.css`:

- Strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; no built-in CSS easings.
- UI transitions under 300ms. Press feedback is `scale(0.97)` in 140ms.
- Nothing enters from `scale(0)`. Icon swaps use 0.6 plus a 2px blur to hide the crossfade.
- No animation on high-frequency actions: typing in search never animates. Category switches do.
- Page-to-page navigation uses CSS cross-document view transitions (no JS).
- GSAP handles only the landing choreography: hero word reveal, batched scroll reveals, counters and the demo loops. Everything sits inside `gsap.matchMedia`, so `prefers-reduced-motion` users get the final state with zero tweens.

## Security notes

- CSP: `script-src 'self'` with no inline scripts (a test enforces this). `style-src` keeps `'unsafe-inline'` because GSAP and CSS custom properties write inline styles. That is a deliberate, documented trade-off: script injection is the dominant XSS vector.
- Dial and copy strings accept digits only, and `{pin}` or NIN placeholders are never collectible on the page.

## Deploy to Vercel

1. Push to GitHub and import the repo. Vercel detects Hono and runs `pnpm build`, which compiles `src/` to `dist/`.
2. Set the `SITE_URL` environment variable.

`vercel.json` sets `outputDirectory: "dist"`, so the Hono builder uses the compiled `dist/index.js` and its `.js` imports instead of compiling the multi-file TSX source itself. This avoids the `ERR_MODULE_NOT_FOUND` crash reported against Vercel's Hono builder (vercel/vercel#14910). Vercel still serves `public/` from its CDN and ignores `serveStatic`, so `src/index.ts` deliberately omits it.

## Known gaps

- Not yet deployed to a real Vercel project. It was verified by compiling with `tsc` and running the output in plain Node ESM, plus a Chromium test pass.
- Provider tiles are monograms, not logos, on purpose: logos are trademarks.

## License

MIT. See [LICENSE](LICENSE).
