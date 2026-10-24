import { getEnv } from '../config/env.js'

/** Cache-busting token. Static files are served `immutable`, so this must change on every deploy. */
const version = (getEnv().VERCEL_GIT_COMMIT_SHA ?? 'dev').slice(0, 8)

export const asset = (path: string): string => `${path}?v=${version}`
