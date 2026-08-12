# B2B-Foundation (API-Keys, Postgres, /v1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Source-Taster-API bekommt eine minimal-sichere B2B-Foundation: echte API-Keys (SHA-256-gehasht, widerrufbar) auf Postgres/Drizzle, `/v1`-Namespace und Production-Betrieb — Browser-Clients bleiben unverändert funktionsfähig.

**Architecture:** Postgres 16-Container + Drizzle ORM im bestehenden Compose-Stack. `api_keys`-Tabelle (hash, prefix, status), `apiKeyService` mit Hashing, `keyAuth`-Middleware (X-API-Key, optional-invalidierend), CLI-Scripte für Key-Vergabe und Widerruf. Alle vorhandenen Routen wandern mechanisch von `/api/*` auf `/v1/*`; Health bleibt `/`.

**Tech Stack:** Hono 4, Drizzle ORM + postgres-js, node:crypto (SHA-256), tsx-CLI, Vitest (neu in apps/api), pnpm-Monorepo, Docker Compose.

## Global Constraints

- Pre-commit-Hook läuft automatisch: `pnpm build:types && pnpm typecheck && pnpm lint-staged` — bei jedem Commit grün halten.
- Tests: Vitest, `globals: true`, `environment: 'node'`. Kein neues Test-Framework.
- Key-Format: `srt_live_<base64url(32 random bytes)>`. Gespeichert wird NUR `key_hash` (sha256 hex) + `key_prefix` („srt_live_…“ + letzte 4 Zeichen). Der volle Key existiert nur in der CLI-Ausgabe.
- Kein Klartext-Vergleich: eingehender Key wird gehasht und per Hash-Lookup geprüft.
- Fehler-Envelope bleibt: `{ success: false, error: <code>, message }` via bestehendem `registerOnError` (HTTPException-Muster wie `withClientId`).
- Browser-Clients sind KEIN Ziel dieses Plans außer Pfad-Migration: `apps/web` Services und `apps/extension/src/env.ts` zeigen nur noch auf `/v1/*`.
- `docker-compose.override.yml` im Repo-Root wird GELÖSCHT (sie zwingt `NODE_ENV=development` + Dockerfile.dev beim Server-Deploy).
- Auth-Regel pro Route: `keyAuth` ist optional-invalidierend — fehlt `X-API-Key`, läuft der Browser-Pfad (CORS + `X-Client-Id`) unverändert; ist er gesetzt, muss er gültig sein, sonst `401`.

---

### Task 1: Postgres + Drizzle-Grundgerüst in apps/api

**Files:**
- Modify: `docker-compose.yml` (postgres-Service, DATABASE_URL, depends_on, volumes)
- Modify: `apps/api/package.json` (Deps + Scripts db:generate/db:migrate/test)
- Modify: `apps/api/Dockerfile` (CMD: Migration dann Server; drizzle-Folder kopieren)
- Create: `apps/api/drizzle.config.ts`
- Create: `apps/api/src/db/schema.ts` (`api_keys`-Tabelle)
- Create: `apps/api/src/db/client.ts` (Pool + drizzle-Instanz)
- Create: `apps/api/src/db/migrate.ts` (Migrations-Eintrittspunkt)
- Create: `apps/api/vitest.config.ts`
- Verify: lokale Migration gegen lokalen Postgres-Container

**Interfaces:**
- Consumes: nichts (First Task)
- Produces: `db` (drizzle-Instanz, Export `src/db/client.ts`), Tabelle `api_keys` (Schema aus `src/db/schema.ts`)

- [ ] **Step 1: Dependencies installieren**

```bash
pnpm --filter @source-taster/api add drizzle-orm postgres
pnpm --filter @source-taster/api add -D drizzle-kit vitest
```

- [ ] **Step 2: Postgres-Service in docker-compose.yml ergänzen**

In `docker-compose.yml` einen Service `postgres` ergänzen:

```yaml
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: sourcetaster
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-sourcetaster_pg}
      POSTGRES_DB: sourcetaster
    ports:
      - '127.0.0.1:5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: [CMD-SHELL, 'pg_isready -U sourcetaster -d sourcetaster']
      interval: 10s
      timeout: 5s
      retries: 5
```

