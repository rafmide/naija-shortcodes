// Copies pinned third-party browser assets from node_modules into public/.
// Vercel serves public/ from its CDN, so these are committed and never fetched at runtime.
// Script filenames carry their version so they can be cached forever and still upgrade cleanly.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs'

const version = (pkg) =>
  JSON.parse(readFileSync(`node_modules/${pkg}/package.json`, 'utf8')).version

const htmx = version('htmx.org')
const gsap = version('gsap')

const files = [
  ['node_modules/htmx.org/dist/htmx.min.js', `public/vendor/htmx-${htmx}.min.js`],
  ['node_modules/gsap/dist/gsap.min.js', `public/vendor/gsap-${gsap}.min.js`],
  ['node_modules/gsap/dist/ScrollTrigger.min.js', `public/vendor/ScrollTrigger-${gsap}.min.js`],
]

mkdirSync('public/vendor', { recursive: true })
const keep = new Set(files.map(([, to]) => to.split('/').pop()))
for (const old of readdirSync('public/vendor')) if (!keep.has(old)) rmSync(`public/vendor/${old}`)

for (const [from, to] of files) {
  copyFileSync(from, to)
  console.log(`vendored ${to}`)
}
console.log(`\nUpdate src/lib/vendor.ts if these versions changed: htmx ${htmx}, gsap ${gsap}`)
