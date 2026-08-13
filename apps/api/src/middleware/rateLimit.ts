import type { MiddlewareHandler } from 'hono'
import type { ApiKeyContext } from './auth.js'
import process from 'node:process'
import { HTTPException } from 'hono/http-exception'

export interface RateLimitOptions {
  keys: { ratePerMinute?: number, burst?: number }
  anonymous: { ratePerMinute?: number, burst?: number }
}

interface Bucket {
  tokens: number
  updated: number
}

const ANONYMOUS_BUCKET = '__anonymous__'
const WINDOW_MS = 60_000
const SWEEP_INTERVAL_MS = 5 * 60_000
const SWEEP_IDLE_MULTIPLIER = 2

function parseEnv(name: string, fallback: number): number {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export function rateLimit(options?: Partial<RateLimitOptions>): MiddlewareHandler<{ Variables: ApiKeyContext }> {
  const keyLimit = options?.keys?.ratePerMinute ?? parseEnv('RATE_LIMIT_PER_KEY', 120)
  const keyCapacity = options?.keys?.burst ?? keyLimit
  const anonymousLimit = options?.anonymous?.ratePerMinute ?? parseEnv('RATE_LIMIT_ANONYMOUS_PER_MINUTE', 600)
  const anonymousCapacity = options?.anonymous?.burst ?? anonymousLimit

  const buckets = new Map<string, Bucket>()

  // periodischer Sweep: entfernt Buckets, die länger als 2× window ungenutzt sind
  const sweep = setInterval(() => {
    const cutoff = Date.now() - SWEEP_IDLE_MULTIPLIER * WINDOW_MS
    for (const [id, bucket] of buckets) {
      if (bucket.updated < cutoff)
        buckets.delete(id)
    }
  }, SWEEP_INTERVAL_MS)
  sweep.unref()

  return async (c, next) => {
    const apiKey = c.get('apiKey')
    const id = apiKey?.id ?? ANONYMOUS_BUCKET
    const ratePerMinute = apiKey ? keyLimit : anonymousLimit
    const capacity = apiKey ? keyCapacity : anonymousCapacity

    const now = Date.now()
    const bucket = buckets.get(id) ?? { tokens: capacity, updated: now }
    const ratePerSec = ratePerMinute / 60
    const elapsedSec = (now - bucket.updated) / 1000
    const tokens = Math.min(capacity, bucket.tokens + elapsedSec * ratePerSec)

    if (tokens < 1) {
      // Bucket-Zustand trotzdem fortschreiben, damit ein späterer Refill korrekt rechnet
      bucket.tokens = tokens
      bucket.updated = now
      buckets.set(id, bucket)
      c.header('RateLimit-Limit', String(capacity))
      c.header('RateLimit-Remaining', '0')
      c.header('RateLimit-Reset', String(Math.floor(now / 1000 + (capacity - tokens) / ratePerSec)))
      throw new HTTPException(429, { message: 'Rate limit exceeded' })
    }

    const remaining = tokens - 1
    bucket.tokens = remaining
    bucket.updated = now
    buckets.set(id, bucket)

    c.header('RateLimit-Limit', String(capacity))
    c.header('RateLimit-Remaining', String(Math.floor(remaining)))
    c.header('RateLimit-Reset', String(Math.floor(now / 1000 + (capacity - remaining) / ratePerSec)))

    await next()
  }
}
