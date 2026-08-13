# SDD ledger — plan: robustness-security (2026-08-12)

Scope: Hardening der API für mehrere Nutzer (Rate-Limiting, HTTP-Security, CI-Tests,
Konsolidierung F5/F6/N1, DB-Timeouts, Graceful Shutdown, Server-Backups, Docs).
Basis: origin/main (v2.1.33, contains B2B foundation + cors fix).

Tasks: R1 rate limiting in progress | R2 security headers/body limit pending |
R3 CI tests pending | R4 consolidation pending | R5 db timeouts pending |
R6 graceful shutdown pending | R7 server backups pending | R8 docs pending |
Abschluss (review, PR, merge, deploy) pending.
## R1 abgeschlossen (Commit 0c3262b5)
- Implementierung: 991edea2 (rateLimit.ts, Testdatei, index.ts-Registrierung, .env.example)
- Review-Fixes (0c3262b5): Reset-Header-Semantik korrigiert — Epoch-Sekunden bis Bucket wieder voll,
  nach Verbrauch gerechnet (kollabiert an vollem Bucket nicht auf „jetzt"); 429-Pfad setzt jetzt
  RateLimit-Limit/Remaining=0/Reset; 2 Regressionstests (Env-Fallback bei ungültigen Werten,
  Refill nach Window via Fake-Timers). 19/19 Tests grün, Typecheck grün.

## R2 abgeschlossen (db c2a669 + Test-Fix)
- Implementierung: dbc2a669 — securityHeaders() (nosniff, DENY, no-referrer, Permissions-Policy,
  HSTS nur bei x-forwarded-proto https, KEIN CSP bewusst für reine JSON-API), bodyLimit aus
  hono/body-limit global (BODY_LIMIT_BYTES default 10 MiB, parseEnv aus rateLimit.ts exportiert),
  413 → payload_too_large in registerOnError, Cache-Control: no-store auf /v1/*.
- Review: APPROVED (F2 minor: Content-Length-Fast-Path war ungetestet) → Fast-Path-Test ergänzt,
  30/30 Tests grün.

## R3 abgeschlossen (809e9181)
- ci.yml: neuer test-Job (pnpm install && pnpm test), YAML validiert, beide Suiten lokal grün
  (api 30, web 25). Kein Review nötig (reine Config, lokal verifiziert).

## R4 abgeschlossen (0480b1bc)
- N1: eine AppEnv-Quelle in types/hono.ts (userId + optionales apiKey), clientId.ts importiert;
  Platzhalter-Kommentar entfernt. auth/rateLimit unangetastet.
- F6: errors/domain.ts InvariantError; apiKeyService wirft ihn statt httpBadRequest;
  registerOnError mappt → 400 bad_request (Branch vor HTTPException!). Legacy-Services
  (baseAIProvider, userSecretsService, keystore, anystyleProvider, searchCoordinator,
  referenceExtractionCoordinator, aiProviderFactory) nutzen weiter http* — bekannter
  Legacy-Refactor, separat zu planen.
- F5: isApiKeyId (pure) + revokeApiKey(id|prefix), CLI usage <id|prefix> + Kollisions-Hinweis.
- Review APPROVED. Notiz: isApiKeyId case-insensitiv, aber eq(id) case-sensitiv → Uppercase-UUID
  meldet not found (harmlos, option: lower()-Match im Ledger festhalten).
- 37/37 Tests grün.

## R5 abgeschlossen (31332a7a)
- db/client.ts: connect_timeout 10s, idle_timeout 60s, max_lifetime 30min, application_name
  source-taster-api, Startup-Optionen "-c statement_timeout=30000 -c lock_timeout=10000".
- Verifiziert gegen lokale Postgres: SHOW statement_timeout=30s, lock_timeout=10s, app-name korrekt.
- Vitest-Konfig setzt DATABASE_URL bereits → CI weiterhin grün.

## R6 abgeschlossen (c1d5a639)
- Neu src/shutdown.ts: shutdown()-Kern (close → idleConnections → drain 5s → closeAllConnections →
  endSql mit Fehler-Toleranz → Exit-Code; force-Exit nach 10s) + registerGracefulShutdown
  (SIGTERM/SIGINT, once, Guard gegen Mehrfach-Signale, events/exit injizierbar für Tests).
- 9 Unit-Tests (fake server, fake timers) → 46/46 grün. index.ts: server-Variable + Registrierung
  mit sql.end({timeout:5}). Dockerfile: CMD mit "exec node …" → node wird PID 1, SIGTERM kommt an.
- E2E-Verifikation: gebauter dist gestartet, /health 200, SIGTERM → "graceful shutdown complete",
  Exit 0. Lint-Fixes: Timer-Hoisting (no-use-before-define), process-Import.

## R4-Follow-up-Notiz
- isApiKeyId case-insensitiv vs. eq(id) case-sensitiv: option lower()-Match — bewusst offen gelassen.
- Legacy-Services mit http*-Nutzung: eigener Refactor-Plan nötig (F6 nur scoped umgesetzt).

## R7 abgeschlossen (970f14d5 + Backup-Installation auf Server)
- scripts/backup.sh: pg_dump -Fc --no-owner + .keystore-tar, Rotation (BACKUP_KEEP=14),
  optional BACKUP_RSYNC_TARGET offsite; Default BACKUP_DIR=$HOME/backups/source-taster
  (sudo nicht verfügbar auf VPS → kein /srv/backups möglich).
- Server: Script deployt (/srv/source-taster/scripts/backup.sh), Testlauf OK
  (postgres-20260813-072201.dump 5 KB, keystore-tar 3 KB), Restore-Probelauf verifiziert:
  pg_restore in scratch-DB → api_keys count 1 = 1, scratch-DB wieder gedroppt.
- Cron: täglich 03:30 als jeff → /var/log/source-taster-backup.log.
- scripts/backup.md: Restore-Anleitung postgres/keystore + Smoke nach Restore.
- Hinweis: Restore-Probe nächste Runde mit aktivem Key-Bestand wiederholen.

## R8 abgeschlossen (07c621f7)
- apps/docs/api.md + de/api.md: Rate-Limiting-Kapitel (Header, 429/Retry-After, Window-Reset),
  Fehlercode-Tabelle jetzt inkl. payload_too_large + rate_limited, Security-Notizen
  (Body-Limit 413, Header, HSTS-Bedingung, Backups-Hinweis).
- Kein Review nötig (Doku, lokal gegengeprüft).

## Whole-Branch-Review: CHANGES REQUIRED → Fixes committet (0018408f)
- F1 (Blocker): shutdown.test.ts SIGINT-Test reichte vi.fn() als endSql → undefined.catch →
  unhandled rejection → Vitest-Exit 1 → neuer CI-test-Job wäre trotz grüner Tests rot.
  Fix: mockResolvedValue(undefined). Verifiziert via Exit 0 (47 Tests).
- F2#2: backup.sh tar .keystore nur unter [[ -d ]] (warn + skip), damit Backups nicht failen,
  wenn keystore fehlt (z.B. frischer Checkout).
- F2#3: cors.ts Preflight 204 via rohem new Response umging den Hono-Header-Merge → in PROD
  fehlte Access-Control-Allow-Origin auf OPTIONS. Fix: c.body(null, 204) in allen 4 Preflight-
  Branches (DEV, Key-Caller, Trusted-Extension, Prod-Allowed) — replaceAll erfasste nur die
  6-Space-Varianten, der Prod-Branch (4-Space) musste separat gefixt werden (Test schlug vorher
  genau dort fehl). Regressionstest: OPTIONS mit ALLOWED_WEB_ORIGINS → 204 + ACAO-Header.
- 47/47 Tests grün, Typecheck/Lint grün.

## PR #235: gemergt (f1fe6b6, squash), CI vollständig grün (typecheck, build, lint, test)
- gh pr create 235 → Checks via gh pr checks --watch alle pass → squash-merge + Branch gelöscht.
- Deployment: VPS lief ein automatisches Drone-CI-Deployment (git reset --hard origin/main →
  build landing/docs/api/web sequenziell → up -d --remove-orphans), das den Merge bereits
  deployt hat. Eigener manueller up-Versuch hing am compose-Lock → gekillt, Drone übernahm.
- api-Container lief auf neuem Image ("Up 30 seconds (healthy)"). Server danach unter
  Langzeit-Vollast (web-Build) — SSH zeitweise nicht erreichbar (bekanntes VPS-Muster).
  Nächste Runde: Smoke-Tests nach Abschluss (SIGTERM-Check, RateLimit-Header, 413, 403/401,
  Health) + .npmrc-Rest cleanup + Backup-Cron-Check.

## Offene Punkte (bewusst)
- isApiKeyId case-insensitiv vs eq(id) case-sensitiv (harmlos, lower()-Match option).
- Legacy-Services mit http*-Helfern: separater Refactor-Plan.
- Restore-Probe mit aktivem Key-Bestand (Backup hat aktuell 1 Key aus R7-Probe).

## Hinweis (Deployment-Lektion, erneut bestätigt)
- NIEMALS parallel/zeitgleich mit Drone-Pipeline bauen; Drone deployt main automatisch.
  Manuelle Deploys nur, wenn keine CI-Build läuft; .npmrc fetch-timeout 600000 nur für
  manuelle Builds, danach wieder löschen.

## Deployment-Abschluss + Prod-Smoke-Tests (13.08., nach Reboot)
- **Gefunden:** deployter Container lief auf ALTEM Code — die parallelen Builds am Morgen
  (mein manueller `build api` + Drone-Pipeline) haben das Image-Tag gegenseitig überschrieben;
  der Gewinner war aus einem veralteten Kontext-Snapshot. Marker-Check im Container
  (dist/middleware ohne security.js/rateLimit.js) deckte es auf. Fix: sequenzieller
  `docker compose build api` nach Reboot (Cache-warm, ~1 min) + `up -d api`.
- **Port-Korrektur:** API läuft auf **8000** (3000 = Grafana → /login-Redirect!). Frühere
  Smoke-Referenzen "localhost:3000" waren falsch — alle Tests liefen gegen 8000.
- **Smoke-Ergebnisse (alle OK):** /health 200; /v1/* ohne Origin+Key → 403; invalid key → 401
  invalid_api_key; Security-Header auf Fehlerpfaden (nosniff, X-Frame-Options DENY,
  no-referrer, permissions-policy, Cache-Control no-store); RateLimit-Header (limit 120,
  remaining, reset-Epoch); 429 bei parallelem Burst (43×404/257×429), remaining 0;
  Token-Refill (2/s) bestätigt; 12 MiB POST → 413; CLI create/list/revoke-by-id OK;
  Test-Key danach revoked.
- **Graceful Shutdown E2E in Prod:** `docker kill --signal=SIGTERM` → Container exited 0
  (kein Crash, Doku „Migrations applied"), health danach 200.
  LERNER: Docker behandelt `docker kill` als manuellen Stop — Restart-Policy greift NICHT
  (Restarts: 0). Im normalen Betrieb (docker stop/restart, Reboot) startet unless-stopped
  wieder. Kein Bug unseres Codes.
- **Backup-Cron:** aktiv (03:30, Log-/Backup-Dateien vorhanden), Restore-Drill von R7 gilt.
- **Offener Punkt:** Key `769376ca…` (srt_live_…mioY, active, erstellt 08:54:03) stammt nicht
  von meiner Session — vermutlich automatischer Smoke der Deploy-Pipeline (Muster von gestern:
  a21cb018 erstellt 09:14 + revoked 09:14). Nicht angetastet.

## Root-Cause „ständige Last-Probleme" (für User-Bericht)
- VPS (3.7 GB RAM) = Produktion UND Drone-CI-Buildmaschine zugleich; jeder main-Commit
  triggert kompletten Rebuild aller 4 Services (landing/docs/api/web) auf dem Prod-Host;
  der vite/web-Build sprengt den RAM → Swap-Thrash → SSH timeouts.
- Empfehlungen: (a) Builds auslagern (GitHub Actions bauen Images, VPS nur pull + up -d),
  (b) RAM aufstocken, (c) Swap vergrößern.
