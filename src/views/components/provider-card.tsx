import type { FC } from 'hono/jsx'
import { CATEGORY_LABELS, type Provider } from '../../data/index.js'
import { plural } from '../../lib/format.js'
import { CodeText } from './code-text.js'
import { LandmarkIcon, ShieldIcon, SignalIcon } from './icons.js'

const initials = (name: string): string => {
  const words = name.split(/\s+/).filter(Boolean)
  const text =
    words.length > 1
      ? words
          .slice(0, 2)
          .map((w) => w.charAt(0))
          .join('')
      : (words[0] ?? '').slice(0, 2)
  return text.toUpperCase()
}

export const Monogram: FC<{ provider: Provider; class?: string }> = ({ provider, class: cls }) => (
  <span class={`mono-tile mono-${provider.category} ${cls ?? ''}`} aria-hidden="true">
    {provider.category === 'network' ? (
      <SignalIcon />
    ) : provider.category === 'government' ? (
      provider.id === 'nimc-nin' ? (
        <ShieldIcon size={22} />
      ) : (
        <LandmarkIcon />
      )
    ) : (
      initials(provider.name)
    )}
  </span>
)

/** The one code worth showing on a card: the main menu if there is one, else the first entry. */
export const headlineCode = (provider: Provider): string =>
  (provider.codes.find((c) => c.action === 'menu') ?? provider.codes[0])?.code ?? ''

export const ProviderCard: FC<{ provider: Provider }> = ({ provider }) => (
  <a class="card provider-card" href={`/p/${provider.id}`}>
    <Monogram provider={provider} />
    <span class="card-body">
      <span class="card-title">{provider.name}</span>
      <span class="card-meta">
        {CATEGORY_LABELS[provider.category].replace(/s$/, '')} ·{' '}
        {plural(provider.codes.length, 'code')}
      </span>
    </span>
    <span class="card-code">
      <CodeText code={headlineCode(provider)} />
    </span>
  </a>
)
