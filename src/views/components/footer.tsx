import type { FC } from 'hono/jsx'
import { Mark } from './mark.js'

export const Footer: FC = () => (
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <Mark size={28} />
        <p>A small, careful directory of USSD codes for Nigerian banks, networks and agencies.</p>
      </div>
      <nav aria-label="Browse" class="footer-col">
        <p class="footer-title">Browse</p>
        <a href="/directory?category=bank">Banks</a>
        <a href="/directory?category=fintech">Fintechs</a>
        <a href="/directory?category=network">Networks</a>
        <a href="/directory?category=government">Government</a>
      </nav>
      <nav aria-label="About" class="footer-col">
        <p class="footer-title">Project</p>
        <a href="/about">How codes are verified</a>
        <a href="/about#left-out">What we left out</a>
        <a href="/about#contribute">Contribute a code</a>
      </nav>
    </div>
    <div class="container footer-legal">
      <p>
        Not affiliated with any bank, network or regulator. Codes change without notice and your
        network may charge a small session fee. If a code fails, confirm with your provider.
      </p>
    </div>
  </footer>
)