Am Ende der Datei Top-Level `volumes:` ergänzen:

```yaml
volumes:
  pgdata:
```

Beim `api`-Service ergänzen:

```yaml
    environment:
      DATABASE_URL: postgres://sourcetaster:${POSTGRES_PASSWORD:-sourcetaster_pg}@postgres:5432/sourcetaster
    depends_on:
      postgres:
        condition: service_healthy
```

- [ ] **Step 3: Drizzle-Config schreiben**

`apps/api/drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://sourcetaster:sourcetaster_pg@localhost:5432/sourcetaster',
  },
})
```

- [ ] **Step 4: Schema schreiben**

`apps/api/src/db/schema.ts`:

```ts
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const apiKeyStatusEnum = pgEnum('api_key_status', ['active', 'revoked'])

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  keyHash: text('key_hash').notNull().unique(),
  keyPrefix: text('key_prefix').notNull(),
  status: apiKeyStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})

export type ApiKeyRow = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert
```

- [ ] **Step 5: DB-Client schreiben**

`apps/api/src/db/client.ts`:

```ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
if (!connectionString)
  throw new Error('DATABASE_URL is not set')

export const sql = postgres(connectionString, { max: 10 })
export const db = drizzle(sql)
```

- [ ] **Step 6: Migrations-Entrypoint schreiben**

`apps/api/src/db/migrate.ts`:

```ts
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, sql } from './client.js'

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url))

await migrate(db, { migrationsFolder })
await sql.end()
console.log('Migrations applied')
```

- [ ] **Step 7: Vitest-Config schreiben**

`apps/api/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    env: {
      DATABASE_URL: 'postgres://sourcetaster:sourcetaster_pg@localhost:5432/sourcetaster',
    },
  },
})
```

- [ ] **Step 8: package.json-Scripts ergänzen**

In `apps/api/package.json` scripts ergänzen:

```json
"test": "vitest run",
"db:generate": "drizzle-kit generate",
"db:migrate": "tsx --env-file=.env src/db/migrate.ts"
```

- [ ] **Step 9: Migration erzeugen und gegen Container prüfen**

```bash
docker compose up -d postgres
pnpm --filter @source-taster/api db:generate
pnpm --filter @source-taster/api db:migrate
docker compose exec postgres psql -U sourcetaster -d sourcetaster -c '\d api_keys'
```

Expected: Tabelle `api_keys` existiert mit Spalten `id, key_hash, key_prefix, status, created_at, revoked_at`.

- [ ] **Step 10: Dockerfile auf Migration-plus-Start umstellen**

In `apps/api/Dockerfile` nach dem `COPY --from=build /app/apps/api/dist/ ./apps/api/dist/` ergänzen:

```dockerfile
COPY --from=build /app/apps/api/drizzle/ ./apps/api/drizzle/
```

CMD-Zeile ersetzen:

```dockerfile
CMD ["sh", "-c", "node apps/api/dist/db/migrate.js && node apps/api/dist/index.js"]
```

- [ ] **Step 11: Commit**

```bash
git add docker-compose.yml apps/api/package.json apps/api/Dockerfile apps/api/drizzle.config.ts apps/api/src/db apps/api/vitest.config.ts pnpm-lock.yaml apps/api/drizzle
git commit -m "feat(api): add postgres + drizzle backbone with api_keys table"
```

---

### Task 2: API-Key-Service (Hashing, CRUD, Lookup)

**Files:**
- Create: `apps/api/src/services/apiKeyService.ts`
- Test: `apps/api/src/services/apiKeyService.test.ts`

**Interfaces:**
- Consumes: `db` + `apiKeys` aus Task 1
- Produces:
  - `generateApiKey(): { fullKey: string, keyHash: string, keyPrefix: string }`
  - `hashApiKey(fullKey: string): string`
  - `createApiKey(): Promise<{ id: string, fullKey: string, keyPrefix: string }>`
  - `listApiKeys(): Promise<ApiKeyRow[]>`
  - `revokeApiKey(id: string): Promise<boolean>`
  - `findApiKeyByHash(hash: string): Promise<ApiKeyRow | null>`

- [ ] **Step 1: Failing Test schreiben**

