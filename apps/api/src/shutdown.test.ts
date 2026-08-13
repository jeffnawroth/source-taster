import type { ShutdownServer } from './shutdown.js'
import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { registerGracefulShutdown, shutdown } from './shutdown.js'

const noopLogger = { info: () => {}, error: () => {}, warn: () => {} }

function fakeServer(closeImpl?: ShutdownServer['close']): ShutdownServer & {
  close: ReturnType<typeof vi.fn>
  closeIdleConnections: ReturnType<typeof vi.fn>
  closeAllConnections: ReturnType<typeof vi.fn>
} {
  const close = vi.fn(closeImpl ?? ((cb: (err?: unknown) => void) => cb()))
  const idle = vi.fn()
  const all = vi.fn()
  return { close, closeIdleConnections: idle, closeAllConnections: all }
}

describe('shutdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('closes the server, drains and ends sql with exit code 0', async () => {
    const endSql = vi.fn().mockResolvedValue(undefined)
    const server = fakeServer()
    const code = await shutdown({ server, endSql, logger: noopLogger })
    expect(server.close).toHaveBeenCalled()
    expect(server.closeIdleConnections).toHaveBeenCalled()
    expect(endSql).toHaveBeenCalled()
    expect(code).toBe(0)
  })

  it('closes all connections after the drain window when the close callback never fires', async () => {
    const server = fakeServer(() => {})
    const codePromise = shutdown({ server, endSql: vi.fn(), logger: noopLogger, drainMs: 1000, forceExitMs: 5000 })
    await vi.advanceTimersByTimeAsync(1100)
    expect(server.closeAllConnections).toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(5000)
    expect(await codePromise).toBe(1)
  })

  it('forces exit with code 1 when the close callback never fires and the force window elapses', async () => {
    const server = fakeServer(() => {})
    const endSql = vi.fn()
    const codePromise = shutdown({ server, endSql, logger: noopLogger, forceExitMs: 3000 })
    await vi.advanceTimersByTimeAsync(3100)
    expect(await codePromise).toBe(1)
    expect(endSql).not.toHaveBeenCalled()
  })

  it('resolves 0 and ends sql even when the close callback reports an error', async () => {
    const server = fakeServer(cb => cb(new Error('http close failed')))
    const endSql = vi.fn().mockResolvedValue(undefined)
    const code = await shutdown({ server, endSql, logger: noopLogger })
    expect(endSql).toHaveBeenCalled()
    expect(code).toBe(0)
  })

  it('resolves 0 when ending sql rejects', async () => {
    const endSql = vi.fn().mockRejectedValue(new Error('sql end failed'))
    const code = await shutdown({ server: fakeServer(), endSql, logger: noopLogger })
    expect(code).toBe(0)
  })
})

describe('registerGracefulShutdown', () => {
  it('runs shutdown on SIGTERM and exits with the resolved code', async () => {
    const events = new EventEmitter()
    const exit = vi.fn()
    const server = fakeServer()
    const endSql = vi.fn().mockResolvedValue(undefined)
    registerGracefulShutdown({ server, endSql, logger: noopLogger, events, exit })
    events.emit('SIGTERM')
    expect(server.close).toHaveBeenCalled()
    await vi.waitFor(() => expect(exit).toHaveBeenCalledWith(0))
  })

  it('runs shutdown on SIGINT', () => {
    const events = new EventEmitter()
    const exit = vi.fn()
    const server = fakeServer()
    registerGracefulShutdown({ server, endSql: vi.fn().mockResolvedValue(undefined), logger: noopLogger, events, exit })
    events.emit('SIGINT')
    expect(server.close).toHaveBeenCalled()
  })

  it('ignores repeated signals while shutting down', async () => {
    const events = new EventEmitter()
    const exit = vi.fn()
    const server = fakeServer(cb => setTimeout(cb, 50))
    registerGracefulShutdown({ server, endSql: vi.fn().mockResolvedValue(undefined), logger: noopLogger, events, exit })
    events.emit('SIGTERM')
    events.emit('SIGTERM')
    events.emit('SIGINT')
    expect(server.close).toHaveBeenCalledTimes(1)
    await vi.waitFor(() => expect(exit).toHaveBeenCalledTimes(1))
  })

  it('unregisters the signal handlers', () => {
    const events = new EventEmitter()
    const exit = vi.fn()
    const server = fakeServer()
    const unregister = registerGracefulShutdown({ server, endSql: vi.fn(), logger: noopLogger, events, exit })
    unregister()
    events.emit('SIGTERM')
    expect(server.close).not.toHaveBeenCalled()
  })
})
