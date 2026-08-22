# ADR-0018: Remove Observability, Tracing and Logging Entirely

> Status: accepted
> Date: 2026-08-22

## Context

The observability and tracing stack is removed in full, to be rebuilt from
scratch at a later point. This was an explicit product decision, confirmed twice
when the scope was questioned: **including `pino`**, and **including all log
statements**, not only the telemetry export.

ADR-0017 had proposed a partial reduction — remove `cadvisor` (no dashboard
consumed its metrics), pin the remaining seven images, and bind their ports to
`127.0.0.1`. **That proposal is superseded by this decision** and was never
implemented; it remains at status `proposed` and is not edited, per the
repository rule that superseded records stay as written.

What existed before this change:

| Layer | Extent |
|---|---|
| Containers | 7 — cadvisor, prometheus, loki, promtail, otel-collector, tempo, grafana (780 MiB, observing a 173 MiB product) |
| Stack config | 5 YAML files plus 8 Grafana files (datasources, alerting, 3 dashboards) |
| Dependencies | 12 — 7 × `@opentelemetry/*`, `@hono/otel`, `prom-client`, `pino`, `pino-loki`, `pino-abstract-transport`, `pino-pretty` |
| Application code | 89 `logger.*` calls in 13 files, a 180-line Prometheus registry, manual tracing spans in 3 files |

## Decision

Everything above is removed. The API emits no telemetry and writes no logs.

### Accepted consequence, stated plainly

**Production errors are now visible only through HTTP status codes.** There is
no access log, no error log, and no shutdown log. `docker logs` on the API
container is silent. This was raised before implementation and confirmed.

### What was deliberately preserved

- **`/health`** — the Docker healthcheck in `docker-compose.yml` depends on it.
  Only `/metrics` was removed from `healthRouter`.
- **`registerOnError`'s error contract** — every status code and every
  `{ success, error, message }` shape is unchanged. Only the log lines inside it
  are gone.
- **Control flow.** In all 20 `catch` blocks where a log was the only statement,
  the error was already being swallowed; removing the log changed visibility,
  not behaviour.
- **`endSql().catch(...)` in `shutdown.ts`** was rewritten to `.catch(() => {})`
  rather than deleted. Removing the handler would have converted a swallowed
  rejection into an unhandled one — a real behavioural change disguised as a
  deletion.

### Dead code the removal exposed

Several constructs existed only to feed telemetry and became provably unused:

- `openAlexProvider.checkRateLimit()` — the whole method, once its warning log
  was gone, read four headers and did nothing with them. Removed along with its
  two call sites.
- The Crossref rate-limit block — same shape, same outcome.
- `baseAIProvider.getProviderName()` — its own comment said "for metrics
  labels".
- `if (response.usage) { }` in `baseAIProvider` — recorded token usage only.
- Three `const start = Date.now()` timers and a `try/catch` in
  `anystyleController` that had degenerated into `catch (e) { throw e }`.

Leaving any of these would have meant shipping code that reads state and
discards it.

## Alternatives

- **Keep `pino` for stdout logging, remove only the telemetry export.** This was
  recommended and explicitly rejected by the product owner. The stated reason —
  the area will be rebuilt from scratch — makes a clean slate more valuable than
  a partial one that would have to be unwound.
- **Replace the 89 calls with `console.*`.** Also offered and rejected for the
  same reason.
- **Introduce a thin in-house logger with no dependency.** Rejected: it would
  preserve the abstraction while removing only the library, leaving another
  layer to remove during the rebuild.
- **ADR-0017's partial reduction.** Superseded — it addressed footprint and
  privilege, not the decision to rebuild.

## Consequences

- The API's runtime dependency count drops by 136 packages once transitives are
  resolved.
- Six ports are freed on the host: 3000, 3100, 3200, 4318, 8082, 9090. The
  running containers disappear at the next deploy, which already executes
  `docker compose up -d --remove-orphans`.
- The secret-redaction paths in the deleted `logger.ts` (`authorization`,
  `*.apiKey`, `*.token`) are gone. This is **not** a security regression: the
  call sites logged narrow, explicit fields (`{ userId, provider, operation }`)
  and error objects, never headers or key material — verified before removal.
- One orphaned anonymous Prometheus volume remains on the host after the deploy
  and holds the historical metrics. It is left in place pending explicit
  confirmation.
- **A correction worth recording:** the plan for this change asserted that empty
  `catch` blocks would pass lint, citing `no-empty: allowEmptyCatch` and
  `no-unused-vars: caughtErrors: "none"`. That was wrong in effect — the
  TypeScript config disables `no-unused-vars` and `unused-imports/no-unused-vars`
  takes over, which does flag an unused `error` binding. The fix was optional
  catch binding (`catch {`) in 26 places. Checking the base rule but not which
  rule actually applies is the kind of verification that looks rigorous and
  is not.
