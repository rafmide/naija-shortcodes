export const STALE_AFTER_DAYS = 90
const DAY_MS = 86_400_000

/** Whole days between a YYYY-MM-DD date and `now`. Never negative. */
export const daysSince = (isoDate: string, now: Date = new Date()): number => {
  const then = Date.parse(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY
  return Math.max(0, Math.floor((now.getTime() - then) / DAY_MS))
}

export const isStale = (isoDate: string, now: Date = new Date()): boolean =>
  daysSince(isoDate, now) > STALE_AFTER_DAYS
