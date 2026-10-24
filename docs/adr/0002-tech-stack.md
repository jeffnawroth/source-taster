# Adopt a Node.js, React and PostgreSQL TypeScript stack

The client accepted this decision on 24 October 2026 in [Tech stack](https://github.com/jeffnawroth/source-taster/issues/26). It applies the bar on the [decision map](https://github.com/jeffnawroth/source-taster/issues/4): TypeScript end to end, stable and maintained releases, no pre-1.0 core component, strong typing, agent-friendly tooling, AGPL compatibility, minimal operations and EU hosting. Both repositories from [ADR-0001](0001-open-core-boundary.md) use this stack, and the private service repository omits the extension. The evidence and version snapshot are in the [current TypeScript stack research](https://github.com/jeffnawroth/source-taster/blob/f980ddeff22dfb497dde58c768c5a4639a839558/docs/research/current-typescript-stack.md) and the [extension platform research](https://github.com/jeffnawroth/source-taster/blob/91a13933cff59ef5437cf0311c6f3aa032f667e3/docs/research/extension-platform.md). Exact versions are pinned when the code is set up and are then updated through Dependabot. The versions below are the stable lines as of the decision date.

## Accepted stack

| Area | Decision |
|---|---|
| Runtime | Node.js 26, which becomes Active LTS on 2026-10-28. Verify the toolchain on it after that date. Node.js 24 is the fallback if a dependency lags. |
| Language | TypeScript 7.0 runs type checks. `@typescript/typescript6` 6.0 runs alongside it for tools that need the compiler API, such as typescript-eslint. Code stays 6.0-compatible: `erasableSyntaxOnly`, `verbatimModuleSyntax`, no `baseUrl`. Reassess when TypeScript 7.1 ships its API. TypeScript 6.0 throughout is the fallback. |
| Repositories | One pnpm 12 workspace with Turborepo 2.11 in each repository. There is no workspace shared between the open and the proprietary repository. |
| Web app | React 19.3, Vite 8.3 and TanStack Router 1.170 as a client-rendered single-page app, with TanStack Query 5 for server state. TanStack Start is an upgrade path, not the starting point. |
| API | Hono 4.13 on `@hono/node-server` 2, with `@hono/zod-openapi` 1.6 and Zod 4. Plan the Hono 5 upgrade within the first year. |
| Data | PostgreSQL 18 managed in the EU. Prisma 7.10.1 with `@prisma/adapter-pg`, with every Prisma package pinned to the same exact version so the 8.0 release candidate on the CLI's `latest` tag is never installed. |
| Check execution | pg-boss 12 on the same PostgreSQL. No Redis. |
| Progress | Server-sent events over HTTP/2. Cancellation is a separate request. |
| UI | React Aria Components 1.22 with Tailwind CSS 4.3. |
| i18n | Paraglide JS 2 for the API, the web app and the extension. |
| Quality | Vitest 5, Playwright 1.64 with `@axe-core/playwright`, Testing Library, ESLint 10 with typescript-eslint 8, and Prettier 3. |
| CI | GitHub Actions with Dependabot, OSV-Scanner and a license scanner. The scanner is chosen during setup. |
| Extension | An explicit Vite build target. Both the web app and the extension are built from the shared UI packages. The extension uses the native `browser` namespace and an owned adapter over Chromium `sidePanel` and Firefox `sidebarAction`, with small application-owned interfaces. All code and assets are bundled locally, and nothing executable is loaded remotely. |

## Contract-first API across repositories

`hc<AppType>` infers its types from the server implementation. Using it across repositories would make the proprietary service import AGPL implementation types. The cross-repository rule is therefore contract-first:

- Each API's public Zod schemas and transport-only types live in their own contract package, licensed `AGPL-3.0-or-later OR MIT` as ADR-0001 permits.
- The OpenAPI document is generated from the contract package.
- The rule applies in both directions. The private service consumes the verification API's contract. The open web app and extension consume the service's contract for sign-in and Plan/Quota display.
- Across repositories, clients use only the contract package or a client generated from it. `hc` type inference is allowed only inside the open repository.

## Interpretation of the maturity rule

"No pre-1.0 core" covers anything that carries the runtime, the build or the structure of the code. Type-only declaration packages such as `@types/chrome` 0.x are not core, provided they are used only behind the extension adapter.

The rule excludes these 0.x packages from core roles: Drizzle ORM, Kysely, PGlite, graphile-worker, WXT and Plasmo.

## Interpretation of the supported platforms

These interpret section 14.6. They do not amend it.

- **Extension platform.** The extension is supported on desktop only.
- **Acceptance operating systems.** Windows 11 and the current macOS. Linux is permitted but is not part of acceptance.
- **Firefox ESR.** "Current ESR" means the newest ESR line, not the older ESR 115 line for legacy systems.
- **Brave.** "Two latest major versions" means its two latest feature release lines.

## Bibliographic libraries

This ADR fixes only the constraints:

- TypeScript on Node.js or in the browser only.
- No pre-1.0 structural dependency, such as Citation.js 0.x.
- No learned parsing method.
- No service in another language.

The concrete choice of PDF/DOCX extraction, BibTeX/RIS import and export, and CSL rendering belongs to [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20).

## Considered options

- **Monorepo:** Nx 24, which was days old.
- **Web app:**
  - Next.js 16, because self-hosting in the EU is harder.
  - Vue/Nuxt and Svelte/SvelteKit, because their tooling is bound to TypeScript 6 until TypeScript 7.1.
  - TanStack Start, which had been stable for only 11 days.
- **API:**
  - Fastify 5, because its typing to clients is weaker.
  - tRPC, because it is RPC-shaped rather than resource-shaped for the third-party API in FA-ERW-04.
  - NestJS, because of decorators.
- **Jobs:** BullMQ with Redis, because it adds a second stateful service.
- **Extension:** Extension.js 4, because it brings a second bundler (Rspack) next to Vite.
- **UI:** shadcn/ui on Base UI or Radix.
- **i18n:** i18next.

## Consequences

- **Data separation.** How data is split between the open program and the private service, as separate databases or schemas, is decided in [System architecture](https://github.com/jeffnawroth/source-taster/issues/21).
- **Validation gates.** These validation gates remain open and are not satisfied by this decision:
  - native acceptance of side panel and context menu in Brave and Opera;
  - Firefox and ESR extension tests through `web-ext`, Selenium or by hand, since Playwright loads extensions only in Chromium;
  - a real Safari check of the web app before each release, since Playwright WebKit is not Safari.

  System architecture, [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22) and the release process must plan them.
- **PDF library.** The library for accessible, tagged PDF Verification reports (FA-ERG-20) is not yet chosen.
- **License review.** Every dependency remains subject to the AGPL compatibility check and the legal review required by section 14.6 and FA-UEB-23.
