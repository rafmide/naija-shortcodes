import type { FC } from 'hono/jsx'

interface IconProps {
  size?: number
  class?: string
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.75,
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
  'aria-hidden': 'true' as const,
  focusable: 'false' as const,
})

export const ArrowRight: FC<IconProps> = ({ size = 16, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowUpRight: FC<IconProps> = ({ size = 14, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const SearchIcon: FC<IconProps> = ({ size = 18, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
)

export const CopyIcon: FC<IconProps> = ({ size = 16, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <rect x="9" y="9" width="11" height="11" rx="3" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
)

export const CheckIcon: FC<IconProps> = ({ size = 16, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const PhoneIcon: FC<IconProps> = ({ size = 16, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="M6.5 4h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7L16 13l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
  </svg>
)

export const MenuIcon: FC<IconProps> = ({ size = 20, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="M4 8h16M4 16h16" />
  </svg>
)

export const SignalIcon: FC<IconProps> = ({ size = 22, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="M5 18v-2M10 18v-6M15 18V9M20 18V5" />
  </svg>
)

export const LandmarkIcon: FC<IconProps> = ({ size = 22, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </svg>
)

export const AlertIcon: FC<IconProps> = ({ size = 14, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="M12 4 3 19.5h18L12 4ZM12 10v4.5M12 17.2v.1" />
  </svg>
)

export const ShieldIcon: FC<IconProps> = ({ size = 18, class: cls }) => (
  <svg {...base(size)} class={cls}>
    <path d="M12 3.5 5 6v5.5c0 4.3 2.8 7.4 7 9 4.2-1.6 7-4.7 7-9V6l-7-2.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
)
