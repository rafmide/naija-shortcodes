import type { FC } from 'hono/jsx'
import {
  CATEGORY_LABELS,
  categoryCounts,
  latestCheckedAt,
  providers,
  totalCodes,
} from '../../data/index.js'
import { CATEGORIES, type Category } from '../../data/schema.js'
import { formatDate } from '../../lib/format.js'
import type { SearchHit } from '../../lib/search.js'
import { CodeText } from '../components/code-text.js'
import { Finder } from '../components/finder.js'
import { ArrowRight, CheckIcon, CopyIcon, SearchIcon, ShieldIcon } from '../components/icons.js'
import { Monogram } from '../components/provider-card.js'

const CATEGORY_BLURB: Record<Category, string> = {
  bank: 'Menus, balance and airtime shortcuts',
  fintech: 'OPay, PalmPay, Moniepoint',
  network: 'One set of codes for every network',
  government: 'BVN and NIN lookups',
}

/** The network card shows the three codes people dial most, instead of one lonely icon. */
const NETWORK_TILES = ['310', '323', '312'] as const

export const HomePage: FC<{ hits: SearchHit[] }> = ({ hits }) => {
  const counts = categoryCounts()

  return (
    <>
      <section class="hero container">
        <h1 class="hero-title" data-hero-title>
          <span class="w">Where</span>{' '}
          <span class="chip chip-blue w" aria-hidden="true">
            *
          </span>{' '}
          <span class="w">Nigerians</span>{' '}
          <span class="chip chip-dark w" aria-hidden="true">
            #
          </span>{' '}
          <span class="w">find</span> <span class="w">the</span>{' '}
          <span class="chip chip-soft w" aria-hidden="true">
            <CheckIcon size={22} />
          </span>{' '}
          <span class="w">code</span> <span class="w">that</span> <span class="w">works</span>
        </h1>
        <p class="hero-sub" data-hero-item>
          The USSD reference for banks, networks and agencies. {providers.length} providers,{' '}
          {totalCodes()} codes, each one sourced and dated.
        </p>
        <div class="hero-actions" data-hero-item>
          <a class="btn btn-dark btn-lg" href="/directory">
            Browse directory <ArrowRight />
          </a>
        </div>
      </section>

      <section class="container preview-wrap" data-hero-item aria-label="Try the directory">
        <div class="frame">
          <Finder
            hits={hits}
            q=""
            category={undefined}
            embed
            placeholder="Try gtb, mtn, bvn or 737"
          />
        </div>
      </section>

      <section class="container stats" aria-label="At a glance">
        <dl>
          <div data-reveal>
            <dt>Providers</dt>
            <dd data-count={providers.length}>{providers.length}</dd>
          </div>
          <div data-reveal>
            <dt>Codes</dt>
            <dd data-count={totalCodes()}>{totalCodes()}</dd>
          </div>
          <div data-reveal>
            <dt>With a source</dt>
            <dd>100%</dd>
          </div>
          <div data-reveal>
            <dt>Last checked</dt>
            <dd class="stat-date">{formatDate(latestCheckedAt())}</dd>
          </div>
        </dl>
      </section>

      <section class="container statement" data-reveal>
        <h2>
          Finding the right code took a search, a guess and a prayer.{' '}
          <span class="muted">Now it's one lookup.</span>
        </h2>
        <p class="statement-sub">
          Everyone has that note in their phone. Half the codes are outdated, one wrong digit can
          cost real money, and nobody says where a code came from. We show the source and the date,
          or we leave the code out.
        </p>
      </section>

      <section class="container features" aria-labelledby="features-title">
        <h2 class="section-title" id="features-title" data-reveal>
          <SearchIcon size={22} /> Search, fill, dial
        </h2>
        <div class="feature-track" data-reveal>
          <article class="feature">
            <div class="feature-ui" aria-hidden="true">
              <div class="mock-search">
                <SearchIcon size={16} />
                <span class="mock-typed" data-typed="gtb">
                  gtb
                </span>
                <span class="caret" />
              </div>
              <div class="mock-result" data-mock-result>
                <span class="mono-tile mono-bank">GT</span>
                <span class="mock-name">GTBank</span>
                <CodeText code="*737#" />
              </div>
            </div>
            <h3>Type what you call it</h3>
            <p>“gtb”, “guaranty trust” or “737” all land on the same bank.</p>
          </article>

          <article class="feature">
            <div class="feature-ui" aria-hidden="true">
              <div class="mock-field">
                <span>Amount (₦)</span>
                <span class="mock-input" data-fill-target="5000">
                  5000
                </span>
              </div>
              <div class="mock-code">
                <CodeText code="*737*5000#" />
              </div>
              <div class="mock-buttons">
                <span class="btn btn-soft btn-sm">
                  <CopyIcon /> Copy
                </span>
                <span class="btn btn-dark btn-sm">Dial</span>
              </div>
            </div>
            <h3>Fill the blanks, skip the typos</h3>
            <p>Enter the amount or number once. We build the string and never touch a PIN.</p>
          </article>

          <article class="feature">
            <div class="feature-ui" aria-hidden="true">
              <div class="mock-code">
                <CodeText code="*565*0#" />
              </div>
              <div class="mock-badges">
                <span class="badge badge-official">
                  <ShieldIcon size={14} /> Official source
                </span>
                <span class="meta-text">Checked {formatDate(latestCheckedAt())}</span>
              </div>
              <div class="mock-sources">NIBSS: USSD validation service</div>
            </div>
            <h3>Sourced and dated</h3>
            <p>Every code lists where it came from. Anything unchecked for 90 days is flagged.</p>
          </article>
        </div>
      </section>

      <section class="container categories" aria-labelledby="cats-title">
        <h2 class="section-title center" id="cats-title" data-reveal>
          One directory for every code.
        </h2>
        <div class="cat-stack">
          {CATEGORIES.map((cat) => {
            const sample = providers.filter((p) => p.category === cat).slice(0, 3)
            return (
              <a class="cat-card" href={`/directory?category=${cat}`} data-reveal>
                <span class="cat-label">{CATEGORY_LABELS[cat]}</span>
                <span class="cat-stackicons" aria-hidden="true">
                  {cat === 'network'
                    ? NETWORK_TILES.map((code) => (
                        <span class="mono-tile mono-lg mono-code">{code}</span>
                      ))
                    : sample.map((p) => <Monogram provider={p} class="mono-lg" />)}
                </span>
                <span class="cat-foot">
                  <span>{CATEGORY_BLURB[cat]}</span>
                  <span class="cat-count">{counts[cat]}</span>
                </span>
              </a>
            )
          })}
        </div>
      </section>

      <section class="container principles" aria-labelledby="principles-title">
        <h2 class="section-title" id="principles-title" data-reveal>
          Built so one wrong digit can't cost you.
        </h2>
        <ul class="principle-list">
          <li data-reveal>
            <h3>Sourced or it doesn't ship</h3>
            <p>
              Official page, or two independent sources that agree. When sources contradict each
              other, we publish nothing.
            </p>
          </li>
          <li data-reveal>
            <h3>Dated, and flagged when stale</h3>
            <p>Each entry shows when it was last cross-checked and warns after 90 days.</p>
          </li>
          <li data-reveal>
            <h3>We never ask for a PIN</h3>
            <p>
              Amounts and numbers can be filled in on the page. PINs and card numbers never are.
            </p>
          </li>
        </ul>
      </section>
    </>
  )
}
