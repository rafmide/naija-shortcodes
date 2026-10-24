import type { Logger } from 'pino'

export interface AppEnv {
  Variables: {
    requestId: string
    log: Logger
    now: () => Date
  }
}
