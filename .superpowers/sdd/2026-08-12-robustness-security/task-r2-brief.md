# Task R2 — HTTP-Security: Security-Headers + Body-Size-Limit

## Kontext
Branch `feat/robustness-security` (Worktree .worktrees/feat-robustness-security), HEAD `9e256b2a`.
API: Hono 4.12.30 in `apps/api`, Express-loses Setup mit Middleware-Kette in `src/index.ts`.
Bestehende Muster: Middleware-Dateien in `src/middleware/` (auth, cors, clientId, rateLimit,
requestId, requestLogger, metrics), Fehler-Mapping in `src/errors/registerOnError.ts`
(`HTTPException` → JSON `{ success: false, error: <code>, message }`), Tests als Vitest
`*.test.ts` in `src/middleware/` etc. (19 Tests grün). Env-Parsing: `parseEnv()` in
`src/middleware/rateLimit.ts` (lokale Funktion, ungültig → Fallback).

## Ziel
1. **Security-Headers-Middleware** `src/middleware/security.ts` (Export `securityHeaders()`),
   global registriert (`app.use('*', ...)`):
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: no-referrer`
   - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains` NUR wenn
     `c.req.raw.headers.get('x-forwarded-proto') === 'https'` (oder URL-Protokoll https) —
     nie über Plain-HTTP senden.
   - KEIN CSP: API liefert nur JSON, kein HTML — Entscheidung im Brief dokumentieren
     (kein Experimentieren mit CSP auf JSON-Endpoints).
   TDD: Testdatei `src/middleware/security.test.ts` (Headers auf `/v1/...`-Response UND auf
   Root-Response vorhanden; HSTS nur bei x-forwarded-proto https, nicht ohne; HSTS-Wert korrekt).

2. **Body-Size-Limit** mit Hono-Middleware `hono/body-limit` (`import { bodyLimit } from 'hono/body-limit'`):
   - Registrierung global in `index.ts`: `app.use('*', bodyLimit({ maxSize, onError }))`
   - `maxSize` aus Env `BODY_LIMIT_BYTES` (Default 10 MiB = 10 * 1024 * 1024), geparst wie
     `parseEnv` in rateLimit.ts (ungültig → Fallback). Dazu: `parseEnv` aus rateLimit.ts EXPORTIEREN
     und importieren (keine Duplikation). `.env.example` um `# Max request body size in bytes`
     `BODY_LIMIT_BYTES=10485760` ergänzen.
   - `onError`: `throw new HTTPException(413, { message: 'Payload too large' })` (Muster wie
     rateLimit.ts). Der Fehler läuft damit durch `registerOnError` → JSON-Form.
   - `registerOnError.ts`: Mapping-Kette um `status === 413 ? 'payload_too_large' : ...` erweitern.
     Test in `src/errors/registerOnError.test.ts` ergänzen (Exception mit status 413 →
     `{ success: false, error: 'payload_too_large', message }`).
   TDD: Body-Limit-Tests in `security.test.ts` (POST mit Content-Length > Limit → 413 + JSON-Form
   `payload_too_large`; POST unter Limit → passiert; GET ohne Body → passiert).

3. **Cache-Control**: Auf `/v1/*`-Responses `Cache-Control: no-store` setzen (verhindert
   Zwischenspeicherung von Nutzerdaten/Extraktionsergebnissen). Kein no-store auf /health, /metrics,
   Root. TDD-Test in security.test.ts (Header auf /v1/*-Response vorhanden, auf Root-Response NICHT).

4. **Einhaltung**: KEINE Kommentare in neuem Code (bestehende deutsche Kommentare in anderen
   Dateien NICHT anfassen/übersetzen). Kein `hono/secure-headers`-Paket — eigene kleine Middleware.

## Definition of Done
- `pnpm --filter @source-taster/api test` grün (bestehende 19 + neue Tests),
  `pnpm --filter @source-taster/api typecheck` grün, `pnpm --filter @source-taster/api lint` grün.
- Registrierungsreihenfolge in index.ts: securityHeaders und bodyLimit global (vor keyAuth/
  rateLimit), Reihenfolge untereinander egal; bestehende Kommentare in index.ts nicht löschen,
  neue Kommentare nicht hinzufügen.
- Commit `feat(api): add security headers and request body size limit` (Pre-Commit-Hook läuft:
  types-build + typecheck + lint-staged — bei Hook-Fehler `pnpm --filter @source-taster/extension
  exec vite build` ausführen und Commit wiederholen).
- Kein Push. Reporten: Dateien, Diff-Stat, Testanzahl, Abweichungen vom Brief.