`apps/api/src/services/apiKeyService.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { generateApiKey, hashApiKey } from './apiKeyService.js'

describe('apiKeyService', () => {
  it('generates keys with srt_live_ prefix and base64url payload', () => {
    const { fullKey } = generateApiKey()
    expect(fullKey).toMatch(/^srt_live_[A-Za-z0-9_-]{43}$/)
  })

  it('exposes only a prefix, never the full key', () => {
    const { fullKey, keyPrefix } = generateApiKey()
    expect(keyPrefix).not.toContain(fullKey.slice('srt_live_'.length, -4))
    expect(keyPrefix.endsWith(fullKey.slice(-4))).toBe(true)
  })

  it('hashes deterministically and irreversibly', () => {
    const { fullKey, keyHash } = generateApiKey()
    expect(keyHash).toBe(hashApiKey(fullKey))
    expect(keyHash).toMatch(/^[0-9a-f]{64}$/)
    expect(keyHash).not.toContain(fullKey)
  })

  it('generates unique keys', () => {
    const a = generateApiKey().fullKey
    const b = generateApiKey().fullKey
    expect(a).not.toBe(b)
  })
})
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `pnpm --filter @source-taster/api test`
Expected: FAIL — `apiKeyService` nicht gefunden.

- [ ] **Step 3: Service implementieren**

`apps/api/src/services/apiKeyService.ts`:

```ts
import { createHash, randomBytes } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { apiKeys, type ApiKeyRow } from '../db/schema.js'
import { httpBadRequest } from '../errors/http.js'

const PREFIX = 'srt_live_'

export function generateApiKey(): { fullKey: string, keyHash: string, keyPrefix: string } {
  const payload = randomBytes(32).toString('base64url')
  const fullKey = `${PREFIX}${payload}`
  return { fullKey, keyHash: hashApiKey(fullKey), keyPrefix: `${PREFIX}…${fullKey.slice(-4)}` }
}

export function hashApiKey(fullKey: string): string {
  return createHash('sha256').update(fullKey).digest('hex')
}

export async function createApiKey(): Promise<{ id: string, fullKey: string, keyPrefix: string }> {
  const { fullKey, keyHash, keyPrefix } = generateApiKey()
  const rows = await db.insert(apiKeys).values({ keyHash, keyPrefix }).returning({ id: apiKeys.id })
  return { id: rows[0]!.id, fullKey, keyPrefix }
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt))
}

export async function revokeApiKey(id: string): Promise<boolean> {
  if (!id)
    throw httpBadRequest('revokeApiKey: id is required')
  const rows = await db.update(apiKeys)
    .set({ status: 'revoked', revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.status, 'active')))
    .returning({ id: apiKeys.id })
  return rows.length > 0
}

export async function findApiKeyByHash(hash: string): Promise<ApiKeyRow | null> {
  const rows = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, hash)).limit(1)
  return rows[0] ?? null
}
```

- [ ] **Step 4: Tests laufen lassen (müssen passieren)**

Run: `pnpm --filter @source-taster/api test`
Expected: PASS (4 Tests, keine DB nötig — reine Funktionen).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/apiKeyService.ts apps/api/src/services/apiKeyService.test.ts
git commit -m "feat(api): add api key service with hashing and lookup"
```

---

### Task 3: CLI-Scripte create-key / list-keys / revoke-key

**Files:**
- Create: `apps/api/src/cli/keys.ts`
- Modify: `apps/api/package.json` (Scripts key:create/key:list/key:revoke)

**Interfaces:**
- Consumes: `createApiKey`, `listApiKeys`, `revokeApiKey` aus Task 2
- Produces: CLI-Kommandos als pnpm-Scripts

- [ ] **Step 1: CLI implementieren**

`apps/api/src/cli/keys.ts`:

