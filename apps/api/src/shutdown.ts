import type { EventEmitter } from 'node:events'
import process from 'node:process'

export interface ShutdownServer {
  close: (callback: (err?: unknown) => void) => void
  closeIdleConnections?: () => void
  closeAllConnections?: () => void
}

export interface ShutdownOptions {
  server: ShutdownServer
  endSql: () => Promise<void>
  forceExitMs?: number
  drainMs?: number
  events?: Pick<EventEmitter, 'once' | 'removeListener'>
  exit?: (code: number) => void
}

export function shutdown(options: ShutdownOptions): Promise<number> {
  const {
    server,
    endSql,
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
      settle(1)
    }, forceExitMs)
    forceTimer.unref?.()

    drainTimer = setTimeout(() => {
      server.closeAllConnections?.()
    }, drainMs)
    drainTimer.unref?.()

    server.close(() => {
      clearTimeout(drainTimer)
      endSql()
        .catch(() => {})
        .finally(() => {
          settle(0)
        })
    })
    server.closeIdleConnections?.()
  })
}

export function registerGracefulShutdown(options: ShutdownOptions): () => void {
  const {
    events = process,
    exit = code => process.exit(code),
  } = options

  let shuttingDown = false
  const onSignal = () => {
    if (shuttingDown)
      return
    shuttingDown = true
    void shutdown(options).then(code => exit(code))
  }

  events.once('SIGTERM', onSignal)
  events.once('SIGINT', onSignal)

  return () => {
    events.removeListener('SIGTERM', onSignal)
    events.removeListener('SIGINT', onSignal)
  }
}
