### Task R1: Rate-Limiting pro API-Key (und anonym) mit Token-Bucket

**Files:**
- Create: `apps/api/src/middleware/rateLimit.ts`
- Test: `apps/api/src/middleware/rateLimit.test.ts`
- Modify: `apps/api/src/index.ts` (Middleware registrieren)
- Modify: `apps/api/.env.example` (Rate-Limit-Variablen dokumentieren)

**Interfaces:**
- Consumes: `ApiKeyContext` (`c.get('apiKey')` aus keyAuth, Key-Id als Bucket-Identität)
- Produces: `rateLimit(options?)`-Middleware; 429 mit `rate_limited` (registerOnError mappt 429 bereits → `rate_limited`)

**Design (Goldstandard pragmatisch):**
- Token-Bucket in-process (`Map<string, Bucket>`), KEINE DB/Redis — für die aktuelle Größe korrekt; Platz für später: Bucket-Store als injizierbare Fabrik.
- Identitäten: `apiKey.id` (Key-Kontext gesetzt) → Bucket pro Key, `__anonymous__` → EIN geteilter Bucket für alle Key-losen /v1-Caller (bewusst nicht pro IP — private IPs/Shared-IPs wären verrauscht; globaler Anonym-Bucket schützt den Server, nicht pro Client).
- Konfigurierbar per Options + Env-Fallback: `ratePerMinute` (Default `RATE_LIMIT_PER_KEY`=120 bzw. `RATE_LIMIT_ANONYMOUS_PER_MINUTE`=600), `burst` (Default = rate). Minimal-Konvention: `rateLimit({ keys, anonymous })` mit `{ ratePerMinute?: number, burst?: number }` je.
- Headers (Standard-IETF): `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (Epoch-Sekunden). Gesetzt direkt auf dem Response.
- Cleanup: Lazy-Reset — ein Bucket gilt als leer/neu, wenn `now - last >= window`; plus periodischem Sweep (setInterval alle 5 min entfernt Buckets, die länger als 2× window ungenutzt sind) — mit `unref()` damit der Prozess nicht am Leben gehalten wird.
- Chronologie in index.ts: `rateLimit` MUSS NACH `keyAuth` registriert werden (braucht `apiKey`-Kontext) und NACH `withClientId`-Mounts? — `app.use('/v1/*', keyAuth(...))` dann `app.use('/v1/*', rateLimit())` direkt danach; anonym laufen dadurch auch CORS-geprüfte Browser-Caller durch den anonymen Bucket (gewollt). Registration VOR den Router-Mounts.
- 429: `HTTPException(429, { message: 'Rate limit exceeded' })` — wirft und registerOnError liefert `rate_limited`.

**Test (TDD, erst rote Tests):**

`apps/api/src/middleware/rateLimit.test.ts`:
```ts
import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import { rateLimit } from './rateLimit.js'

function buildApp(opts: Parameters<typeof rateLimit>[0]) {
  const app = new Hono<{ Variables: { apiKey: { id: string, keyPrefix: string } | null } }>()
  app.use('*', async (c, next) => {
    // simuliert keyAuth: ein Caller mit Key, einer ohne
    if (c.req.header('X-API-Key')) c.set('apiKey', { id: 'key-1', keyPrefix: 'srt_live_…' })
    await next()
  })
  app.use('*', rateLimit(opts))
  app.get('/test', (c) => c.json({ ok: true }))
  return app
}

describe('rateLimit', () => {
  it('lets requests under the limit pass and sets headers', async () => {
    const app = buildApp({ keys: { ratePerMinute: 10, burst: 10 }, anonymous: { ratePerMinute: 1000, burst: 1000 } })
    const res = await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    expect(res.status).toBe(200)
    expect(Number(res.headers.get('RateLimit-Limit'))).toBe(10)
    expect(Number(res.headers.get('RateLimit-Remaining'))).toBeLessThanOrEqual(10)
    expect(Number(res.headers.get('RateLimit-Reset'))).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  it('rejects with 429 when a key exceeds its burst', async () => {
    const app = buildApp({ keys: { ratePerMinute: 60, burst: 2 }, anonymous: { ratePerMinute: 1000, burst: 1000 } })
    await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    const res = await app.request('/test', { headers: { 'X-API-Key': 'srt_live_x' } })
    expect(res.status).toBe(429)
  })

  it('does not share buckets between different keys', async () => {
    const app = buildApp({ keys: { ratePerMinute: 60, burst: 2 }, anonymous: { ratePerMinute: 1000, burst: 1000 } })
    await app.request('/test', { headers: { 'X-API-Key': 'a' } })
    await app.request('/test', { headers: { 'X-API-Key': 'a' } })
    const res = await app.request('/test', { headers: { 'X-API-Key': 'b' } })
    expect(res.status).toBe(200)
  })

  it('applies a shared bucket to anonymous callers', async () => {
    const app = buildApp({ keys: { ratePerMinute: 1000, burst: 1000 }, anonymous: { ratePerMinute: 60, burst: 2 } })
    await app.request('/test')
    await app.request('/test')
    const res = await app.request('/test')
    expect(res.status).toBe(429)
  })
})
```

**Umsetzung (`rateLimit.ts`):**
- Factory: 
```ts
export interface RateLimitOptions {
  keys: { ratePerMinute?: number, burst?: number }
  anonymous: { ratePerMinute?: number, burst?: number }
}
export function rateLimit(options?: Partial<RateLimitOptions>): MiddlewareHandler<{ Variables: ApiKeyContext }>
```
- Defaults aus Env: `RATE_LIMIT_PER_KEY` (120), `RATE_LIMIT_INITIAL_BURST`? Nein — halt schlicht: burst default = rate. Anonymous: `RATE_LIMIT_ANONYMOUS_PER_MINUTE` (600). Zahlen aus `Number(process.env.X)` safe-parse (fallback).
- Bucket: `{ tokens: number, updated: number }`; refill `tokens = min(capacity, tokens + (now - updated) / 1000 * ratePerSec)`.
- Sweep: `setInterval(..., 5 * 60_000).unref()`.
- Headers → bei jedem durchgelassenen Request setzen (c.header), auch bei 429? Bei 429 antworten wir via HTTPException — Header gehen verloren → deshalb VOR dem Wurf Header setzen geht nicht (c.header ruft auf Context ok vor Wurf). Einfach: Env-Check; Tests prüfen nur 200-Fall-Header. Doku: bei 429 greift der registerOnError-Envelope. Akzeptabel.
- Wenn kein `apiKey` gesetzt → anonymous-Bucket.
- Env-Beispiel in .env.example ergänzen.

**Verifikation:**
- Nach Implementierung: `pnpm --filter @source-taster/api test` (Suite bisher 13 Tests) — neu: 4 Tests grün.
- `pnpm --filter @source-taster/api typecheck`.
- index.ts: Registrierung nach keyAuth, vor Routen (Reihenfolge im Diff prüfbar).
- Commit: `feat(api): add token bucket rate limiting per api key and anonymous` — nur die 4 Dateien.

Hinweis pre-commit-Hook: `pnpm build:types && pnpm typecheck && pnpm lint-staged`; bei Extension-Quirk `pnpm --filter @source-taster/extension exec vite build` und Commit wiederholen; unklare Fehler → abbrechen, berichten.

Report nach `.superpowers/sdd/2026-08-12-robustness-security/task-r1-report.md` (im Worktree): TDD-Verlauf rot→grün, Commit-SHA, Registrierungsreihenfolge bestätigt, Abweichungen (idealerweise keine).

---