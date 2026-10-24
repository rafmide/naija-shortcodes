const formatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** `2026-10-23` -> `23 Oct 2026`. Falls back to the raw value if it cannot be parsed. */
export const formatDate = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? isoDate : formatter.format(date)
}

export const plural = (count: number, one: string, many = `${one}s`): string =>
  `${count} ${count === 1 ? one : many}`