```ts
import process from 'node:process'
import { createApiKey, listApiKeys, revokeApiKey } from '../services/apiKeyService.js'

async function main() {
  const [command, arg] = process.argv.slice(2)

  switch (command) {
    case 'create': {
      const key = await createApiKey()
      console.log('\n=== NEW API KEY (shown once — store it safely) ===')
      console.log(key.fullKey)
      console.log('====================================================\n')
      break
    }
    case 'list': {
      const keys = await listApiKeys()
      for (const k of keys) {
        console.log(
          `${k.id}  ${k.keyPrefix}  ${k.status}  created=${k.createdAt.toISOString()}${k.revokedAt ? `  revoked=${k.revokedAt.toISOString()}` : ''}`,
        )
      }
      break
    }
    case 'revoke': {
      if (!arg) {
        console.error('Usage: keys revoke <id>')
        process.exit(1)
      }
      const revoked = await revokeApiKey(arg)
      console.log(revoked ? `Key ${arg} revoked` : `Key ${arg} not found or already revoked`)
      break
    }
    default:
      console.error('Usage: keys <create|list|revoke>')
      process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

- [ ] **Step 2: pnpm-Scripts ergänzen**

In `apps/api/package.json` scripts ergänzen:

```json
"keys": "tsx --env-file=.env src/cli/keys.ts",
"key:create": "tsx --env-file=.env src/cli/keys.ts create",
"key:list": "tsx --env-file=.env src/cli/keys.ts list",
"key:revoke": "tsx --env-file=.env src/cli/keys.ts revoke"
```

- [ ] **Step 3: Lokal verifizieren (braucht lokalen Postgres aus Task 1 Step 8)**

```bash
pnpm --filter @source-taster/api key:create
pnpm --filter @source-taster/api key:list
pnpm --filter @source-taster/api key:revoke <id-aus-list>
pnpm --filter @source-taster/api key:list   # Status muss revoked zeigen
```

Expected: Key wird genau einmal angezeigt; nach revoke steht `revoked` in der Liste.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/cli/keys.ts apps/api/package.json
git commit -m "feat(api): add api key cli (create/list/revoke)"
```

---

### Task 4: keyAuth-Middleware (X-API-Key, optional-invalidierend)

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Test: `apps/api/src/middleware/auth.test.ts`

**Interfaces:**
- Consumes: `hashApiKey`, `ApiKeyRow`-Typ aus Task 2
- Produces: `keyAuth(lookup?: FindByHash): MiddlewareHandler` — injizierte Lookup-Funktion für Tests. Setzt Variable `apiKey: { id, keyPrefix }` am Request-Kontext.

- [ ] **Step 1: Failing Test schreiben**

`apps/api/src/middleware/auth.test.ts`:

```ts
import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import type { ApiKeyRow } from '../db/schema.js'
import { keyAuth } from './auth.js'

async function fakeLookup(rows: Array<Pick<ApiKeyRow, 'id' | 'keyPrefix' | 'status'>>): Promise<ApiKeyRow | null> {
  return rows[0] ?? null
}

function buildApp(rows: Array<Pick<ApiKeyRow, 'id' | 'keyPrefix' | 'status'>>) {
  const app = new Hono()
  app.use('*', keyAuth(fakeLookup.bind(null, rows)))
  app.get('/test', (c) => c.json({ ok: true, apiKey: c.get('apiKey') ?? null }))
  return app
}

describe('keyAuth', () => {
  it('lets requests without X-API-Key pass (browser path)', async () => {
    const res = await buildApp([]).request('/test')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, apiKey: null })
  })

  it('rejects invalid keys with 401', async () => {
    const res = await buildApp([]).request('/test', { headers: { 'X-API-Key': 'srt_live_nope' } })
    expect(res.status).toBe(401)
  })

  it('rejects revoked keys with 401', async () => {
    const res = await buildApp([
      { id: 'revoked-id', keyPrefix: 'srt_live_…0000', status: 'revoked' },
    ]).request('/test', { headers: { 'X-API-Key': 'srt_live_whatever' } })
    expect(res.status).toBe(401)
  })

  it('accepts valid active keys and exposes key context', async () => {
    const res = await buildApp([
      { id: 'key-1', keyPrefix: 'srt_live_…0000', status: 'active' },
    ]).request('/test', { headers: { 'X-API-Key': 'srt_live_whatever' } })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, apiKey: { id: 'key-1', keyPrefix: 'srt_live_…0000' } })
  })
})
```

- [ ] **Step 2: Test laufen lassen (muss fehlschlagen)**

Run: `pnpm --filter @source-taster/api test -- middleware/auth.test.ts`
Expected: FAIL — `./auth.js` nicht gefunden.

