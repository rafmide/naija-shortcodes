/**
 * CI gate for contributions. Fails the build on any malformed entry, with the exact path.
 * Run: pnpm run validate:data
 */
import { directorySchema } from '../src/data/schema.js'
import { providers } from '../src/data/providers.js'

const result = directorySchema.safeParse(providers)

if (!result.success) {
  console.error('Directory data is invalid:\n')
  for (const issue of result.error.issues) {
    const [index, field, codeIndex] = issue.path
    const provider = typeof index === 'number' ? providers[index]?.id : undefined
    const where = [
      provider,
      field,
      typeof codeIndex === 'number' ? `code #${codeIndex}` : undefined,
    ]
      .filter(Boolean)
      .join(' > ')
    console.error(`  ✖ ${where || issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

const codes = result.data.reduce((sum, p) => sum + p.codes.length, 0)
console.log(`✔ ${result.data.length} providers, ${codes} codes, all valid.`)
