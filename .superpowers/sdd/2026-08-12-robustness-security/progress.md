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
