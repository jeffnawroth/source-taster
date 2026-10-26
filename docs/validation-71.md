# Issue #71 implementation evidence

Validated locally on 2026-10-26 in the isolated `t3/walking-skeleton` worktree, based on `spec/70-launch-product` at `2d3b6651b9b6e189d79d575f67810c4ad60f0f67`. The previous `ticket/71-walking-skeleton` commits through `fa9eaa0` were merged first and extended, including the previously failing SSE tests. No predecessor code was read.

## Acceptance coverage

- Workspace: frozen pnpm 12.15 install; TypeScript 7 typecheck with TypeScript 6 compiler API tooling; ESLint/Prettier; complete server and React/Vite builds. PostgreSQL 18, Prisma 7.10.1 and pg-boss 12 run together. Router/Query, React Aria, Tailwind and locally compiled Paraglide are used by the web flow.
- Licensing and distribution: the two transport packages are `AGPL-3.0-or-later OR MIT`; the server/UI remain AGPL. Built JS/declarations and transport-generated OpenAPI are committed. A standalone consumer installed the verification package from this local git repository at **d2633dc** with pnpm's commit + `path:/packages/contract-verification` selector. Schema, route, OpenAPI and SSE-reader imports passed without AGPL implementation or workspace dependencies. The final branch descends from that tested code; the remote GitHub selector is documented for use after the parent pushes the reviewed commit. No registry publishing or PR was performed.
- Execution: real PostgreSQL HTTP tests run separate web and worker processes with an isolated role/database and the program's own schemas. HTTP creation commits one job per Reference slot atomically with the Check. Placeholder completion writes Status **not-checked**, never a Verdict.
- Events: the recovered ordered/replay/terminal-cursor contract tests pass. Snapshot, malformed/future cursor and unknown-Check Problem Details tests pass. A compiled-process smoke check created a Check while the worker was stopped, restarted the web process, then started the compiled worker: replay from cursor 1 returned `[2, 3]` and the final snapshot was ended.
- Mode: manual public process-start checks covered missing, unknown and hosted mode on both web and worker; all six refused startup with exit 78 before a database connection. The application test suite stays at the approved HTTP/SSE and browser seams.
- UI: three Chromium Playwright tests pass. DE and EN both cover the example, disabled empty/whitespace input, running → finished per-Reference Status, and language switching while a stream is active. The third test truncates the first SSE response, requiring the fetch client to reconnect and recover both Reference updates. Axe finds no violations in the initial and finished pages in either language. Desktop (1280×900) and mobile (390×844) screenshots were visually inspected.
- CI: added checksum-pinned GitHub Actions for typecheck, lint, catalog completeness, build/artifact consistency, real PostgreSQL contract tests, Chromium/axe and dependency checks. Both change-triggered and daily dependency jobs are configured. These workflows have **not** yet run on GitHub because the branch has not been pushed.
- Test seams: **14 HTTP/SSE tests and 3 browser tests**. No assertions inspect tables, queue names, internal calls or logs. Operational CLI smoke checks and scanner qualification are recorded separately from the application tests.

## Dependency checks

The actual OSV-Scanner 2.7.0 offline scan recognized and reconciled **522/522** locked npm packages across both documents of pnpm 12's lockfile, with **0 advisory findings**. The npm database response was last modified **2026-10-26 11:48:32 UTC**. The installed-package license scan reviewed **388** packages, distinguishing **67** runtime packages. See [dependency policy](dependency-policy.md) for development-only MPL/EPL tooling and inventory limits.

Negative CLI controls were also exercised: synthetic critical advisory, empty scanner inventory, scanner exit error and a stale-database age bound each exited non-zero. The clean scan was rerun afterwards and passed. Controls used only synthetic findings and temporary files; no real advisory was suppressed.

## Boundaries and remaining qualification

This is the requested walking skeleton, not launch verification. Real Structuring/search/Verdicts, hosted authorization, cancellation/leases and retention enforcement belong to later tickets. Node 26 needs qualification after its LTS transition. The full multi-browser/extension release matrix, Dependabot pnpm 12 update behavior, legal review, transitive 0.x maturity interpretation and full ADR-0015 security gates remain launch qualification. No analytics or translation service receives Reference content; the browser persists only language, and server operational logs use fixed codes/IDs rather than content.

The existing PostgreSQL container on 5433 was reused. Test databases/roles had unique per-run names; only resources created by this run were removed. Unrelated containers on 8000 and 4567 and unrelated empty/untracked directories were left alone.