- [ ] **Step 3: Middleware implementieren**

`apps/api/src/middleware/auth.ts`:

```ts
import type { MiddlewareHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { hashApiKey } from '../services/apiKeyService.js'

export interface ApiKeyContext { apiKey: { id: string, keyPrefix: string } }

export function keyAuth(lookup: (hash: string) => Promise<{ id: string, keyPrefix: string, status: string } | null>): MiddlewareHandler<{ Variables: ApiKeyContext }> {
  return async (c, next) => {
    const header = c.req.header('X-API-Key')

    // kein Key -> Browser-Pfad (CORS + X-Client-Id) läuft weiter
    if (!header)
      return next()

    const row = await lookup(hashApiKey(header))
    if (!row || row.status !== 'active') {
      throw new HTTPException(401, { message: 'Invalid API key' })
    }

    c.set('apiKey', { id: row.id, keyPrefix: row.keyPrefix })
    await next()
  }
}
```

- [ ] **Step 4: Tests laufen lassen (müssen passieren)**

Run: `pnpm --filter @source-taster/api test`
Expected: PASS (4 Tests).

- [ ] **Step 5: Parametrisierte Produktions-Injektion in index.ts vorbereiten (nur Referenz)**

In `apps/api/src/index.ts` wird in Task 5 verdrahtet:

```ts
import { keyAuth } from './middleware/auth.js'
import { findApiKeyByHash } from './services/apiKeyService.js'
// ...
app.use('/v1/*', keyAuth(findApiKeyByHash))
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/middleware/auth.ts apps/api/src/middleware/auth.test.ts
git commit -m "feat(api): add optional-invalidating api key auth middleware"
```

---

### Task 5: /v1-Namespace im API-Server

**Files:**
- Modify: `apps/api/src/index.ts` (Mounts auf /v1, keyAuth, CORS-Pfade, Root-Endpoint)

**Interfaces:**
- Consumes: `keyAuth` aus Task 4, bestehende Router
- Produces: Full `/v1/*`-API, kompatibel für Web/Extension (ohne Key), geschützt für Key-Caller

- [ ] **Step 1: index.ts umstellen**

`apps/api/src/index.ts` komplett ersetzen:

```ts
import process from 'node:process'
import { serve } from '@hono/node-server'
import { httpInstrumentationMiddleware } from '@hono/otel'
import { Hono } from 'hono'
import { registerOnError } from './errors/registerOnError.js'
import { withClientId } from './middleware/clientId.js'
import { corsMiddleware } from './middleware/cors.js'
import { logger } from './middleware/logger.js'
import { metricsMiddleware } from './middleware/metrics.js'
import { requestId } from './middleware/requestId.js'
import { requestLogger } from './middleware/requestLogger.js'
import { keyAuth } from './middleware/auth.js'
import { anystyleRouter } from './routes/anystyleRouter.js'
import extractionRouter from './routes/extractionRouter.js'
import { healthRouter } from './routes/healthRouter.js'
import matchingRouter from './routes/matchingRouter.js'
import searchRouter from './routes/searchRouter.js'
import { userRouter } from './routes/userRouter.js'
import { findApiKeyByHash } from './services/apiKeyService.js'
import './telemetry/instrumentation.js'

const app = new Hono()

registerOnError(app)

app.use('*', httpInstrumentationMiddleware())
app.use('*', requestId())
app.use('*', requestLogger())
app.use('*', metricsMiddleware())
app.use('/v1/*', corsMiddleware)

// Mount health & metrics — not protected by CORS so monitoring tools work
app.route('/', healthRouter)

// API-Key-Auth: optional-invalidierend — fehlt der Key, läuft der Browser-Pfad
app.use('/v1/*', keyAuth(findApiKeyByHash))

// Browser-Clients: X-Client-Id bleibt Pflicht für diese Routen
app.use('/v1/user/*', withClientId)
app.use('/v1/extract', withClientId)

// Mount API routes (versioned namespace)
app.route('/v1/anystyle', anystyleRouter)
app.route('/v1/extract', extractionRouter)
app.route('/v1/match', matchingRouter)
app.route('/v1/search', searchRouter)
app.route('/v1/user', userRouter)

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Source Taster API',
    endpoints: {
      anystyle: '/v1/anystyle',
      extract: '/v1/extract',
      search: '/v1/search',
      match: '/v1/match',
    },
  })
})

const port = Number(process.env.PORT || '') || 8000
logger.info(`API running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
```

- [ ] **Step 2: Typecheck + Tests**

Run: `pnpm --filter @source-taster/api typecheck && pnpm --filter @source-taster/api test`
Expected: PASS

- [ ] **Step 3: Manuell gegen lokalen Stack verifizieren**

```bash
docker compose up -d postgres
pnpm --filter @source-taster/api key:create   # Key notieren
pnpm dev   # API auf :8000 (aus Root)
curl -i http://localhost:8000/health           # 200 (Health liegt an Root, außerhalb CORS)
curl -i http://localhost:8000/v1/search/openalex \
  -H 'Content-Type: application/json' \
  -d '{"references":[{"id":"00000000-0000-0000-0000-000000000000","metadata":{"type":"article-journal","title":"x","author":[]}}]}'
