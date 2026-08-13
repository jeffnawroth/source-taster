# Task R4 — Konsolidierung: F5 (revoke per Prefix), F6 (Domain-Fehler im Service), N1 (AppEnv vereinheitlichen)

## Kontext
Branch `feat/robustness-security` (Worktree .worktrees/feat-robustness-security), HEAD `809e9181`.
Drei findings aus dem B2B-Whole-Branch-Review, jetzt abzuarbeiten. API in `apps/api/src`, 30 Tests grün.

## 1. N1 — AppEnv vereinheitlichen (`types/hono.ts` vs `middleware/clientId.ts`)
- `apps/api/src/types/hono.ts` enthält aktuell: `AppEnv { Variables: AppVariables }` mit
  `AppVariables { userId: string }` und einen Kommentar „Passe/erweitere nach Bedarf".
- `apps/api/src/middleware/clientId.ts` definiert EIGENE `AppEnv` (userId + apiKey) — Duplikat.
- Ziel: EINE Quelle in `types/hono.ts`:
  - `AppVariables { userId: string, apiKey?: { id: string, keyPrefix: string } | null }`
  - Kommentar aus types/hono.ts entfernen (kein Platzhalter mehr).
  - `clientId.ts`: lokale AppEnv-Interface-Definition löschen, `import type { AppEnv } from '../types/hono.js'` verwenden.
  - KEINE weitere Anpassung: auth.ts (ApiKeyContext) und rateLimit.ts bleiben unverändert
    (ApiKeyContext bleibt der Kontrakt von keyAuth). userRouter/controllers kompilieren unverändert.
- Verifikation: Typecheck grün; grep zeigt keine zweite AppEnv-Definition mehr.

## 2. F6 — Domain-Fehlerklasse statt httpBadRequest im Service
- Neues Modul `apps/api/src/errors/domain.ts`:
  `export class InvariantError extends Error` (name = 'InvariantError', constructor(message)).
- `apps/api/src/services/apiKeyService.ts`: `revokeApiKey` wirft statt `httpBadRequest(...)`
  ein `InvariantError('revokeApiKey: id or key prefix is required')`. Import von
  `../errors/http.js` entfernen, wenn nichts anderes daraus genutzt wird.
- `apps/api/src/errors/registerOnError.ts`: NEUE Branch VOR dem HTTPException-Branch:
  `err instanceof InvariantError` → warn-Log, `c.status(400)`,
  `c.json({ success: false, error: 'bad_request', message: err.message })` (Muster: InvalidApiKeyError-Branch).
- Test: `registerOnError.test.ts` — Case „InvariantError → 400 { error: 'bad_request' }".
- NICHT im Scope: übrige Services (baseAIProvider, userSecretsService, keystore usw.) — deren
  http*-Nutzung ist Legacy-Muster und wird separat als zukünftiger Refactor im Ledger notiert.

## 3. F5 — `keys revoke <id|prefix>`
- `apps/api/src/services/apiKeyService.ts`:
  - Export `isApiKeyId(value: string): boolean` (pure Funktion): true wenn value eine UUID ist
    (Regex `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`, case-insensitive).
  - `revokeApiKey(idOrPrefix: string)`: wenn `isApiKeyId` → `eq(apiKeys.id, idOrPrefix)`,
    sonst `eq(apiKeys.keyPrefix, idOrPrefix)` (exakter Match auf das in `list` angezeigte
    Prefix wie `srt_live_…abcd`). InvariantError bei leerem Argument. Logik: gleiche update-Query
    mit `and(eq(status,'active'))`, Rückgabe rows.length > 0. Mehrere Treffer bei Prefix-Kollision
    (theoretisch möglich, 2^16) werden alle revoziert — dokumentieren im CLI-Hinweis.
- `apps/api/src/cli/keys.ts`: revoke-Case — Usage-Meldung `keys revoke <id|prefix>`;
  `revokeApiKey(arg.trim())`.
- Tests (`apiKeyService.test.ts`): `isApiKeyId` — gültige UUID (Groß/Klein), UUID mit 'g'-Zeichen
  false, `srt_live_…abcd` false, leerer String false. (DB-Pfad der revoke-Query wird nicht
  unit-getestet — Repo hat keine DB-Integrationstests; Smoke-Verifikation erfolgt beim Deploy.)

## Einhaltung
- KEINE neuen Kommentare im Code. Bestehende Kommentare nicht anfassen.
- DoD: `pnpm --filter @source-taster/api test` grün (30 + neue), `pnpm --filter @source-taster/api typecheck` grün, `pnpm --filter @source-taster/api lint` grün.
- Commit `refactor(api): unify AppEnv, introduce InvariantError, allow key revocation by prefix`
  (Pre-Commit-Hook läuft automatisch; bei Hook-Fehler `pnpm --filter @source-taster/extension exec vite build` und Commit wiederholen). KEIN Push.
- Report: Dateien, Diff-Stat, Testanzahl vorher/nachher, Abweichungen, Commit-SHA.