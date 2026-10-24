/**
 * Fails when any entry has not been re-verified within the staleness window.
 * Runs weekly in CI (see .github/workflows/freshness.yml), not on every PR, so one old entry
 * never blocks unrelated work. Run: pnpm run check:freshness
 */
import { providers } from '../src/data/providers.js'
import { daysSince, isStale, STALE_AFTER_DAYS } from '../src/lib/staleness.js'

const stale = providers.flatMap((p) =>
  p.codes
    .filter((c) => isStale(c.checkedAt))
    .map((c) => ({ id: p.id, code: c.code, days: daysSince(c.checkedAt) })),
)

if (stale.length > 0) {
  console.error(
    `${stale.length} entries have not been re-verified in over ${STALE_AFTER_DAYS} days:\n`,
  )
  for (const s of stale) console.error(`  ✖ ${s.id} ${s.code} (${s.days} days)`)
  console.error(
    '\nRe-check them against their sources, then bump checkedAt in src/data/providers.ts.',
  )
  process.exit(1)
}
console.log(`✔ every entry was verified within the last ${STALE_AFTER_DAYS} days.`)