# → suche ohne Key: 400/200 je nach Validation, KEIN 401
curl -i http://localhost:8000/v1/search/openalex \
  -H 'X-API-Key: srt_live_FALSCH' \
  -H 'Content-Type: application/json' \
  -d '{"references":[]}'
# → 401 invalid api key
curl -i http://localhost:8000/v1/search/openalex \
  -H "X-API-Key: <echter-Key>" \
  -H 'Content-Type: application/json' \
  -d '{"references":[{"id":"00000000-0000-0000-0000-000000000000","metadata":{"type":"article-journal","title":"x","author":[]}}]}'
# → 2xx, echter Durchstich
```

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "feat(api): move all routes to /v1 with api key auth"
```

---

### Task 6: Web-App, Extension und Docs auf /v1 umstellen

**Files:**
- Modify: `apps/web/src/services/anystyleService.ts` (Pfade)
- Modify: `apps/web/src/services/extractionService.ts` (Pfad)
- Modify: `apps/web/src/services/matchingService.ts` (Pfad)
- Modify: `apps/web/src/services/searchService.ts` (Pfad)
- Modify: `apps/web/src/services/aiSecretsService.ts` (Pfade)
- Modify: `apps/web/src/services/services.test.ts` (Mock-Pfade)
- Modify: `apps/web/src/services/apiClient.test.ts` (Mock-Pfade)
- Modify: `apps/web/vite.config.ts` (dev-proxy /v1)
- Modify: `apps/extension/src/env.ts` (endpoints → /v1)
- Modify: `apps/docs/api.md`, `apps/docs/de/api.md`, `apps/docs/architecture.md`, `apps/docs/de/architecture.md` (Pfade + X-API-Key-Sektion)

**Interfaces:**
- Consumes: `/v1/*`-API aus Task 5
- Produces: konsistent vollständige /v1-Nutzung in allen Clients

- [ ] **Step 1: Web-Services-Pfade ersetzen**

Recherchiere und ersetze in allen Dateien unter `apps/web/src/services/` sowie `apps/web/vite.config.ts` und `apps/extension/src/env.ts` jeden String `/api/` durch `/v1/`:

```bash
rg -l '/api/' apps/web/src apps/web/vite.config.ts apps/extension/src/env.ts | xargs sed -i '' 's|/api/|/v1/|g'
```

Dann prüfen: `apps/web/src/services/apiClient.ts` selbst enthält keinen Pfad (bezieht `apiBaseUrl` aus `@/env`) — Basis-URL bleibt unverändert.

- [ ] **Step 2: Test-Erwartungen prüfen**

`apps/web/src/services/apiClient.test.ts` (Zeile 38) und `services.test.ts` erwarten Mock-Pfade — per `sed` ebenfalls ersetzen (obiger Befehl deckt `apps/web/src` ab). Danach:

```bash
pnpm --filter @source-taster/web test
```

Expected: PASS — Mocks matchen die neuen `/v1/...`-Pfade.

- [ ] **Step 3: Typecheck + Lint**

```bash
pnpm typecheck
pnpm --filter @source-taster/web lint
```

- [ ] **Step 4: Docs aktualisieren**

In `apps/docs/api.md` und `apps/docs/de/api.md`:

