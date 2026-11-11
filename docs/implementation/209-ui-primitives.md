# #209 — owned RAC primitives and static recipes

Implemented against accepted ADR-0027 and the consolidated component/style/token
specifications on 10 November 2026. This is public implementation evidence,
not a product release, rights clearance or accessibility-conformance claim.

## Stack and authority

Required local base: **c64fe26c029c3f946c1338062cb7807859d57b9a**,
`feat/208-design-tokens`, from [PR #218](https://github.com/jeffnawroth/source-taster/pull/218).
The PR for this slice must target that branch so its diff contains only #209.
That base includes the accepted documentation from `design/181-system`; main
has not been substituted for it. #218 is open and has no human acceptance review.

The live native blockers were read before claiming #209: #206 is closed and #208
is open. The owner's explicit instruction authorizes this stacked continuation
on the completed local #208 implementation. Both native edges remain intact as
provenance; neither a closed #208 nor an integrated main is claimed. #181 is
closed. The accepted owner decision is [#206 comment](https://github.com/jeffnawroth/source-taster/issues/206#issuecomment-6770556807).
#207 remains open and continues to gate private token use/affected brand distribution.

The Greenfield boundary was observed: no predecessor repository or local copy
was read/cloned. Public, checksum-pinned upstream build caches from this same
repository were reused for the required controlled Pagefind build and reverified
by its normal source/build gate. No private code, fixture or specification was read.

## Implementation boundary

```text
@source-taster/design-tokens/theme.css   values only; unchanged
@source-taster/ui/
  primitives      owned RAC behavior, semantic roles and accessibility
  primitives.css  state/layout/motion/glass/forced-color rules + RAC plugin
  recipes         five pure tailwind-variants recipes; no React graph
  examples        isolated actual-component gallery: DE/EN × light/dark
```

The original root/domain exports remain compatible for #211/#212. The new
`/primitives` entry is the styled foundation for their future compositions;
existing checking, Account and website surfaces are not migrated by this slice.
There is no API, billing, authorization, consent, durable Theme choice,
application-search service or should/deferred feature change.

All action, field, selection, overlay, navigation, Table and display families
from components.md section 2 are available. See `packages/ui/README.md` for the
composition API, disabled/group descriptions, translated labels, ListBoxItem
text values, table selection/scrolling, loading contexts and static Astro usage.
`NOTICE.md` records the exact official-starter snapshot and Apache-2.0 source
license. UI code/recipes retain AGPL-3.0-or-later; tokens retain their own narrow
notice. No font or artwork is added or redistributed.

Routine implementation defaults follow the spec: 36/28px controls, wrapping
meaning, a reserved loading slot, explicit busy state, safe destructive initial
focus, modal focus containment/return and non-modal popovers. SegmentedControl
measures translated labels and falls back to Select while retaining the key.
Tables keep their horizontal overflow inside a visible frame, and tab lists have
edge fades/scrolling. Only named approved floating layers can request the two
glass materials; command-modal glass is directly above the scrim. Surface
fallbacks, system-color focus/selection and reduced-motion final states are owned
here rather than delegated to the value-only token package.

Toast has one shim and exactly two unstable RAC imports. Its controller hides
the stable react-stately queue, so public add calls cannot give action messages
an expiry. Plain notifications use five seconds and pause on hover/focus; three
are visible, with older entries queued. Status/error content is polite/assertive;
F6 enters the region and returns to the prior connected target, including roots
without a registered RAC Main. Queue ownership is per controller/root.

## Reproducible verification

Run the commands in `packages/ui/README.md`. The specimen URLs are
`http://127.0.0.1:5199/?lang=de&theme=light` and the three language/theme variants.
They use the actual package exports, synthetic content, local state and no service.

Local evidence on Node **24.14.0** / pnpm **12.15.0**, macOS arm64:

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Pass; exact versions, no new release-age exclusions |
| `pnpm typecheck` | Pass, 22 tasks |
| `pnpm lint` | Pass, 22 tasks plus repository Prettier |
| `pnpm build` | Pass, 13 tasks, with normal existing chunk-size advisories |
| UI `typecheck`, `lint`, `build:examples` | Pass |
| UI `test` | 2 contract tests pass: actual isolated import/bundle and Toast upgrade boundary |
| UI Playwright, Chromium + WebKit | 28 scenarios pass, 14 per engine |
| UI Playwright, Firefox | Local launcher cannot start: `Could not find profile folder.`; no Firefox pass claimed locally |
| `pnpm i18n:check` | Pass, existing DE/EN catalogues/content |
| `pnpm test:scripts` | 9 pass |
| CI workflow regression | 13 pass; Chromium-only side panel remains separate from the three-engine UI suite |
| `pnpm audit:licenses` | Pass, no added policy exception |
| Design-token `check` + `test` | 158 pairs, zero failures; all 6 package/generation tests pass |
| Controlled Pagefind fetch/build/verify | Pass, pinned macOS arm64 build |

The browser scenarios check keyboard and pointer state, native validation after
blur/submit, growing/capped textarea, case/diacritic filtering, grouped selection,
tag removal and file-trigger access, sorting and table selection. Modal tests
assert `aria-modal`, focus containment, safe-action initial focus, Escape and
trigger restoration; non-modal tests cover menu/popover behavior and icon tooltips.
Toast tests exercise real DOM live-region semantics, F6, action persistence,
hover/focus timeout pause, dismissal and the three-visible bound.

Axe runs on DE/EN light/dark rendered specimens and at doubled CSS layout size.
The 320px check rejects document overflow and checks long action labels; a measured
segment overflow must become Select. The 200% check uses CSS zoom at a 640px
viewport to reproduce a 320px effective layout in both engines. This is automated
layout evidence, not a claim of browser-chrome/native zoom qualification.

Rendered contrast captures compare fully painted glyph pixels with the same
capture after making that text transparent. Primary/secondary glass text is
measured over bg/surface/surface-sunken in both modes, plus the actual modal glass
above its scrim. Every sampled glyph pair must meet 4.5:1. Painted field-edge
pixels must meet 3:1 against their actual surface. These complement, rather than
replace, the unchanged numerical token gate. Reduced motion, Chromium's reduced
transparency emulation and forced-color system focus/fallbacks are also exercised.

The `/recipes` check rejects React, React DOM, RAC and Lucide during actual module
resolution, then inspects the minified bundled module graph and emitted code for
client/hydration imports. The five recipes remain pure class-string functions.
No prototype runtime or new dependency generator enters the token package.

## Fallback-font reflow regression

The first Linux CI run on `f60d8a9` passed 36 of 42 UI scenarios, including 12
Firefox scenarios, but rejected German 320px reflow in every engine/theme. The
minimal reproduction was the gallery heading alone with Arial fallback metrics:
a 288px heading box painted a 306px unbroken word and made the document 322px wide.
The native macOS fallback had hidden this defect locally.

The gallery heading now wraps long words without clipping or changing the type
step/container width. The existing language/theme regression cases additionally
force Arial and compare document scroll width with **clientWidth**, so classic
scrollbars and fallback metrics cannot be masked by `innerWidth`. The regression
was run red before the CSS correction and green afterward; the original full and
heading-only reproductions both return 320px document width after the fix. The
full Chromium/WebKit suite and workspace gates are rerun on the correction.

## Pending-width measurement regression

Linux CI on `f6d94ef` passed 41 of 42 UI scenarios, including every reflow case.
Its remaining WebKit failure measured the loading button during the permitted
press/release scale animation. A pinned pointer reproduction showed unchanged
311px layout width before/after activation while `scale(0.98)` temporarily painted
a 305.10px box. Comparing bounding boxes therefore confused motion with layout.

The pending specimen now uses its natural width rather than stretching across
its gallery column. The regression holds a real pointer press and compares
computed layout widths before, during and after loading, keeping the busy/label/
spinner assertions. A temporary negative control removed the idle spinner
reservation: the test correctly rejected the resulting 28px layout increase
(133.42px to 161.42px). That fault was removed immediately afterward. The press
animation and production component behavior are unchanged; no tolerance was widened.

## Blocking native-build advisory maintenance

The fresh OSV database on 11 November 2026 blocked the inherited controlled
website build at `64377fb` for **RUSTSEC-2026-0486**. Five reports referred to one
actual affected identity, `rustix 1.1.4`: the selected native closure plus four
immutable upstream inventories. This was a real selected-dependency finding,
not a license or scanner-infrastructure failure.

The minimal stable patch pins `rustix 1.1.6` in the four owned native Cargo locks
(Pagefind, Astro compiler, Rolldown and Sätteri). Registry archive SHA-256:
`e5e76742e5294153d4dde1207dbec5bdd81eef6fabdc0d2118babadabfd858aa`.
It fixes extended-attribute zero-buffer initialization handling; the crate's
license and retained notices stay `Apache-2.0 WITH LLVM-exception OR Apache-2.0
OR MIT`. Its tightened normal-dependency lower bounds fit the existing frozen
versions, so no other dependency identity or configured target/feature selection is changed.
The reproducible controlled-vs-upstream ledger is regenerated in its original
format. Raw upstream locks and the advisory/refusal policy remain unchanged.

This is the supporting build prerequisite needed to finish #209's required CI,
recorded as a separate maintenance commit. It does not migrate a website surface,
add a UI dependency, change private rights or grant publication approval. The
normal source-checksummed fetch, offline native rebuild, target/feature graph,
license inventory, fresh offline OSV matching and failure controls apply to the
patched exact identity. The local rebuilt graph passed license qualification
and OSV-Scanner 2.7.0 with fresh npm/crates.io databases: zero blocking findings,
93 raw upstream findings preserved, and no license issues. All 23 qualification
control results pass, including refusal of positive/incomplete/stale scans and
reproduction of all three shipped WASM objects from the delivered source archive. The patched build also passes all 92 local website Chromium
scenarios and the workspace type/lint/build/license gates. The complete E2E job
on `64377fb` passed in Linux CI, including all 42 UI cases across three engines;
the final head with this native security patch still requires its own full CI.

## CI and remaining qualification

CI verifies the static contract, builds the real examples and runs all **42 UI
browser scenarios** in Chromium, Firefox and WebKit under the existing aggregate
`checks` gate. Failure traces are retained with the other browser evidence.
The full existing checks, including the all-lockfile offline OSV advisory gate,
remain required on the final pushed head. Their live PR state is authoritative;
a local license scan is not an advisory-scan substitute.

Human screen-reader announcement/timing review, real Safari and supported native
platform/release qualification remain the existing release gates. The local
Firefox launcher failure does not waive the Linux Firefox CI suite. No production
deployment, private rollout, legal approval or autonomous merge is authorized.
