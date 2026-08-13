import type { EventEmitter } from 'node:events'
import type { Logger } from 'pino'
import process from 'node:process'

export interface ShutdownServer {
  close: (callback: (err?: unknown) => void) => void
  closeIdleConnections?: () => void
  closeAllConnections?: () => void
}

export interface ShutdownOptions {
  server: ShutdownServer
  endSql: () => Promise<void>
  logger?: Pick<Logger, 'info' | 'error' | 'warn'>
  forceExitMs?: number
  drainMs?: number
  events?: Pick<EventEmitter, 'once' | 'removeListener'>
  exit?: (code: number) => void
}

const silentLogger = { info: () => {}, error: () => {}, warn: () => {} }

export function shutdown(options: ShutdownOptions): Promise<number> {
  const {
    server,
    endSql,
    logger = silentLogger,
    forceExitMs = 10_000,
    drainMs = 5_000,
  } = options

  return new Promise((resolve) => {
    let settled = false
    let forceTimer: ReturnType<typeof setTimeout> | undefined
    let drainTimer: ReturnType<typeof setTimeout> | undefined
    const settle = (code: number) => {
      if (settled)
        return
      settled = true
      clearTimeout(forceTimer)
      clearTimeout(drainTimer)
      resolve(code)
    }

    forceTimer = setTimeout(() => {
      logger.error('graceful shutdown timed out, forcing exit')
      settle(1)
    }, forceExitMs)
    forceTimer.unref?.()

    drainTimer = setTimeout(() => {
      server.closeAllConnections?.()
    }, drainMs)
    drainTimer.unref?.()

    server.close((err) => {
      if (err)
        logger.error({ err }, 'error while closing the http server')
      clearTimeout(drainTimer)
      endSql()
        .catch(e => logger.error({ err: e }, 'error while closing the database pool'))
        .finally(() => {
          logger.info('graceful shutdown complete')
          settle(0)
        })
    })
    server.closeIdleConnections?.()
  })
}

export function registerGracefulShutdown(options: ShutdownOptions): () => void {
  const {
    logger = silentLogger,
    events = process,
    exit = code => process.exit(code),
  } = options

  let shuttingDown = false
  const onSignal = (signal: string) => {
    if (shuttingDown)
      return
    shuttingDown = true
    logger.info(`received ${signal}, shutting down gracefully`)
    void shutdown(options).then(code => exit(code))
  }

  events.once('SIGTERM', onSignal)
  events.once('SIGINT', onSignal)

  return () => {
    events.removeListener('SIGTERM', onSignal)
    events.removeListener('SIGINT', onSignal)
  }
}