1. Alle Endpoint-Pfade `/api/` → `/v1/` (sed wie Step 1)
2. Auth-Sektion (Zeile ~12 in beiden Dateien) erweitern um:

```markdown
- `X-API-Key: <srt_live_…>` – optional für Server-Clients (B2B). Wenn gesetzt, muss der Key
  aktiv sein, sonst `401 invalid_api_key`. Browser-Clients senden stattdessen `X-Client-Id`.
- Keys werden über das CLI vergeben (`pnpm --filter @source-taster/api key:create`), nur der
  SHA-256-Hash wird gespeichert; ein Widerruf erfolgt per `key:revoke <id>`.
```

In `apps/docs/architecture.md` und `apps/docs/de/architecture.md`: Endpoint-Liste `/api/` → `/v1/` (sed).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src apps/web/vite.config.ts apps/extension/src/env.ts apps/docs/api.md apps/docs/de/api.md apps/docs/architecture.md apps/docs/de/architecture.md
git commit -m "refactor: move all clients and docs to /v1 api namespace"
```

---

### Task 7: Production-Modus-Fix + Deployment-Anleitung

**Files:**
- Delete: `docker-compose.override.yml` (Repo-Root)
- Delete: `apps/api/Dockerfile.dev` (nur noch vom gelöschtenOverride referenziert)
- Modify: `apps/api/.env.example` (DATABASE_URL dokumentieren)
- Verify: Server-Betrieb

**Interfaces:**
- Consumes: Task 1–6
- Produces: Production-Betrieb ohne Dev-Override; dokumentierter Deploy-Pfad

- [ ] **Step 1: Override-Dateien entfernen**

```bash
git rm docker-compose.override.yml apps/api/Dockerfile.dev
```

- [ ] **Step 2: .env.example ergänzen**

In `apps/api/.env.example` ergänzen:

```bash
DATABASE_URL=postgres://sourcetaster:sourcetaster_pg@localhost:5432/sourcetaster
```

- [ ] **Step 3: Deployment auf dem Server**

Auf `jeff@195.201.102.233` in `/srv/source-taster`:

```bash
rm -f docker-compose.override.yml
docker compose up -d --build
docker compose exec api printenv NODE_ENV     # muss "production" zeigen
docker compose exec api node -e "fetch('http://localhost:8000/health').then(r => console.log(r.status))"
docker compose ps
```

Expected: api läuft mit `NODE_ENV=production`, Migration hat `api_keys` angelegt, `/health` → 200. Postgres-Daten liegen in Volume `source-taster_pgdata`.

- [ ] **Step 4: Key für Partner vergeben (erstes echtes Onboarding)**

```bash
docker compose exec -T api node apps/api/dist/cli/keys.js create
```

(Im Container wird `tsx` nicht benötigt — kompiliertes JS; das Ergebnis „„shown once"-Key" protokollieren und dem Partner sicher übergeben.)

Hinweis: Das CLI im Container läuft direkt über `node` mit der Container-`DATABASE_URL`.

- [ ] **Step 5: Commit**

```bash
git add -u && git add apps/api/.env.example
git commit -m "chore: remove dev compose override, document database url"
```

---

## Self-Review-Checkliste

- **Spec-Abdeckung:** Postgres+Drizzle ✓ (Task 1), api_keys-Tabelle ✓ (Task 1), CLI ✓ (Task 3), keyAuth + Statusprüfung ✓ (Task 4), Browser unverändert ✓ (Task 4/5/6), /v1 ✓ (Task 5/6), Production-Fix ✓ (Task 7), X-Client-Id für /v1/user+extract ✓ (Task 5). Air-Secrets-Migration bewusst draußen (Nicht-Scope).
- **Placeholder:** keine — jeder Task enthält konkrete Dateien, Code und Verifikationsbefehle.
- **Typkonsistenz:** `ApiKeyRow`/`NewApiKey` aus schema.ts (Task 1) → genutzt in apiKeyService (Task 2) und auth.ts (Task 4). `keyAuth(lookup)`-Signatur identisch in Task 4 (Definition) und Task 5 (`keyAuth(findApiKeyByHash)`). `generateApiKey`-Return-Shape konsistent über Tests/Service/CLI.