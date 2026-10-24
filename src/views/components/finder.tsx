import type { FC } from 'hono/jsx'
import { CATEGORY_LABELS, categoryCounts, providers } from '../../data/index.js'
import type { Category } from '../../data/schema.js'
import { CATEGORIES } from '../../data/schema.js'
import type { SearchHit } from '../../lib/search.js'
import { SearchIcon } from './icons.js'
import { ProviderCard } from './provider-card.js'

export interface FinderProps {
  hits: SearchHit[]
  q: string
  category: Category | undefined
  /** Landing-page preview: fixed featured list, 8 cards, no URL pushing. */
  embed?: boolean
  placeholder?: string
}

export const ProviderGrid: FC<{ hits: SearchHit[]; q: string }> = ({ hits, q }) => (
  <>
    <p class="results-meta" role="status">
      {q ? (
        <>
          {hits.length} {hits.length === 1 ? 'match' : 'matches'} for <strong>{q}</strong>
        </>
      ) : (
        <>
          {hits.length} {hits.length === 1 ? 'provider' : 'providers'}
        </>
      )}
    </p>
    {hits.length === 0 ? (
      <div class="empty">
        <p class="empty-title">Nothing matches “{q}”.</p>
        <p>
          Try a bank name, a nickname like <em>gtb</em> or <em>mtn</em>, or the code itself, like{' '}
          <em>737</em>.
        </p>
      </div>
    ) : (
      <ul class="grid" data-grid>
        {hits.map((hit) => (
          <li>
            <ProviderCard provider={hit.provider} />
          </li>
        ))}
      </ul>
    )}
  </>
)

export const Finder: FC<FinderProps> = ({ hits, q, category, embed = false, placeholder }) => {
  const counts = categoryCounts()
  const active = category ?? 'all'
  const tabs: { value: string; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: providers.length },
    ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c], count: counts[c] })),
  ]

  return (
    <div class="finder-wrap">
      <form
        id="finder"
        class="finder"
        action="/directory"
        method="get"
        role="search"
        hx-get="/directory/results"
        hx-trigger="change, input from:#q delay:120ms, submit"
        hx-target="#results"
        hx-swap="innerHTML"
        hx-sync="this:queue last"
      >
        <div class="tabs" role="radiogroup" aria-label="Filter by category">
          {tabs.map((t) => (
            <label class="tab">
              <input type="radio" name="category" value={t.value} checked={active === t.value} />
              <span>
                {t.label}
                <small>{t.count}</small>
              </span>
            </label>
          ))}
        </div>
        <label class="search" for="q">
          <SearchIcon />
          <span class="sr-only">Search providers and codes</span>
          <input
            id="q"
            type="search"
            name="q"
            value={q}
            placeholder={placeholder ?? 'Search a bank, network or code'}
            autocomplete="off"
            autocapitalize="off"
            spellcheck={false}
            enterkeyhint="search"
            maxlength={60}
            data-search
          />
        </label>
        {embed ? <input type="hidden" name="limit" value="8" /> : null}
        {embed ? <input type="hidden" name="featured" value="1" /> : null}
        <noscript>
          <button class="btn btn-dark btn-sm" type="submit">
            Search
          </button>
        </noscript>
      </form>
      <div id="results" class="results" aria-live="polite">
        <ProviderGrid hits={hits} q={q} />
      </div>
    </div>
  )
}
