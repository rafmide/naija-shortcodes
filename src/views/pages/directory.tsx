import type { FC } from 'hono/jsx'
import type { Category } from '../../data/schema.js'
import { providers, totalCodes } from '../../data/index.js'
import type { SearchHit } from '../../lib/search.js'
import { Finder } from '../components/finder.js'

export const DirectoryPage: FC<{
  hits: SearchHit[]
  q: string
  category: Category | undefined
}> = ({ hits, q, category }) => (
  <section class="container page">
    <header class="page-head">
      <h1 class="page-title">Directory</h1>
      <p class="page-sub">
        {providers.length} providers and {totalCodes()} codes. Search a name, a nickname or the code
        itself.
      </p>
    </header>
    <Finder hits={hits} q={q} category={category} />
  </section>
)
