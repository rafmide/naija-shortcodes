import type { FC } from 'hono/jsx'
import type { Action, UssdCode } from '../../data/schema.js'
import { isFillable, placeholders, toTelHref } from '../../lib/dial.js'
import { formatDate } from '../../lib/format.js'
import { daysSince, isStale } from '../../lib/staleness.js'
import { CodeText } from './code-text.js'
import { AlertIcon, CheckIcon, CopyIcon, PhoneIcon, ShieldIcon } from './icons.js'

const ACTION_LABELS: Record<Action, string> = {
  menu: 'Menu',
  balance: 'Balance',
  airtime: 'Airtime',
  data: 'Data',
  transfer: 'Transfer',
  identity: 'Identity',
  support: 'Support',
  other: 'Other',
}

const SLOTS: Record<string, { label: string; placeholder: string; maxlength: number }> = {
  amount: { label: 'Amount (₦)', placeholder: '500', maxlength: 7 },
  phone: { label: 'Phone number', placeholder: '08012345678', maxlength: 11 },
  account: { label: 'Account number', placeholder: '0123456789', maxlength: 10 },
}

export const CodeRow: FC<{ entry: UssdCode; now: Date }> = ({ entry, now }) => {
  const slots = placeholders(entry.code)
  const fillable = isFillable(entry.code)
  const needsInput = slots.length > 0
  const stale = isStale(entry.checkedAt, now)

  return (
    <li class="code-row" data-code-row data-template={entry.code}>
      <div class="code-row-main">
        <p class="code-row-label">
          <span class="tag">{ACTION_LABELS[entry.action]}</span>
          {entry.label}
        </p>
        <p class="code-row-code">
          <CodeText code={entry.code} />
        </p>

        {needsInput && fillable ? (
          <div class="fields">
            {slots.map((slot) => {
              const spec = SLOTS[slot]
              return spec ? (
                <label class="field">
                  <span>{spec.label}</span>
                  <input
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    autocomplete="off"
                    placeholder={spec.placeholder}
                    maxlength={spec.maxlength}
                    data-slot={slot}
                  />
                </label>
              ) : null
            })}
          </div>
        ) : null}

        {entry.note ? <p class="code-row-note">{entry.note}</p> : null}
      </div>

      {fillable ? (
        <div class="code-row-actions">
          <button
            type="button"
            class="btn btn-soft btn-sm"
            data-copy
            data-value={entry.code}
            disabled={needsInput}
          >
            <span class="icon-swap" aria-hidden="true">
              <CopyIcon class="i-copy" />
              <CheckIcon class="i-check" />
            </span>
            <span data-copy-label>Copy</span>
          </button>
          <a
            class="btn btn-dark btn-sm dial"
            data-dial
            href={needsInput ? undefined : toTelHref(entry.code)}
            aria-disabled={needsInput ? 'true' : undefined}
            tabindex={needsInput ? -1 : undefined}
          >
            <PhoneIcon />
            Dial
          </a>
        </div>
      ) : null}

      <div class="code-row-meta">
        <span class={`badge badge-${entry.verification}`}>
          <ShieldIcon size={14} />
          {entry.verification === 'official' ? 'Official source' : 'Corroborated'}
        </span>
        <span class="meta-text">Checked {formatDate(entry.checkedAt)}</span>
        {stale ? (
          <span class="badge badge-warn">
            <AlertIcon />
            Not rechecked in {daysSince(entry.checkedAt, now)} days
          </span>
        ) : null}
        <details class="sources">
          <summary>
            {entry.sources.length} {entry.sources.length === 1 ? 'source' : 'sources'}
          </summary>
          <ul>
            {entry.sources.map((s) => (
              <li>
                <a href={s.url} rel="noopener noreferrer nofollow" target="_blank">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </li>
  )
}
