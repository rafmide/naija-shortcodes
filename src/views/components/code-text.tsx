import type { FC } from 'hono/jsx'

/** Renders a USSD string with muted `*` and `#`, and placeholders as small chips. */
export const CodeText: FC<{ code: string }> = ({ code }) => {
  const parts = code.split(/(\{[a-z]+\}|\*|#)/).filter(Boolean)
  return (
    <span class="code" data-code-display>
      {parts.map((part) =>
        part === '*' || part === '#' ? (
          <span class="code-sym">{part}</span>
        ) : part.startsWith('{') ? (
          <span class="code-slot">{part.slice(1, -1)}</span>
        ) : (
          part
        ),
      )}
    </span>
  )
}
