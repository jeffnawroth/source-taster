# Task R1 Report: Rate-Limiting pro API-Key (und anonym) mit Token-Bucket

## TDD-Verlauf

- **Rot:** Testdatei `apps/api/src/middleware/rateLimit.test.ts` angelegt (vorerst unverändert aus dem Brief). `pnpm --filter @source-taster/api test -- middleware/rateLimit.test.ts` → `Cannot find module './rateLimit.js'` (Suite-Rot bestätigt; 13 Bestand-Tests grün).
- **Grün:** `apps/api/src/middleware/rateLimit.ts` implementiert nach Design-Block:
  - Token-Bucket `Map<string, { tokens, updated }>` in-process, Pro-Factory-Closure; Identitäten: `apiKey.id` → Bucket pro Key, `__anonymous__` → ein geteilter Bucket.
  - Env-Fallback mit safe-parse: `RATE_LIMIT_PER_KEY` (120), `RATE_LIMIT_ANONYMOUS_PER_MINUTE` (600); `burst` default = rate; Umrechnung Refill `ratePerMinute / 60` pro Sekunde.
  - RateLimit-Header bei Durchlass: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (Epoch-Sekunden).
  - 429 via `HTTPException(429, { message: 'Rate limit exceeded' })` (registerOnError mappt 429 → `rate_limited`); Bucket-Zustand wird auch beim Wurf fortgeschrieben (korrekter späterer Refill).
  - Sweep: `setInterval` alle 5 min, entfernt Buckets mit `updated < now - 2×window`, `.unref()`.
- **Ergebnis:** Suite 17/17 grün (13 Bestand + 4 neue), `typecheck` grün.

## Commit

- **SHA:** `991edea2` — `feat(api): add token bucket rate limiting per api key and anonymous`
- Enthält exakt die 4 Dateien: `rateLimit.ts`, `rateLimit.test.ts`, `index.ts`, `.env.example` (137 Insertions).

## Registrierungsreihenfolge (bestätigt per Diff)

`apps/api/src/index.ts`:
1. `app.use('/v1/*', keyAuth(findApiKeyByHash))`
2. `app.use('/v1/*', rateLimit())` — NACH keyAuth (braucht `apiKey`-Kontext), VOR `withClientId`-Mounts und VOR allen Router-Mounts.
3. `app.use('/v1/user/*', withClientId)` / `app.use('/v1/extract', withClientId)`
4. `app.route('/v1/...')`-Mounts

Anonyme (Key-lose) Browser-Caller laufen damit durch den geteilten anonymen Bucket — wie im Brief gewollt.

## Abweichungen

1. **Test-Fix (keyAuth-Simulation):** Der Test aus dem Brief setzte hartkodiert `c.set('apiKey', { id: 'key-1', ... })` für **jeden** Request mit `X-API-Key`-Header. Dadurch teilten sich in Test 3 („does not share buckets between different keys", Header `a`/`a`/`b`) alle drei Caller denselben Bucket `key-1` → 3. Request → 429 statt erwartet 200 — der Test schlug mit einer **design-konformen** Implementierung fehl. Fix (minimal, im Test, nur die Simulation): `id` aus dem `X-API-Key`-Header ableiten (`const key = c.req.header('X-API-Key'); if (key) c.set('apiKey', { id: key, ... })`), sodass unterschiedliche Caller unterschiedliche Identitäten haben — exakt das, was der Testname prüft. **Implementierung unverändert nach Design** (Bucket pro `apiKey.id`).
2. **Test-Fix (ungenutzter Import):** `import { describe, expect, it, vi }` — `vi` war ungenutzt und fliegt bei `noUnusedLocals` im Typecheck (TS6133). Entfernt → `import { describe, expect, it }`.
3. **Vorbestehend (Worktree):** `packages/types/dist` fehlte → typecheck-Fehler `TS2307: Cannot find module '@source-taster/types'` in `similarity.ts` (unabhängig von dieser Task). Behoben durch `pnpm --filter @source-taster/types build`.
4. **Pre-commit-Hook:** Vorhergesagter Extension-Quirk trat auf — `Cannot find name 'browser'` etc. in `apps/extension/src/background/main.ts`. Workaround aus dem Brief (`pnpm --filter @source-taster/extension exec vite build`) hat den Hook über den Extension-Typecheck gebracht. Danach echter Lint-Fehler in eigener Datei: `node/prefer-global/process` → `import process from 'node:process'` ergänzt (Bestandskonvention, s. `index.ts`). Commit daraufhin erfolgreich.
5. **Keine weiteren:** RateLimit-Header fehlen bei 429 bewusst (HTTPException durchbricht Header-Setzung) — wie im Brief als akzeptabel markiert; Tests prüfen Header nur im 200-Fall.

## Verifikation nach Commit

- `pnpm --filter @source-taster/api test` → 17 passed (5 Files).
- `pnpm --filter @source-taster/api typecheck` → grün.
- `git status` → sauber (nur untracked `.superpowers/` = Brief-/Report-Dateien).
- `git log --oneline -1` → `991edea2 feat(api): add token bucket rate limiting per api key and anonymous`.