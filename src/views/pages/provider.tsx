import type { FC } from 'hono/jsx'
import { CATEGORY_LABELS, type Provider } from '../../data/index.js'
import { formatDate, plural } from '../../lib/format.js'
import { isStale } from '../../lib/staleness.js'
import { CodeRow } from '../components/code-row.js'
import { AlertIcon, ArrowRight } from '../components/icons.js'
import { Monogram } from '../components/provider-card.js'

export const ProviderPage: FC<{ provider: Provider; now: Date }> = ({ provider, now }) => {
  const newest =
    provider.codes
      .map((c) => c.checkedAt)
      .sort()
      .at(-1) ?? ''
  const anyStale = provider.codes.some((c) => isStale(c.checkedAt, now))

  return (
    <section class="container page provider-page">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="/directory">Directory</a>
        <span aria-hidden="true">/</span>
        <a href={`/directory?category=${provider.category}`}>
          {CATEGORY_LABELS[provider.category]}
        </a>
      </nav>

      <header class="provider-head">
        <Monogram provider={provider} class="mono-xl" />
        <div>
          <h1 class="page-title">{provider.name}</h1>
          <p class="page-sub">
            {plural(provider.codes.length, 'code')} · last checked {formatDate(newest)}
          </p>
        </div>
      </header>

      {anyStale ? (
        <p class="callout callout-warn" role="note">
          <AlertIcon size={16} />
          Some entries have not been rechecked in over 90 days. Confirm with the provider before
          using them.
        </p>
      ) : null}

      {provider.note ? <p class="callout">{provider.note}</p> : null}

      <ul class="code-list">
        {provider.codes.map((entry) => (
          <CodeRow entry={entry} now={now} />
        ))}
      </ul>

      <aside class="provider-foot">
        <p>Code wrong or missing? Entries live in one file and changes arrive as pull requests.</p>
        <a class="link-arrow" href="/about#contribute">
          How to contribute <ArrowRight size={14} />
        </a>
      </aside>
    </section>
  )
}
