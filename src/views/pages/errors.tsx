import type { FC } from 'hono/jsx'
import { ArrowRight } from '../components/icons.js'

export const NotFoundPage: FC = () => (
  <section class="container page narrow center-text">
    <p class="eyebrow">404</p>
    <h1 class="page-title">That page isn't in the directory.</h1>
    <p class="page-sub">The link may be old, or the code was never listed.</p>
    <div class="hero-actions">
      <a class="btn btn-dark" href="/directory">
        Browse directory <ArrowRight />
      </a>
      <a class="btn btn-soft" href="/">
        Home
      </a>
    </div>
  </section>
)

export const ServerErrorPage: FC<{ requestId: string }> = ({ requestId }) => (
  <section class="container page narrow center-text">
    <p class="eyebrow">500</p>
    <h1 class="page-title">Something broke on our side.</h1>
    <p class="page-sub">
      It's logged. If it keeps happening, quote reference <code>{requestId}</code>.
    </p>
    <div class="hero-actions">
      <a class="btn btn-dark" href="/">
        Back to home
      </a>
    </div>
  </section>
)
