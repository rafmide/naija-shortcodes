import type { FC } from 'hono/jsx'
import { MenuIcon } from './icons.js'
import { Mark } from './mark.js'

const LINKS = [
  { href: '/directory', label: 'Directory' },
  { href: '/about', label: 'How it works' },
] as const

export const Header: FC<{ path: string }> = ({ path }) => {
  const current = (href: string): 'page' | undefined =>
    path === href || path.startsWith(`${href}/`) ? 'page' : undefined

  return (
    <header class="site-header" data-header>
      <div class="container nav">
        <a class="brand" href="/" aria-label="Naija Shortcodes, home">
          <Mark size={30} />
          <span class="brand-name">shortcodes</span>
        </a>

        <nav class="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a href={l.href} aria-current={current(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div class="nav-actions">
          <details class="menu">
            <summary class="menu-button" aria-label="Open menu">
              <MenuIcon />
            </summary>
            <div class="menu-panel">
              {LINKS.map((l) => (
                <a href={l.href} aria-current={current(l.href)}>
                  {l.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
