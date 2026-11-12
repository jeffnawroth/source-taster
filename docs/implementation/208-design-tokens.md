# Value-only design-token implementation (#208)

This slice implements the accepted ADR-0027 token contract on top of
`e8ae2d3493b1fdeeb86ed43162a38cd04ed23696` (`design/181-system`). That accepted
specification is a required, not-yet-main base. Review the implementation diff
against that branch; do not substitute the older main specifications.

## Implementation boundary

`packages/design-tokens/src/tokens.ts` is the typed value source. The generator
emits committed `theme.css`, `dist/index.js` and `dist/index.d.ts`. It reads no
prototype runtime and does not import the documentation generator. Accepted
primitive names/values and neutral insertion roles are preserved. No application
surface, API, billing, consent or preference persistence is changed.

The package exports only its constant module and stylesheet, with no runtime
or peer dependencies. An exact packed-file test permits only those generated
outputs, package metadata, usage/scope notices and the two licence texts. An
isolated consumer imports the packed JavaScript and stylesheet through package
exports and type-checks the declarations without installing the generator.

Culori 4.0.2 is development-only. Generation rejects new out-of-sRGB primitives
and shadow colours; accepted chroma mapping is already explicit in the primitive
table. The source's feedback tints are mixed/rounded at build time. CSS defines
System defaults, explicit root `data-theme` overrides, reduced-motion duration
values, and inline semantic Tailwind aliases with replaced namespaces reset.
It contains no component or application behaviour.

Six-digit sRGB source colours retain a separate, unquantized alpha. Opaque light
medium values are generated separately on white and the named light mail canvas.
Correction-layer constants additionally compose each neutral line over its own
alpha background on that named backdrop. See the package README for usage.

## Verification

Local environment: macOS arm64, Node.js 24.14.0 (the existing validated fallback),
pnpm 12.15.0. The repository's existing controlled website prerequisite is rebuilt
and verified before the normal workspace commands.

The package's six automated tests cover:

- All 158 gated pair identities and two-decimal ratios against the accepted
  documentation evidence, including actual source-over insertion lines in both
  modes. Disallowed secondary/muted glass text is not promoted into an allowed
  role by a passing ratio.
- Named-backdrop six-digit constants and a separately calculated correction-line
  compositing witness.
- Real Tailwind 4 compilation of semantic colour/type/shape/elevation utilities,
  with replaced defaults and primitives absent.
- Byte-stable regeneration and deliberate CLI failures for stale output,
  out-of-gamut source values and failing WCAG pairs. Checks do not repair drift.
- Exact tarball contents, zero runtime dependency graph, value-only JavaScript,
  isolated package exports and readonly TypeScript declarations.

A supplementary local headless Chromium smoke compiled the actual stylesheet and
measured its computed text/surface colours for all six combinations of system
light/dark and System/light/dark override. All passed: light text/surface
`#0e1626`/`#ffffff`, dark `#f4f5f8`/`#11151e`. Reduced motion returned `0ms` for the
spring duration. This is a token smoke check, not rendered-glass or production
accessibility acceptance.

CI's `verify` job explicitly runs package drift/gamut/contrast and packed-boundary
tests immediately after installation. Ordinary builds check committed values;
only the explicit `tokens:generate` command writes outputs. Existing licence and
all-lockfile advisory inventories include the exact development additions.

Local results on 10 November 2026:

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Pass |
| Package `check`, `test`, `typecheck`, `lint` | Pass; 158 pairs, zero failures; 6 tests |
| `pnpm pagefind:fetch`, `pagefind:build`, `pagefind:verify` | Pass; controlled macOS arm64 source build |
| `pnpm typecheck` | Pass; 21 workspace tasks |
| `pnpm lint` | Pass; 21 tasks and repository formatting |
| `pnpm build` | Pass; 13 tasks |
| `pnpm i18n:check` | Pass |
| `pnpm audit:licenses` | Pass; 564 installed entries, 105 runtime packages |
| `pnpm test:scripts` | Pass; 9 tests |
| `pnpm audit --json` | No known registry advisories; supplementary to the canonical CI OSV gate |
| Existing committed transport artifacts | Unchanged after workspace generation/build |

The canonical OSV all-lockfile scan and the full existing browser/server/PDF CI
matrix run on the PR; local registry audit is not a substitute for those gates.

## Ownership and follow-up

The package notice limits `AGPL-3.0-or-later OR MIT` to the values/CSS/constants;
tools/tests remain under the repository licence. No font/artwork/glyph/component
is included. #207 remains the independent rights gate for private token use and
affected brand distribution. This implementation grants no legal clearance and
updates no private consumer.

After that gate, public Git dependencies in a private consumer must all move
together to one full reviewed public SHA, including contracts. Token rename or
removal is breaking and needs a coordinated migration. Public primitives and
surface application remain in #209 and the later planned slices; PDF stays #105.
