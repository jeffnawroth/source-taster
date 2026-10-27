# Issue #115 implementation evidence

Historical 2026-10-26 snapshot. The approved compiler exceptions, controlled
source build and current validation are recorded in
[the controlled-build continuation](implementation/115-controlled-build.md).
The findings below remain historical evidence, not current approval requests.

Validated locally on 2026-10-26 on `feat/115-static-website`, based on integration `spec/70-launch-product`. The work continues an earlier partial commit (`680338f`); its content, legal drafts and publication gate were kept, the remaining gaps were closed test-first.

## Behavior

- `apps/website` is a static Astro 7 build in DE and EN (`/de/`, `/en/`, `/docs/{de,en}/…`) with per-language Pagefind indexes served from the same origin. Every page has a counterpart in the other language and a same-page language switch. The bare entry `/` negotiates the language on the server from `Accept-Language` (302, `Vary: Accept-Language`, default English, no cookie), per ADR-0020.
- The verification server mounts the website beside the API: `/v1/*` and `/health` stay with the API, all other paths are served from the hashed build artifact with a strict CSP (`default-src 'none'`, same-origin scripts plus `wasm-unsafe-eval` for Pagefind), `no-store`, `nosniff` and `no-referrer`. Preview responses carry `X-Robots-Tag: noindex`.
- Legal notice, terms, privacy policy and withdrawal instructions exist as versioned **drafts** in both languages and are linked from every website page footer and from the web app's information navigation; the bilingual 404 page links back to both home pages. Seller details, domain and support address are `null` in `publication.json`; no values were invented.
- **Publication gate:** `pnpm --filter @source-taster/website publication:check` and the publication build fail closed while seller details, domain, support address, approved legal versions or any release review (legal, claims, dependencies, accessibility, translation) are missing. The server refuses publication mode under the same check and refuses the draft preview when `NODE_ENV=production`.
- Help and contact links come from the shared UI seam `@source-taster/ui/information` and are rendered by the web app in DE and EN. The browser extension does not exist yet; it must render the same component when built. With `VITE_SOURCE_TASTER_WEBSITE_URL` unset, the links are relative and only resolve when the website shares the app origin (as in the server mount).
- A new docs page documents the author-date Structuring preview (#72) without promising search, Verdicts or Quota.
- Every documentation page maps to a claim in `apps/website/claims.json` with internal requirement IDs and evidence paths (FA-EIN-01 pre-release claim review). `i18n:check` fails on any unmapped page, unknown requirement ID or missing evidence file. Requirement IDs never appear in the built site (checked by the privacy test).
- Astro's optional `sharp` image service is excluded; the site ships no raster images.

## Validation

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | pass |
| `pnpm typecheck` | pass |
| `pnpm lint` (eslint + prettier) | pass |
| `pnpm i18n:check` | pass — 10 paired information pages, 4 paired legal documents, 28 paired UI texts |
| `pnpm build` | pass |
| `pnpm test` | pass — server 32/32 against PostgreSQL on 5433, including 4 new website hosting tests |
| `pnpm test:e2e` | pass — web 13/13 (new: help/legal links in DE/EN), website 12/12 |
| `pnpm audit:licenses` | pass — 529 packages, 67 runtime |
| `pnpm audit:dependencies` (OSV-Scanner 2.7.0, DB refreshed 2026-10-26) | **fail** — see below |
| `pnpm --filter @source-taster/website publication:check` | fails as intended (gate closed) |

The website browser tests cover: DE/EN pages and local search (results, empty and failure states), server-side language negotiation for seven `Accept-Language` cases with JavaScript disabled, legal reachability from every page, axe WCAG 2.0/2.1/2.2 A/AA rules on every artifact route and the 404 page at 320 px and 1280 px with reflow and asset-load assertions, and a privacy scan (no external resources, frames, embeds, remote CSS, analytics vendors, cookies or storage; single-origin requests only).

Two defects were found by these tests and fixed: route-derived CSS asset names containing `..` were blocked by the hosting path guard, leaving the site unstyled; and long German words overflowed at 320 px.

## Dependency findings (blocking CI and publication)

`pnpm audit:dependencies` runs in CI (`.github/workflows/ci.yml`), so this branch does not merge green until the findings are resolved, an exception is decided, or the scope of the upstream-lock scan is changed. That is a project decision, not part of this ticket.

The pnpm lockfile graph has no OSV findings. All 73 findings come from the upstream source locks of native/bundled website build components that `scripts/audit.ts` scans deliberately (`apps/website/qualification/upstream/`, provenance pinned in `provenance.json`):

- **Pagefind CLI (`pagefind-native`, v1.5.2):** advisories in `actix-http`, `quinn-proto`, `rustls`, `rustls-webpki`, `h2`, `tar`, `rand`, `tokio`, `zstd`/`zstd-safe`/`zstd-sys` and several unmaintained crates. The `pagefind 0.0.0` match on GHSA-gprj-6m2f-j9hx is a false positive (workspace placeholder version; fixed in 1.1.1). Reachability has not been qualified.
- **Pagefind bundled JS build lock (`pagefind-js`):** `tar`, `brace-expansion`, `js-yaml`, `esbuild`.
- **Astro compiler (`@astrojs/compiler-rs` 0.5.2):** `anyhow`, `tokio`. **satteri** 0.10.5: unmaintained `bincode`.
- **Prereleases outside the get-tsconfig decision:** `lightningcss 1.0.0-alpha.72` and `lightningcss-derive 1.0.0-alpha.43` in the Astro compiler's Cargo lock.
- **License:** `pagefind_microjson 0.1.4` (GPL-3.0-only per crates.io) is a direct dependency of `pagefind_web`, i.e. the WASM served to browsers. Compatibility with this project's AGPL-3.0-or-later and notice obligations need review.

`get-tsconfig@5.0.0-beta.6` is MIT and builds/works as recorded in the decision; the overall website dependency graph is **not** cleared. `reviews.dependencies` stays `null`, so the gate stays closed.

## Not done / remaining scope

- Manual accessibility review (screen readers, keyboard walk-through) and human DE/EN translation review are pending; automated axe checks do not establish WCAG 2.2 AA conformance.
- Legal texts are drafts and need legal review plus real seller, domain and support details before publication.
- The extension links depend on #92 rendering the shared information component.
- Unknown `/v1/*` paths return Hono's default plain-text 404, not a problem document; this predates #115.

Current controlled-build review fixes and exact native-license qualification are
recorded in [the consolidated handoff](implementation/115-consolidated-qualification.md).
Older command results and license refusals are historical; use the receipt and
target specified in that handoff for the current implementation.
