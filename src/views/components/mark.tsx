import type { FC } from 'hono/jsx'

/** Original mark: an asterisk and a hash, the two keys every USSD code starts and ends with. */
export const Mark: FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect width="32" height="32" rx="9" fill="#0b0b0c" />
    <g stroke="#fff" stroke-width="2.2" stroke-linecap="round">
      <path d="M10.5 11v8M6.9 13l7.2 4M6.9 17l7.2-4" />
      <path d="M20 10.5 18.6 21.5M24.6 10.5 23.2 21.5M17.2 14.2h8.4M16.8 18h8.4" />
    </g>
  </svg>
)
