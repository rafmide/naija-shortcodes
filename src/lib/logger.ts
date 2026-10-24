import { pino, type DestinationStream } from 'pino'
import { getEnv } from '../config/env.js'

const env = getEnv()

/**
 * Structured JSON to stdout; Vercel captures it as-is.
 * Pretty printing is development-only and uses a plain stream. pino *transports* spawn worker
 * threads, which serverless runtimes do not tolerate, so they are never used.
 */
const stream = async (): Promise<DestinationStream | undefined> => {
  if (env.NODE_ENV !== 'development') return undefined
  const { default: pretty } = await import('pino-pretty')
  return pretty({ colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname,service' })
}

export const logger = pino(
  {
    level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
    base: { service: 'naija-shortcodes' },
    redact: {
      paths: ['email', '*.email', 'req.headers.cookie', 'req.headers.authorization'],
      censor: '[redacted]',
    },
  },
  await stream(),
)
