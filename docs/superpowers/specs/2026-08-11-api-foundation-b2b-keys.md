# Spec: API-Foundation für B2B-Keys („B2B-Foundation")

> Status: Entscheidung getroffen — Implementierung ausstehend (2026-08-11)
> Entscheidungsmodus: kollaborativ (User hat Ansätze geprüft, Empfehlungen angenommen)

## Entscheidung

**Wir führen jetzt eine minimale, safety-first API-Foundation ein**, die einen ersten
B2B-Partner sicher on-boarden kann: echte API-Keys (gehasht, widerrufbar), serverseitige
Auth, `/v1`-Namespace und Production-Betrieb. Alles andere (Orgs, Scopes, Quotas,
Rate-Limits, Accounts, Billing) wird bewusst **nicht** gebaut und per Drizzle-Migration
später nachgezogen.

## Begründung

1. **Ein Unternehmen hat Interesse bekundet** — das Onboarding muss ohne
   Sicherheitsrisiken möglich sein: keine Klartext-Keys, kein anonymes `X-Client-Id`
   für Server-Clients.
2. **GPU-/AI-Kosten**: Alle Endpoints laufen über dieselbe API; gehashte, widerrufbare
   Keys sind die Mindest-Absicherung gegen Missbrauch.
3. **/v1 jetzt = billig**, später mit erstem Kunden = Vertragsbruch. Es gibt noch keine
   externen Integrationen — der günstigste Moment.
4. **Production-Modus**: Der Server läuft aktuell mit Dev-Override
   (`docker-compose.override.yml` → `NODE_ENV=development`, CORS faktisch offen).
   B2B ohne Production-Betrieb wäre unverantwortlich.

## Scope (JETZT)

1. **Postgres 16 + Drizzle** im Compose-Stack, Tabelle `api_keys` (minimal)
2. **CLI-Script** `create-key`, `list-keys`, `revoke-key` (Key wird einmalig angezeigt,
   nur SHA-256-Hash gespeichert)
3. **Auth-Middleware** `keyAuth`: `X-API-Key`-Validierung (SHA-256-Lookup,
   timing-safe compare, Statusprüfung)
4. **Browser-Clients unverändert**: Origin-Allowlist + `X-Client-Id` bleiben für
   Web-App und Extension bestehen (Browser können keine geheimen Keys halten)
5. **`/v1`-Namespace**: alle API-Routen wandern unter `/v1/*`, Browser-Clients und
   Docs werden mechanisch mitgezogen
6. **Production-Modus-Fix**: Compose-Override auf dem Server entfernen/anpassen,
   API läuft mit `NODE_ENV=production`

## Nicht-Scope (bewusst später)

Organizations-Tabelle, Scopes, Rate-Limiting, Quotas/Usage-Metering, AI-Secrets-Migration
(KFS bleibt vorerst), OpenAPI/SDK/Docs-Portal, Billing, User-Accounts/Sessions, OAuth,
Webhooks. Endpoint-Shapes der einzelnen Routes bleiben unverändert — nur das
Pfad-Präfix ändert sich.

## Architektur

### Datenmodell (Drizzle, in `apps/api`)

Tabelle `api_keys`:

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | uuid PK | interne ID |
| `key_hash` | text UNIQUE | SHA-256-Hex des vollen Keys — **niemals Klartext** |
| `key_prefix` | text | sichtbare Kennung (z. B. `srt_live_…abcd`) für Logs/Debugging |
| `status` | enum(`active`/`revoked`) | Status des Keys |
| `created_at` | timestamptz | Zeitpunkt der Erstellung |
| `revoked_at` | timestamptz NULL | Zeitpunkt der Widerrufung (NULL = aktiv) |

Key-Format: `srt_live_<base64url(32 bytes)>`. Nur `key_prefix` und Hash werden
gespeichert; der volle Key existiert einmalig in der CLI-Ausgabe.

### Komponenten

```
apps/api/
├── drizzle/                (Drizzle-Kit Migrationen)
├── drizzle.config.ts
└── src/
    ├── db/schema.ts        (api_keys-Schema)
    ├── db/client.ts        (Pool + Drizzle-Instanz, DATABASE_URL)
    ├── services/apiKeyService.ts  (create/list/revoke/lookup, Hashing)
    ├── middleware/auth.ts  (keyAuth: X-API-Key)
    ├── cli/keys.ts         (CLI-Scripte: create-key / list-keys / revoke-key)
    └── index.ts            (Routen unter /v1, Rest unverändert)
```

### Auth-Modell (2 Pfade, klar getrennt)

- **Server-Clients (B2B)**: `X-API-Key: srt_live_…` → `keyAuth`-Middleware
  (lookup by SHA-256, timing-safe compare, Status `active`) → Key-Kontext am Request
- **Browser-Clients (Web-App, Extension)**: wie heute — Origin-Allowlist (CORS)
  + `X-Client-Id` (nur für `/api/user/*` und `/api/extract` Pflicht)

Regel per Route: Alle `/v1/*`-Routen akzeptieren **beide** Pfade. `keyAuth` ist
optional-invalidierend: Ist `X-API-Key` gesetzt, muss er gültig sein (sonst `401`).
Fehlt der Header, läuft der Browser-Pfad (Origin-Allowlist + optionale/pflichtige
`X-Client-Id`) unverändert. Damit brechen Browser-Clients durch die Pfad-Migration
nicht, und B2B-Server-Clients sind ab Tag 1 erzwungen authentisiert.

Kein Key wird ausgeloggt; Fehlermeldungen enthalten nur `key_prefix`.

### Routen-Migration auf /v1

- Alle Router-Mounts in `index.ts` von `/api/*` auf `/v1/*` (Health bleibt `/health`)
- `apps/web/src/services/apiClient.ts`: Basis-Pfad `/v1`
- `apps/extension/src/env.ts`: Basis-Pfade `/v1`
- Docs (en/de, api.md und architecture.md): Pfade auf `/v1` aktualisieren

### CLI-Scripte

`pnpm --filter api key:create` / `key:list` / `key:revoke <id-or-prefix>`
(tsx-Scripte gegen den DB-Client; Key wird genau einmal auf stdout ausgegeben).

### Deployment / Production-Modus

- Postgres-16-Container im `docker-compose.yml` (internes Netz, Volume für
  Persistenz, Healthcheck, kein publizierter Port)
- `DATABASE_URL` in API-Env; Migrationen laufen beim Container-Start (idempotent)
- `docker-compose.override.yml`: Repo-Datei + Server-Datei prüfen und beseitigen
  (lädt `NODE_ENV=development` und Development-Sourcen) → API läuft production

## Fehlerbehandlung

- Fehlender `X-API-Key` bei keyAuth-Route → `401` (`missing_api_key`)
- Ungültiger Key (kein Hash-Match, revoked) → `401` (`invalid_api_key`)
- Envelope bleibt: `{ success: false, error: <code>, message }`

## Testing

- Vitest: `apiKeyService` (Hashing-Format, lookup, revoke-Status), `keyAuth`
  (401/403-Fälle, gültiger Key), CLI-Skript Smoke-Test
- Migration: Einmal-Migration von alter auf neue Route-Pfade in Web/Extension wird
  über bestehende Service-Tests (Mock-Pfade) abgesichert

## Offene Punkte / Später

- Orgs-Tabelle (Keys bekommen dann `org_id` per Migration)
- Scopes/Quotas/Usage-Metering für Billing
- AI-Secrets-Verlagerung von KFS in die DB
- OpenAPI/Docs für externe Kunden
- Accounts + Sessions (Better Auth), OAuth, Webhooks