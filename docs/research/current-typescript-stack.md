# Research: current TypeScript stack

- Ticket: [Current TypeScript stack (#25)](https://github.com/jeffnawroth/source-taster/issues/25), input to [Tech stack (#26)](https://github.com/jeffnawroth/source-taster/issues/26)
- Research date: 2026-10-24. All versions and dates were retrieved on this date.
- Baseline: [requirements specification v3.1](../requirements-specification.md) and [GLOSSARY.md](../../GLOSSARY.md)
- Status: **recommendation only.** The client makes the final decision in #26. Nothing here is scaffolded.

## How to read this document

- **Verified** means the claim comes from a primary source linked next to it: the npm registry, official documentation, release notes, a support/LTS policy or a license file.
- **Opinion** means the author's assessment. It is always labeled.
- **Unknown** means it could not be verified with primary sources in this pass.
- Version, release date and license-field data come from the npm registry JSON document of each package, `https://registry.npmjs.org/<package>`: the `dist-tags.latest` entry, the `time` map and `versions[<latest>].license`. Engines and peer dependencies come from `https://registry.npmjs.org/<package>/<version>`. The registry `license` field is publisher metadata, not the license text; section 5 spot-checks the license files.

## 1 Bar applied

These criteria come from #25 and the decision map in #4.

1. TypeScript end to end (fixed).
2. Stable, actively maintained releases. No pre-1.0 **core** component, meaning anything the product's code is structured around.
3. Strong typing across the API boundary, the database and the UI.
4. Documentation and tooling that suit agent work. A machine-readable `llms.txt` is used only as a dated heuristic, not as a quality score.
5. A familiar ecosystem.
6. Compatible with AGPL-3.0, because section 14.6 puts the verification core, extension, web app and shared data models under AGPL-3.0.
7. UI shared between the browser extension and the web app (FA-GLE-01 to FA-GLE-05).
8. Minimal operations with EU hosting (FA-UEB-13, FA-UEB-44, FA-UEB-45).

## 2 Version snapshot (verified, npm registry, 2026-10-24)

"Latest" is the npm `latest` dist-tag unless noted otherwise. The date is when that exact version was published. "Major since" is the publish date of the first release of the current major line. Each package row cites `https://registry.npmjs.org/<package>`.

The full tables follow by area in section 3. Two registry traps were found and are handled there:

- The `prisma` CLI package's `latest` tag points to `8.0.0-rc.27`, a release candidate, while `@prisma/client` `latest` is the stable `7.10.1` ([registry: prisma](https://registry.npmjs.org/prisma), [registry: @prisma/client](https://registry.npmjs.org/@prisma/client)). `npm install prisma` without a version would therefore install a pre-release today.
- `@tanstack/react-start` has carried 1.x version numbers on npm since early 2025, but the project only declared Start stable on 2026-10-13 ([TanStack blog](https://tanstack.com/blog/tanstack-start-1-0)). The version number alone does not show stability.

## 3 Findings by area

### 3.1 Runtime

| Runtime | Version | Released | Status | Source |
|---|---|---|---|---|
| Node.js 26 | 26.12.1 | 2026-10-21 | "Current". Becomes Active LTS on **2026-10-28**, maintenance from 2027-10-20, end of life 2029-04-30 | [schedule.json](https://raw.githubusercontent.com/nodejs/Release/main/schedule.json), [dist index](https://nodejs.org/dist/index.json) |
| Node.js 24 "Krypton" | 24.22.1 | 2026-10-20 | Maintenance LTS since 2026-10-20, end of life 2028-04-30 | same |
| Node.js 22 "Jod" | 22.23.4 | 2026-10-20 | Maintenance LTS, end of life 2027-04-30 | same |
| Bun | 1.4.4 | 2026-10-22 | Stable | [GitHub releases](https://github.com/oven-sh/bun/releases) |
| Deno | 2.9.8 | 2026-10-21 | Stable | [GitHub releases](https://github.com/denoland/deno/releases) |

Verified:

- Node.js 27 enters alpha on 2026-10-28 and is released on 2027-04-22 ([schedule.json](https://raw.githubusercontent.com/nodejs/Release/main/schedule.json)).
- Node.js runs TypeScript files natively by type stripping. The feature is "Stability: 2 - Stable" ([Node.js TypeScript docs, v26](https://nodejs.org/api/typescript.html)). The same page lists the limits:
  - Only erasable syntax is supported. Enums, namespaces with runtime code, parameter properties and decorators are not.
  - tsconfig `paths` is not read. Use `package.json` `#` subpath imports instead.
  - Imports must carry the `.ts` extension, and type-only imports need `import type`.
  - `.tsx` is not supported, and Node.js refuses to strip TypeScript files inside `node_modules`.
  - The page recommends the compiler options `erasableSyntaxOnly` and `verbatimModuleSyntax`.

Opinion:

- **Node.js 26** is the best target. It becomes Active LTS four days after the research date and is supported until 2029-04-30, which covers the first release and several years of operation. Node.js 24 is the fallback if a dependency is not yet Node 26 ready. Node 24 is already in maintenance, so it only receives critical fixes.
- Bun and Deno are mature and fast. Every library in this document targets Node.js first, though, and most managed EU hosts offer Node.js as the default runtime (#22). Node.js is the lower-risk choice for minimal operations.
- Native type stripping lets the backend run `.ts` files directly in development and in scripts, without a build step. It rules out decorator-based frameworks such as NestJS unless they keep a separate compile step (section 3.5).

### 3.2 TypeScript itself and the tooling constraint

| Package | Version | Released | License | Source |
|---|---|---|---|---|
| `typescript` | **7.0.2** | 2026-07-08 | Apache-2.0 | [registry](https://registry.npmjs.org/typescript) |
| `typescript` 6.0 line | 6.0.3 | 2026-04-16 | Apache-2.0 | same |
| `typescript` next | 7.1.0-beta | 2026-10-20 | — | same |
| `@typescript/typescript6` | 6.0.2 | 2026-07-06 | Apache-2.0 | [registry](https://registry.npmjs.org/@typescript/typescript6) |

Verified ([Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)):

- TypeScript 7.0 is the native port of the compiler to Go. It is about 8–12 times faster than 6.0.
- New defaults include `strict: true`, `module: esnext`, `rootDir: ./` and `types: []`. Options deprecated in 6.0 are now hard errors: `baseUrl`, `moduleResolution` `node`/`node10`/`classic`, `target: es5` and others.
- **TypeScript 7.0 does not ship a compiler API.** A new and different API is planned for 7.1. Until then, tools that embed the TypeScript API, named in the post as Vue, MDX, Astro and Svelte tooling, "can only currently rely on TypeScript 6.0".
- The `@typescript/typescript6` package provides `tsc6` and re-exports the 6.0 API, so 6.0 and 7.0 can be installed side by side. The post suggests this aliasing:

  ```json
  "@typescript/native": "npm:typescript@^7.0.2",
  "typescript": "npm:@typescript/typescript6@^6.0.2"
  ```

- typescript-eslint supports TypeScript `>=4.8.4 <6.1.0` ([dependency versions](https://typescript-eslint.io/users/dependency-versions/)). Type-aware ESLint rules therefore still need TypeScript 6.
- oxlint's type-aware linting runs on typescript-go through `oxlint-tsgolint` and **requires TypeScript 7.0+** ([Oxc type-aware linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html), [registry](https://registry.npmjs.org/oxlint-tsgolint), 7.0.2005, 2026-10-22). It covers 59 of 61 typescript-eslint type-aware rules. The page does not label it stable and lists incomplete rule coverage and high memory use on large codebases. It does not support `baseUrl`, and in monorepos the referenced packages must have `.d.ts` output built.
- `@sveltejs/kit` 3.1.0 has the peer dependency `typescript: ^6.0.0` ([registry](https://registry.npmjs.org/@sveltejs/kit/3.1.0)). This confirms the TS 6 binding in practice.

Three realistic setups exist:

| Setup | What it means | Trade-off |
|---|---|---|
| (a) TS 7 for type checking, TS 6 alongside | `tsc` from 7.0.2 checks the build. `@typescript/typescript6` serves typescript-eslint and any tool that needs the compiler API | Fast checks; two compilers to keep in sync. This is the path Microsoft documents |
| (b) TS 6.0.3 throughout | One compiler, everything compatible | Slower; 6.0 is the last JavaScript-based line |
| (c) TS 7 plus oxlint type-aware | No TS 6 at all | The type-aware linter is not labeled stable (bar item 2) |

Opinion:

- Choose **setup (a)** and write code that also compiles under 6.0 (`erasableSyntaxOnly`, `verbatimModuleSyntax`, no `baseUrl`). Setup (b) is the conservative fallback. Revisit when TypeScript 7.1 ships its API and typescript-eslint supports it.
- This constraint is a verified tie-breaker for the UI framework. React's TSX is checked by `tsc` itself. Vue, Svelte and Astro templates need language tooling that is bound to TypeScript 6 today (section 3.4).

### 3.3 Package manager and monorepo

| Package | Version | Released | Major since | License | Source |
|---|---|---|---|---|---|
| `pnpm` | 12.15.0 | 2026-10-21 | 2026-08-26 | MIT | [registry](https://registry.npmjs.org/pnpm), [v12.0.0 release](https://github.com/pnpm/pnpm/releases) |
| `turbo` (Turborepo) | 2.11.10 | 2026-10-20 | — | MIT | [registry](https://registry.npmjs.org/turbo) |
| `nx` | 24.0.1 | 2026-10-23 | 2026-10-21 | MIT | [registry](https://registry.npmjs.org/nx) |

Verified:

- pnpm 12 requires Node.js 18 or later (`engines`) and rejects unknown settings in `pnpm-workspace.yaml` ([registry](https://registry.npmjs.org/pnpm/12.15.0), [release notes](https://github.com/pnpm/pnpm/releases)).
- Nx 24.0.0 was published two days before the research date.

Opinion:

- **pnpm workspaces plus Turborepo** fit a small team with one web app, one extension and a few shared packages. The open-core split in section 14.6 (AGPL packages and proprietary packages) maps onto workspace packages, but the repository layout belongs to #12.
- Nx 24 is a strong alternative if code generators and enforced module boundaries are wanted. Its new major is only days old.

### 3.4 Web framework

| Package | Version | Released | Major since | License | Source |
|---|---|---|---|---|---|
| `react`, `react-dom` | 19.3.1 | 2026-10-14 | — | MIT | [registry](https://registry.npmjs.org/react) |
| `vite` | 8.3.5 | 2026-10-21 | 2026-03-12 | MIT | [registry](https://registry.npmjs.org/vite) |
| `@vitejs/plugin-react` | 6.1.2 | 2026-10-05 | 2026-03-12 | MIT | [registry](https://registry.npmjs.org/@vitejs/plugin-react) |
| `@tanstack/react-router` | 1.170.46 | 2026-10-22 | — | MIT | [registry](https://registry.npmjs.org/@tanstack/react-router) |
| `@tanstack/router-plugin` | 1.168.48 | 2026-10-22 | — | MIT | [registry](https://registry.npmjs.org/@tanstack/router-plugin) |
| `@tanstack/react-start` | 1.169.4 | 2026-10-22 | stable since 2026-10-13 | MIT | [registry](https://registry.npmjs.org/@tanstack/react-start), [blog](https://tanstack.com/blog/tanstack-start-1-0) |
| `@tanstack/react-query` | 5.104.5 | 2026-10-19 | 2023-10-17 | MIT | [registry](https://registry.npmjs.org/@tanstack/react-query) |
| `@tanstack/react-form` | 1.33.5 | 2026-08-11 | 2025-03-02 | MIT | [registry](https://registry.npmjs.org/@tanstack/react-form) |
| `react-router` | 8.5.0 | 2026-10-19 | 2026-06-17 | MIT | [registry](https://registry.npmjs.org/react-router) |
| `next` | 16.4.3 | 2026-10-23 | 2025-10-22 | MIT | [registry](https://registry.npmjs.org/next) |
| `vue` / `nuxt` | 3.5.44 / 4.6.2 | 2026-10-13 / 2026-10-16 | 2020-09-18 / 2025-07-15 | MIT | [vue](https://registry.npmjs.org/vue), [nuxt](https://registry.npmjs.org/nuxt) |
| `svelte` / `@sveltejs/kit` | 5.57.2 / 3.1.0 | 2026-10-06 / 2026-10-14 | 2024-10-19 / 2026-10-01 | MIT | [svelte](https://registry.npmjs.org/svelte), [kit](https://registry.npmjs.org/@sveltejs/kit) |
| `astro` | 7.4.2 | 2026-10-21 | 2026-06-22 | MIT | [registry](https://registry.npmjs.org/astro) |

Verified:

- Vite 8 uses Rolldown as its single bundler and Oxc for transforms. It needs Node.js 20.19+ or 22.12+ ([Announcing Vite 8](https://vite.dev/blog/announcing-vite8), 2026-03-12).
- Vite's support policy gives regular patches to 8.3, backports important fixes and security patches to 7.3 and 8.2, and backports only security fixes to 6.4 and 8.1 ([Vite releases](https://vite.dev/releases)).
- `@tanstack/react-router` 1.170.46 needs Node.js 20.19 or later (`engines`, [registry](https://registry.npmjs.org/@tanstack/react-router/1.170.46)).
- TanStack declared Start 1.0 stable on 2026-10-13. The post frames stability as an API commitment and builds Start on Vite and Nitro, with React Server Components as an optional integration ([TanStack blog](https://tanstack.com/blog/tanstack-start-1-0)). It does not state a semver or support-window policy.
- React Router 8 needs Node.js 22.22.0 or later and React 19.2.7 or later ([registry](https://registry.npmjs.org/react-router/8.5.0)).
- SvelteKit 3.1.0 has the peer dependencies `typescript ^6.0.0` and `vite ^8.0.12` ([registry](https://registry.npmjs.org/@sveltejs/kit/3.1.0)).

Opinion:

- **React 19.3 + Vite 8.3 + TanStack Router 1.170 as a client-rendered single-page app.** Reasons:
  - The browser extension's popup and side panel (FA-KON-04) are client-only pages. A client-rendered web app can share the same component packages, routes and data hooks with the extension without a server-rendering layer in between (FA-GLE-01 to FA-GLE-05, FA-ERF-03). The extension packaging itself belongs to #9.
  - TanStack Router gives fully typed routes, path parameters and search parameters. It is a 1.x line with daily releases.
  - React has the largest ecosystem and the most agent training data. Its TSX is checked by TypeScript 7 directly, without the TS 6 binding that Vue, Svelte and Astro tooling still have (section 3.2).
  - The web app sits behind sign-in for most screens. Public pages that need search indexing can be a separate static site (see below).
- Alternatives:
  - **TanStack Start 1.x** adds server rendering and server functions on the same router. It has been stable for 11 days, so treat it as an upgrade path, not a starting point.
  - **React Router 8 framework mode**: mature, but its server model adds a second server next to the API.
  - **Next.js 16**: largest ecosystem, but its full feature set is easiest on Vercel. Self-hosting in the EU (#10, #22) needs more care, and the API would still need its own versioned surface (FA-ERW-04).
  - **Vue 3.5 / Nuxt 4** and **Svelte 5 / SvelteKit 3** are mature and pleasant. Their type checking depends on TypeScript 6 until TS 7.1 delivers an API. SvelteKit 3 is also only three weeks old.
- **Astro 7** is a good fit for the public information pages and documentation, if those are separate from the app. This is optional and outside the core.

### 3.5 Backend framework and API

| Package | Version | Released | License | Note | Source |
|---|---|---|---|---|---|
| `hono` | 4.13.13 | 2026-10-04 | MIT | `next` tag is 5.0.0-rc.1 | [registry](https://registry.npmjs.org/hono) |
| `@hono/node-server` | 2.1.5 | 2026-10-13 | MIT | Node.js ≥ 20; peer `hono ^4 \|\| ^5.0.0-0` | [registry](https://registry.npmjs.org/@hono/node-server) |
| `@hono/zod-openapi` | 1.6.3 | 2026-09-04 | MIT | peer `zod ^4.0.0`, `hono >=4.10.0`; depends on `@hono/zod-validator` 0.9.1 | [registry](https://registry.npmjs.org/@hono/zod-openapi/1.6.3) |
| `fastify` | 5.12.7 | 2026-10-13 | MIT | `next` tag is 6.0.0-alpha.5 | [registry](https://registry.npmjs.org/fastify) |
| `@nestjs/core` | 12.2.0 | 2026-10-19 | MIT | 12.0.0 published 2026-08-27 | [registry](https://registry.npmjs.org/@nestjs/core) |
| `@orpc/server` | 1.16.1 | 2026-10-22 | MIT | 2.0.0 in beta | [registry](https://registry.npmjs.org/@orpc/server) |
| `@trpc/server` | 11.19.0 | 2026-09-16 | MIT | — | [registry](https://registry.npmjs.org/@trpc/server) |
| `elysia` | 1.4.30 | 2026-08-26 | MIT | 2.0 in rc/beta; Bun-first | [registry](https://registry.npmjs.org/elysia) |
| `zod` | 4.6.7 | 2026-10-12 | MIT | — | [registry](https://registry.npmjs.org/zod) |
| `valibot` | 1.5.0 | 2026-09-09 | MIT | — | [registry](https://registry.npmjs.org/valibot) |
| `@standard-schema/spec` | 1.1.0 | 2025-12-15 | MIT | — | [registry](https://registry.npmjs.org/@standard-schema/spec) |

Verified:

- `@hono/zod-openapi` provides the `OpenAPIHono` class. Routes are declared with `createRoute` and registered with `app.openapi`, and `app.doc('/doc', …)` serves the generated OpenAPI document ([Hono: Zod OpenAPI](https://hono.dev/examples/zod-openapi)).
- Hono RPC "allows sharing of the API specifications between the server and the client". The `hc<AppType>` client infers request and response types from the server's route types. The guide's caveats ([Hono RPC](https://hono.dev/docs/guides/rpc)):
  - Both sides need `strict` mode.
  - Server and client must use the same Hono version.
  - The editor slows down with many routes. The guide suggests compiling the types ahead with `tsc` or using `hcWithType`.
- Hono's `streamSSE` helper (from `hono/streaming`) writes events with `writeSSE({ data, event, id })` and exposes `stream.aborted` ([Hono streaming helper](https://hono.dev/docs/helpers/streaming)).

Opinion:

- **Hono 4.13 on `@hono/node-server` 2, with `@hono/zod-openapi` and Zod 4.**
  - FA-ERW-04 asks for a versioned API with a uniform error format that can later open to third parties. An OpenAPI document generated from the same Zod schemas gives third parties a contract, while `hc` gives the own web app and extension a typed client with no code generation.
  - Hono is small, has no decorators (so it fits Node.js type stripping, section 3.1) and runs on every runtime and host.
  - Watch item: Hono 5 is at rc.1. Plan a 4 → 5 upgrade within the first year. `@hono/zod-validator`, pulled in transitively, is still 0.9.x; it is not a structural dependency of the product code.
- Alternatives:
  - **Fastify 5**: the most mature Node.js server, with a JSON-schema and OpenAPI plugin ecosystem. Its typing of routes to clients is weaker than Hono RPC.
  - **oRPC 1.x**: typed RPC with first-class OpenAPI output. A good fit, but a smaller ecosystem and a 2.0 beta already in progress.
  - **tRPC 11**: excellent typed client, but it is RPC-shaped, not resource-shaped. That makes it less suitable for the third-party API in FA-ERW-04.
  - **NestJS 12**: structured and familiar to enterprise teams, but built on decorators, which Node.js type stripping does not support ([Node.js TypeScript docs](https://nodejs.org/api/typescript.html)). It would need a separate compile step.
  - **Elysia**: Bun-first, and its next major is in release candidate.

### 3.6 Database and data access

| Package | Version | Released | Major since | License | Source |
|---|---|---|---|---|---|
| PostgreSQL 18 | 18.6 | not on the policy page | 2025-09-25 | PostgreSQL License | [versioning policy](https://www.postgresql.org/support/versioning/) |
| `@prisma/client` | **7.10.1** | 2026-10-15 | 2025-11-19 | Apache-2.0 | [registry](https://registry.npmjs.org/@prisma/client), [GitHub release 7.10.1](https://github.com/prisma/prisma/releases) |
| `@prisma/adapter-pg` | 7.10.1 | 2026-10-15 | 2025-11-19 | Apache-2.0 | [registry](https://registry.npmjs.org/@prisma/adapter-pg) |
| `prisma` (CLI) | 7.10.1 stable; `latest` tag = 8.0.0-rc.27 | 2026-10-15 (7.10.1) | — | Apache-2.0 | [registry](https://registry.npmjs.org/prisma) |
| `typeorm` | 1.1.2 | 2026-10-08 | 2026-05-19 | MIT | [registry](https://registry.npmjs.org/typeorm) |
| `@mikro-orm/core` | 7.2.5 | 2026-10-09 | 2026-03-11 | MIT | [registry](https://registry.npmjs.org/@mikro-orm/core) |
| `pg` (node-postgres) | 8.23.1 | 2026-09-30 | — | MIT | [registry](https://registry.npmjs.org/pg) |
| `postgres` (Postgres.js) | 3.4.9 | 2026-04-05 | — | Unlicense | [registry](https://registry.npmjs.org/postgres) |
| `slonik` | 49.12.0 | 2026-10-24 | — | BSD-3-Clause | [registry](https://registry.npmjs.org/slonik) |

Excluded as pre-1.0 core components (bar item 2):

- `drizzle-orm` 0.45.4 (1.0.0-rc.5 published 2026-10-21) and `drizzle-kit` 0.31.11 ([registry](https://registry.npmjs.org/drizzle-orm), [drizzle-kit](https://registry.npmjs.org/drizzle-kit)).
- `kysely` 0.29.7 ([registry](https://registry.npmjs.org/kysely)).
- `@electric-sql/pglite` 0.5.11 ([registry](https://registry.npmjs.org/@electric-sql/pglite)).
- `@pgtyped/runtime` 2.4.2 is ≥ 1.0 but its last release is from 2025-02, so it is not actively maintained ([registry](https://registry.npmjs.org/@pgtyped/runtime)).

Verified:

- PostgreSQL supports each major version for five years. 18 is current (18.6), 17 is at 17.11, and 14 reaches end of life on 2026-11-12. PostgreSQL 18 receives fixes until 2030-11-14 ([versioning policy](https://www.postgresql.org/support/versioning/)). A `REL_19_RC1` tag exists, so PostgreSQL 19 is imminent.
- Prisma 7 removed the Rust query engine. Its ESM `prisma-client` generator requires a driver adapter such as `@prisma/adapter-pg`, and the release notes report about 90% smaller bundles. It supports Node.js `^20.19 || ^22.12 || >=24` ([Prisma releases](https://github.com/prisma/prisma/releases), [registry](https://registry.npmjs.org/@prisma/client/7.10.1)).
- The Prisma 8 release candidates on GitHub are marked as pre-releases and carry breaking changes from one RC to the next. The repository has moved to `prisma/orm` ([GitHub releases](https://github.com/prisma/prisma/releases)).

Opinion:

- **PostgreSQL 18 as a managed EU service** (#10, #22). One relational database covers accounts, Checks, References, Verdicts, Quotas and the job queue (section 3.7). This keeps operations minimal and makes backup and restore one problem (FA-UEB-45).
- **Prisma 7.10.1 with `@prisma/adapter-pg`.** It is the most familiar typed ORM, with schema-first migrations and generated types. Pin `prisma`, `@prisma/client` and the adapter to the same exact version so the 8.0 RC on `latest` is never installed by accident. Treat Prisma 8 as a planned migration once it is stable.
- Alternatives:
  - **node-postgres 8 with hand-written SQL** and Zod-validated rows: no ORM risk, but more manual typing.
  - **MikroORM 7** or **TypeORM 1.1**: stable. Both are commonly used with decorator-based entity definitions, which would need a compile step (section 3.1). This was not re-verified in their documentation.
  - **Drizzle** is the closest modern competitor. Re-evaluate when 1.0 is final.

### 3.7 Job execution for Checks

| Package | Version | Released | Major since | License | Needs | Source |
|---|---|---|---|---|---|---|
| `pg-boss` | 12.38.0 | 2026-10-13 | 2025-11-09 | MIT | PostgreSQL 13+, Node.js 22.12+ or Bun | [registry](https://registry.npmjs.org/pg-boss), [README](https://github.com/timgit/pg-boss) |
| `bullmq` | 6.4.1 | 2026-10-23 | 2026-07-30 | MIT | Redis | [registry](https://registry.npmjs.org/bullmq) |
| `@temporalio/worker` | 1.24.0 | 2026-09-15 | 2022-07-26 | MIT | Temporal server or Temporal Cloud | [registry](https://registry.npmjs.org/@temporalio/worker) |
| `@trigger.dev/sdk` | 4.8.1 | 2026-10-23 | 2025-08-18 | MIT | Trigger.dev cloud or self-hosted platform | [registry](https://registry.npmjs.org/@trigger.dev/sdk) |
| `inngest` | 4.26.0 | 2026-10-22 | 2026-03-16 | Apache-2.0 | Inngest cloud or self-hosted server | [registry](https://registry.npmjs.org/inngest) |

Excluded as pre-1.0: `graphile-worker` 0.18.0 ([registry](https://registry.npmjs.org/graphile-worker)).

Verified ([pg-boss README](https://github.com/timgit/pg-boss)):

- pg-boss uses `SKIP LOCKED` to distribute jobs safely between workers.
- Jobs can be created inside an existing database transaction, with adapters for Prisma and other clients.
- It supports LISTEN/NOTIFY for low-latency delivery, cron and RRULE schedules, priorities, retries, dead-letter queues, pub/sub, OpenTelemetry and multiple active instances. A dashboard package exists.

Opinion:

- **pg-boss 12 on the same PostgreSQL.** A Check that runs for several minutes over up to 1,000 References (FA-ERF-12) should not run inside an HTTP request. pg-boss gives retries, concurrency limits per queue (FA-SUC-07, FA-UEB-40 to FA-UEB-43) and later background Checks (FA-ERF-09) without a second stateful service. Creating the Check row and its job in one transaction avoids orphaned Checks. Cancellation (FA-SUC-08) can be a status flag that workers poll between References.
- Alternatives:
  - **BullMQ 6 with Redis**: higher throughput and a mature dashboard, but Redis is a second service to run, back up and host in the EU.
  - **Temporal, Trigger.dev or Inngest**: durable workflows with good tooling. Their managed services add a data processor whose EU residency was not verified in this pass (Unknown, #10).
- The concrete design of the Check pipeline, its states and its cancellation semantics belongs to #14 and #21. Search latency and parallelism per Data source belong to #16.

### 3.8 Progress streaming

Verified ([WHATWG HTML, server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html)):

- The `EventSource(url, { withCredentials })` constructor accepts only that one option. A browser `EventSource` therefore cannot send an `Authorization` header; it relies on cookies.
- The spec warns that clients limit connections per server and suggests a shared worker for several tabs.
- Legacy proxies can drop idle connections. The spec suggests sending a comment line (`:`) about every 15 seconds.
- Chunked-encoding and buffering intermediaries can delay events.
- On reconnect the browser sends the `Last-Event-ID` header, which the server can use to resume.
- Hono supports this through `streamSSE` (section 3.5).

Opinion:

- **Server-sent events over HTTP/2** for Check progress (FA-SUC-07). Progress flows only from server to client, SSE reconnects by itself, and it passes through ordinary HTTP infrastructure. WebSockets are not needed.
- Design notes for #21:
  - HTTP/2 avoids the per-host connection limit of HTTP/1.1.
  - Send a heartbeat comment every 15 seconds, and disable response buffering at the reverse proxy.
  - Give every event an `id` so a reconnect can resume from `Last-Event-ID`.
  - Cancellation (FA-SUC-08) is a separate `POST`/`DELETE` request; SSE is one-way.
  - With more than one API instance, workers must publish progress where every instance can see it. PostgreSQL LISTEN/NOTIFY is enough at this scale.
  - If the extension cannot send cookies to the API origin, use a `fetch`-based SSE reader that can set an `Authorization` header instead of `EventSource`. This depends on #9 and #11.

### 3.9 Accessible UI components and styling

| Package | Version | Released | Major since | License | Source |
|---|---|---|---|---|---|
| `react-aria-components` | 1.22.1 | 2026-10-09 | 2023-12-20 | Apache-2.0 | [registry](https://registry.npmjs.org/react-aria-components) |
| `@base-ui/react` | 1.9.0 | 2026-10-09 | 2025-12-11 | MIT | [registry](https://registry.npmjs.org/@base-ui/react) |
| `radix-ui` | 1.8.1 | 2026-10-12 | — | MIT | [registry](https://registry.npmjs.org/radix-ui) |
| `shadcn` (CLI) | 4.22.1 | 2026-10-18 | 2026-03-06 | MIT | [registry](https://registry.npmjs.org/shadcn) |
| `tailwindcss` | 4.3.3 | 2026-07-16 | 2025-01-21 | MIT | [registry](https://registry.npmjs.org/tailwindcss) |
| `reka-ui` (Vue) | 2.11.0 | 2026-10-05 | 2025-02-20 | MIT | [registry](https://registry.npmjs.org/reka-ui) |
| `bits-ui` (Svelte) | 2.20.2 | 2026-10-23 | — | MIT | [registry](https://registry.npmjs.org/bits-ui) |

Verified:

- React Aria follows the WAI-ARIA specification and the ARIA Authoring Practices Guide. Adobe states its components are "tested across a wide variety of devices, browsers, and screen readers". It ships localized strings for more than 30 languages and supports right-to-left layouts ([React Aria quality](https://react-aria.adobe.com/quality.md)).
- Base UI is published as `@base-ui/react`. The older `@base-ui-components/react` name only carries release candidates ([registry](https://registry.npmjs.org/@base-ui/react)).

Opinion:

- **React Aria Components 1.22 with Tailwind CSS 4.3.** FA-UEB-04 requires WCAG 2.2 AA. React Aria has the most documented accessibility testing of the headless libraries, and its built-in German and English strings for things like date pickers suit FA-UEB-01. Tailwind keeps styles in the components, so the extension and the web app render the same styles from one package (FA-GLE-01 to FA-GLE-05), and it handles the 360 px layout (FA-UEB-05).
- Alternative: **shadcn/ui 4 on Base UI 1.9 or Radix**. These are copy-in components that are well known to agents and developers. The accessibility depends on the underlying primitives and on how the copied code is maintained.
- No component library makes the product conformant by itself. FA-UEB-04 still needs manual screen-reader and keyboard testing (section 3.11).

### 3.10 Internationalization

| Package | Version | Released | License | Source |
|---|---|---|---|---|
| `@inlang/paraglide-js` | 2.29.1 | 2026-10-19 | MIT | [registry](https://registry.npmjs.org/@inlang/paraglide-js) |
| `i18next` | 26.5.10 | 2026-10-24 | MIT | [registry](https://registry.npmjs.org/i18next) |
| `react-i18next` | 17.1.7 | 2026-10-24 | MIT | [registry](https://registry.npmjs.org/react-i18next) |
| `@lingui/core` | 6.10.1 | 2026-10-22 | MIT | [registry](https://registry.npmjs.org/@lingui/core) |
| `react-intl` | 12.1.5 | 2026-10-19 | BSD-3-Clause | [registry](https://registry.npmjs.org/react-intl) |

Verified:

- Paraglide JS compiles messages into typed ES module functions. It is framework-agnostic, offers server middleware that tracks the locale with `AsyncLocalStorage`, and tree-shakes unused messages, for up to 70% smaller bundles. Plurals use `Intl.PluralRules`; ICU MessageFormat is only available through a plugin ([Paraglide JS](https://paraglidejs.com/)).
- i18next 26 declares the peer dependency `typescript ^5 || ^6 || ^7` ([registry](https://registry.npmjs.org/i18next/26.5.10)).

Opinion:

- FA-UEB-01 needs German and English not only in the UI but also in emails, PDF reports and invoices. The i18n library must therefore work on the server as well as in the browser. FA-KON-01 adds a language switch with the browser language as default.
- **Paraglide JS 2** fits best. A missing or misspelled message key is a compile error, the same message functions run in the API, the web app and the extension, and only used messages are bundled.
- **i18next 26 with react-i18next 17** is the familiar alternative, with typed keys through TypeScript declaration merging (not re-verified in this pass). It loads message catalogs at runtime.
- Browser extensions have their own `_locales` mechanism for the store listing and manifest strings. How that combines with the app's messages belongs to #9.

### 3.11 Tests, linting and CI

| Package | Version | Released | License | Note | Source |
|---|---|---|---|---|---|
| `vitest` | 5.0.5 | 2026-10-15 | MIT | Vitest 5.0 announced 2026-09-03; Node.js `^22.12 \|\| ^24 \|\| >=26` | [registry](https://registry.npmjs.org/vitest), [blog](https://vitest.dev/blog/) |
| `@playwright/test` | 1.64.1 | 2026-10-14 | Apache-2.0 | — | [registry](https://registry.npmjs.org/@playwright/test) |
| `@testing-library/react` | 16.3.3 | 2026-08-27 | MIT | — | [registry](https://registry.npmjs.org/@testing-library/react) |
| `axe-core` / `@axe-core/playwright` | 4.14.0 | 2026-10-05 / 2026-10-15 | MPL-2.0 | — | [registry](https://registry.npmjs.org/axe-core) |
| `eslint` | 10.13.0 | 2026-10-16 | MIT | 9.39.5 on maintenance | [registry](https://registry.npmjs.org/eslint) |
| `typescript-eslint` | 8.72.0 | 2026-10-19 | MIT | TypeScript `<6.1.0` | [registry](https://registry.npmjs.org/typescript-eslint) |
| `@biomejs/biome` | 2.6.2 | 2026-10-21 | MIT OR Apache-2.0 | — | [registry](https://registry.npmjs.org/@biomejs/biome) |
| `oxlint` | 1.89.0 | 2026-10-19 | MIT | type-aware mode needs TS 7 | [registry](https://registry.npmjs.org/oxlint) |
| `prettier` | 3.9.10 | 2026-10-10 | MIT | 4.0 in alpha | [registry](https://registry.npmjs.org/prettier) |

Verified:

- Playwright loads browser extensions only in Chromium, and only with a persistent context. Branded Chrome and Edge builds removed the flags for side-loading extensions, so tests use `channel: 'chromium'` ([Playwright: Chrome extensions](https://playwright.dev/docs/chrome-extensions)).
- GitHub Dependabot raises pull requests for vulnerable dependencies ([Dependabot security updates](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates)). OSV-Scanner checks lockfiles against the OSV vulnerability database ([OSV-Scanner](https://google.github.io/osv-scanner/)). Both pages were confirmed reachable but not read in depth.

Opinion:

- **Vitest 5** for unit and integration tests and **Playwright 1.64** for end-to-end tests in Chromium, Firefox and WebKit, with **@axe-core/playwright** for automated accessibility checks.
  - Automated axe checks find only part of the WCAG 2.2 AA failures. FA-UEB-04 still needs manual keyboard and screen-reader tests.
  - Playwright's WebKit is not Safari. Section 14.6 lists Safari for the web app, so a real Safari check before releases is needed.
  - End-to-end tests of the extension run only in Chromium. Firefox and Firefox ESR extension coverage is a question for #9.
- **ESLint 10 with typescript-eslint 8** (on the TS 6 side of setup (a)) plus Prettier for formatting. Biome 2.6 is a faster single-tool alternative with less type-aware rule coverage. oxlint becomes attractive once its type-aware mode is labeled stable.
- **GitHub Actions** for CI, as the repository already lives on GitHub. Dependabot plus OSV-Scanner in CI cover the "continuous vulnerability checks" of FA-UEB-46.

## 4 Fresh and imminent major releases

"Absolutely modern" collides with "stable" wherever a major release is days old or about to land. Verified dates, from the sources in section 3:

| Component | Event | Date | Consequence (opinion) |
|---|---|---|---|
| Node.js 26 | Becomes Active LTS | 2026-10-28 | Target it; fall back to 24 if a dependency lags |
| Nx 24 | 24.0.0 released | 2026-10-21 | Wait for a few patch releases if Nx is chosen |
| TanStack Start | Declared stable | 2026-10-13 | Upgrade path, not the starting point |
| SvelteKit 3 | 3.0.0 released | 2026-10-01 | Also bound to TS 6 |
| TypeScript 7.1 | Beta | 2026-10-20 | Brings the new compiler API; reassess setup (a) |
| Hono 5 | 5.0.0-rc.1 on `next` | — | Plan an upgrade in year one |
| Prisma 8 | 8.0.0-rc.27 on `latest` of the CLI | — | Pin 7.10.1 exactly; plan a migration |
| Drizzle ORM 1.0 | 1.0.0-rc.5 | 2026-10-21 | Watch list |
| PostgreSQL 19 | `REL_19_RC1` tag | — | Start on 18; managed hosts will lag 19 anyway |
| oRPC 2, Elysia 2, Fastify 6, Prettier 4 | beta / rc / alpha / alpha | — | No effect on the recommendation |

Pre-1.0 packages excluded from core roles: `drizzle-orm`, `drizzle-kit`, `kysely`, `@electric-sql/pglite`, `graphile-worker`, and for the extension `wxt` and `plasmo` (section 7). `@hono/zod-validator` 0.9.1 is a transitive dependency of `@hono/zod-openapi`, not a structural one.

## 5 License compatibility with AGPL-3.0

Verified ([FSF license list](https://www.gnu.org/licenses/license-list.en.html)):

- Apache License 2.0 is compatible with GPLv3 (and so with AGPLv3), but not with GPLv2.
- Expat (MIT), Modified BSD (BSD-3-Clause), ISC and the Unlicense are compatible with GPLv2 and GPLv3.
- MPL-2.0 is compatible with GPLv2-or-later, LGPL and AGPLv3 through its section 3.3, unless the code is marked "Incompatible With Secondary Licenses".

License files spot-checked through the GitHub API (`gh api repos/<owner>/<repo>/license`, 2026-10-24):

| License file | Repositories |
|---|---|
| MIT | facebook/react (now react/react), vitejs/vite, TanStack/router, honojs/hono, honojs/middleware, timgit/pg-boss, taskforcesh/bullmq, mui/base-ui, tailwindlabs/tailwindcss, colinhacks/zod, i18next/i18next, opral/paraglide-js, vitest-dev/vitest, pnpm/pnpm, vercel/turborepo, oxc-project/oxc, typescript-eslint/typescript-eslint, brianc/node-postgres |
| Apache-2.0 | microsoft/TypeScript, prisma/prisma (now prisma/orm), adobe/react-spectrum, microsoft/playwright, biomejs/biome (`LICENSE-APACHE`; npm declares `MIT OR Apache-2.0`) |
| MPL-2.0 | dequelabs/axe-core |
| NOASSERTION (GitHub could not classify it) | nodejs/node. Its LICENSE file is MIT for Node.js itself, followed by the licenses of bundled dependencies |

Opinion:

- Every recommended component is under MIT, BSD, ISC, Unlicense, Apache-2.0 or MPL-2.0. All of these can be combined into an AGPL-3.0 work. axe-core is a test-only dependency and is not distributed with the product.
- None of the recommended components is copyleft, so they also do not constrain the proprietary parts (accounts, billing, organization and operator functions, section 14.6). Where exactly that boundary runs, and how proprietary packages may link to AGPL packages, belongs to #12. This needs legal review, not just a technology choice.
- A license scanner in CI (for example as part of the dependency audit, FA-UEB-46) would catch a future copyleft-incompatible dependency. Which tool is used is a #26 detail.

## 6 Agent-friendly documentation

Each site was checked for a `/llms.txt` file on 2026-10-24 by requesting it directly. A file existing says nothing about how good or complete it is.

| Has `llms.txt` | Returned 404 |
|---|---|
| hono.dev, fastify.dev, orpc.dev, prisma.io/docs, orm.drizzle.team, react-aria.adobe.com, base-ui.com, ui.shadcn.com, tanstack.com, vite.dev, vitest.dev, i18next.com, turborepo.com, oxc.rs, zod.dev, react.dev, nextjs.org/docs, svelte.dev | playwright.dev, inlang.com, reactrouter.com, the pg-boss docs, docs.bullmq.io, pnpm.io, biomejs.dev, docs.astro.build, tailwindcss.com |

Opinion:

- More important than `llms.txt` is that types carry the contract. Typed routes (TanStack Router), a typed API client (Hono `hc`), a generated database client (Prisma) and compiled message functions (Paraglide) let an agent find mistakes with `tsc` alone. That is the strongest agent-friendly property of the recommended stack.
- Fast feedback also matters to agents: TypeScript 7 checks, Vite 8 builds and Vitest 5 runs are all quick.

## 7 Constraints for the browser extension platform research (#9)

These points depend on the extension platform. They are flagged here and **not resolved**:

1. **Extension framework maturity.** `wxt` is at 0.21.4 and `plasmo` at 0.90.5, both pre-1.0. Plasmo has not been released since 2025-05 ([wxt](https://registry.npmjs.org/wxt), [plasmo](https://registry.npmjs.org/plasmo)). `@crxjs/vite-plugin` reached 3.0.0 on 2026-09-24 ([registry](https://registry.npmjs.org/@crxjs/vite-plugin)). Whether a pre-1.0 build tool counts as a "core component" is for #9 and #26 to decide.
2. **Cross-browser API layer.** `webextension-polyfill` is at 0.12.0 (MPL-2.0) with no release since 2024 ([registry](https://registry.npmjs.org/webextension-polyfill)). `@types/chrome` is at 0.3.6 ([registry](https://registry.npmjs.org/@types/chrome)).
3. **Side panel (FA-KON-04)** and its availability across Chromium browsers and Firefox, including Firefox ESR (section 14.6).
4. **UI sharing.** The recommendation assumes the shared UI is a client-only React package that the extension can bundle. Manifest V3 content security policy and the ban on remotely hosted code must allow this.
5. **Authentication and progress from the extension.** Whether the extension can use cookies for the API origin decides between `EventSource` and a `fetch`-based SSE reader (section 3.8). Together with #11.
6. **Extension end-to-end tests.** Playwright covers Chromium only (section 3.11). Firefox and ESR need another approach.
7. **Localization.** The extension's `_locales` files and the app's Paraglide or i18next messages must stay in sync (FA-UEB-01, FA-KON-01).

## 8 Unknowns

- **TanStack Start's support policy.** The 1.0 post makes an API commitment but names no semver or support window.
- **TypeScript 7.1 release date and API shape.** Only the beta exists.
- **Prisma 8 final release date** and how much of the Prisma 7 API it keeps.
- **EU data residency of managed job services** (Temporal Cloud, Trigger.dev, Inngest). Not checked; relevant only if one of them is chosen (#10).
- **Real-world performance** of pg-boss at 50 concurrent Checks (FA-UEB-40 to FA-UEB-43). Not benchmarked; the expected load seems small for PostgreSQL, but this is an opinion.
- **Managed hosts' Node.js 26 and PostgreSQL 18 availability** in EU regions. Belongs to #10 and #22.
- **Screen-reader-accessible PDF reports (FA-ERG-20).** The PDF library was out of scope for this ticket. It should be chosen with tagged-PDF output in mind.

## 9 Recommended stack (opinion)

This is a recommendation for #26, where the client decides. Versions are the stable releases verified in section 3; a project would pin exact versions and update them through Dependabot.

| Area | Recommendation | Main reason | Requirements |
|---|---|---|---|
| Runtime | Node.js 26 (Active LTS from 2026-10-28), fallback Node.js 24 | Longest support window; every library targets Node.js | FA-UEB-44 |
| Language | TypeScript 7.0.2 for type checks, with `@typescript/typescript6` 6.0.x for API-based tools; code kept 6.0-compatible | Speed now, compatibility with typescript-eslint | bar item 3 |
| Package and monorepo | pnpm 12 workspaces + Turborepo 2.11 | Simple; fits the AGPL/proprietary package split | 14.6, #12 |
| Web app | React 19.3 + Vite 8.3 + TanStack Router 1.170, client-rendered; TanStack Query 5 for server state | Shares components with the extension; typed routes; TSX checked by TS 7 | FA-GLE-01 to FA-GLE-05, FA-KON-04, FA-ERF-03 |
| Public pages (optional) | Astro 7 static site | Indexable pages outside the app | — |
| API | Hono 4.13 on `@hono/node-server` 2, `@hono/zod-openapi` 1.6, Zod 4 | Versioned OpenAPI contract plus typed `hc` client from one schema | FA-ERW-04 |
| Database | PostgreSQL 18, managed in the EU | One stateful service for data and queue | FA-UEB-13, FA-UEB-45 |
| Data access | Prisma 7.10.1 with `@prisma/adapter-pg`, all Prisma packages pinned exactly | Familiar typed ORM and migrations; avoids the 8.0 RC on `latest` | bar items 2–3 |
| Check execution | pg-boss 12 on the same PostgreSQL | Retries, concurrency, schedules, transactional enqueue; no Redis | FA-SUC-07, FA-SUC-08, FA-ERF-09, FA-ERF-12, FA-UEB-40 to FA-UEB-43 |
| Progress | Server-sent events over HTTP/2 via Hono `streamSSE`; cancellation as a separate request | One-way, auto-reconnect, plain HTTP | FA-SUC-07, FA-SUC-08 |
| UI components | React Aria Components 1.22 + Tailwind CSS 4.3 | Best-documented accessibility testing; built-in localized strings | FA-UEB-04, FA-UEB-05 |
| i18n | Paraglide JS 2 | Typed messages that run in the API, web app and extension | FA-UEB-01, FA-KON-01 |
| Tests | Vitest 5, Playwright 1.64, @axe-core/playwright 4.14, Testing Library 16 | Fast unit tests; cross-browser end-to-end tests; automated accessibility checks | FA-UEB-04, 14.6 |
| Lint and format | ESLint 10 + typescript-eslint 8, Prettier 3 | Full type-aware rule set | — |
| CI and security | GitHub Actions, Dependabot, OSV-Scanner | Repository already on GitHub; continuous vulnerability checks | FA-UEB-46 |

### Alternatives worth keeping open

| Area | Alternative | When it wins |
|---|---|---|
| Language | TypeScript 6.0.3 throughout | If two compilers side by side prove awkward |
| Monorepo | Nx 24 | If generators and enforced module boundaries are wanted |
| Web app | TanStack Start 1.x | If server rendering of app pages becomes a requirement |
| Web app | Next.js 16 | If the team values its ecosystem over self-hosting simplicity |
| Web app | Vue 3.5 / Nuxt 4, Svelte 5 / SvelteKit 3 | After TS 7.1 ships an API and their tooling moves to it |
| API | Fastify 5 | If maximum server maturity matters more than end-to-end client typing |
| API | oRPC 1.x | If RPC-style procedures with OpenAPI output are preferred |
| Data access | node-postgres 8 + SQL | If the team prefers no ORM |
| Data access | Drizzle ORM | After 1.0 is final |
| Check execution | BullMQ 6 + Redis | If queue throughput outgrows PostgreSQL |
| UI components | shadcn/ui 4 on Base UI 1.9 or Radix | If copy-in components and their look are preferred |
| i18n | i18next 26 + react-i18next 17 | If familiarity outweighs compile-time checks |
| Lint | Biome 2.6, or oxlint 1.x once type-aware mode is stable | If lint speed and a single tool matter more |

## 10 Implications for later decision tickets

- **#26 Tech stack:** decides from section 9. Open choices to confirm with the client: TS setup (a) or (b); TanStack Router SPA or TanStack Start; Prisma or SQL; Paraglide or i18next.
- **#9 Browser extension platform:** resolves the points in section 7, especially the extension build tool's maturity, the side panel in Firefox, Manifest V3 limits on the shared UI, and extension authentication for SSE.
- **#21 System architecture:** designs the Check pipeline on a PostgreSQL queue, progress fan-out across instances (LISTEN/NOTIFY), cancellation and resume semantics, and the API versioning scheme.
- **#14 Check/Reference model:** the Check and Reference states drive both the queue jobs and the SSE event types.
- **#16 Search strategy and latency:** sets per-Data-source parallelism and timeouts, which become pg-boss queue settings.
- **#22 Hosting and operations / #10 EU hosting:** must offer Node.js 26, managed PostgreSQL 18 in the EU, HTTP/2 with response buffering disabled for SSE, and backups meeting FA-UEB-45. The recommended stack needs exactly two kinds of runtime units (API and worker, both Node.js) plus one database.
- **#11 Passwordless auth:** cookie or token transport affects SSE from the extension (section 3.8).
- **#12 Open-core boundary and repo structure:** maps the AGPL and proprietary parts onto workspace packages and checks how they may link (section 5).

## 11 Requirements change requests

None needed. Every requirement this ticket touches can be met with stable, AGPL-compatible components:

- UI parity (FA-GLE-01 to FA-GLE-05), the versioned API (FA-ERW-04), German and English everywhere (FA-UEB-01), WCAG 2.2 AA (FA-UEB-04), Check progress and cancellation (FA-SUC-07, FA-SUC-08) and EU storage (FA-UEB-13).

Two tensions are flagged rather than raised as change requests, because they depend on other tickets:

- Firefox and Firefox ESR support for the extension (section 14.6) has no stable automated end-to-end path in Playwright, and extension build tools are pre-1.0. This belongs to #9.
- Safari support for the web app (section 14.6) cannot be fully covered by Playwright's WebKit. It needs a manual or cloud Safari check in the release process, which #26 or #22 should plan.
