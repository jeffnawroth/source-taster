import { createRequire } from 'node:module'
import process from 'node:process'
import pino from 'pino'

const require = createRequire(import.meta.url)

const isProduction = process.env.NODE_ENV === 'production'

function buildTransports() {
  const targets: pino.TransportTargetOptions[] = []

  if (!isProduction) {
    targets.push({
      target: require.resolve('pino-pretty'),
      level: process.env.LOG_LEVEL || 'info',
      options: { colorize: true, translateTime: 'SYS:standard' },
    })
  }

  if (process.env.LOKI_URL) {
    targets.push({
      target: require.resolve('pino-loki'),
      level: process.env.LOG_LEVEL || 'info',
      options: {
        host: process.env.LOKI_URL,
        labels: { service: 'source-taster-api', env: process.env.NODE_ENV || 'development' },
        batching: true,
        interval: 5,
      },
    })
  }

  return targets.length > 0 ? { targets } : undefined
}

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.apiKey',
      '*.token',
      '*.creditCard',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  base: {
    service: 'source-taster-api',
    env: process.env.NODE_ENV || 'development',
  },
  transport: buildTransports(),
})
