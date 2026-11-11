# #211 — Shared checking shell

Public implementation completed on 11 November 2026 under the explicitly invoked
implement-spec and TDD workflows. The prepared worktree started at required base
`55275f49179ac0a2dc832f19ac407161f5202fb4`; ancestry was verified before edits.
The integration follow-ups, including `3c8247b962d9780936be1e0873bdb1c52c812728`,
are merged. AGENTS.md, GLOSSARY.md, the issue/dependencies/comments, accepted
ADR-0027/0016/0023 and the component/style specifications informed the work.

## Delivered behavior

- Owned RAC GridList feed keeps Reference slot identities and input order while
  streamed evidence updates in place. Keyboard selection, push detail, narrow
  Back/Escape, scroll and focus restoration retain the existing detail workflow.
  Six distinct owned Verdict silhouettes carry the result colors; labels, cards,
  manual provenance, technical Statuses and evidence tracks stay neutral.
- The sticky strip uses six counters, a separate Status menu, labelled active
  filter, tooltips, label reveal and 2 px progress below 700 px. Zero counters
  remain discoverable by keyboard but cannot activate an empty filter. Actual
  wrapped sticky heights keep detail actions reachable at narrow zoom. The strip
  starts at the feed boundary, after existing bulk/export controls, so it cannot
  cover those controls while they are in use.
- The TopBar wires modal History, safe-focus restart/delete/revoke confirmation,
  nonmodal Account entry with real Quota facts, and an existing-action launcher.
  Intake expands with content and retains file selection/drop, document upload,
  Bibliography selection, rejected entries, imports, Page selection and Undo.
- Count/expected consumption precedes automatic search; first-N partial starts
  preserve original slots. Reconnect reads the same Check, while cancellation,
  lease expiry, Reset and late-event handling retain the established lifecycle.
  Hosted session failures fail closed; explicit standalone mode exposes no
  private-service UI, including when a service URL is configured. Hosted
  statutory cancellation remains independent of session failure.
- Private Account/order links carry language/context without Reference/document
  content. Product authority, separate Web/extension sessions, consent, billing,
  content storage and release policies remain under their existing interfaces.

The checking UI owns six original locally bundled font files and their pinned
OFL provenance under `packages/ui/public/fonts`, with complete Adobe/Lucide
notices in built distributions. The withdrawn optional relocation is absent:
#105 PDF and #213 website font paths, exact bytes, manifests, runtime packaging
and source ownership are preserved. No backend/UI font build coupling was added.
The website publication fingerprint also binds the now-transitive rendered
`outcome-badges.tsx` input; its existing coverage is retained.

## Public seams and red/green evidence

The owner approved real Web/native-panel journeys over existing APIs, DE/EN
catalogs, actual local Pagefind, generated PDF and packaged assets. Existing
external-provider and Account-authority fixtures stay at their HTTP boundaries.

Observed red before green: absent GridList, compact toolbar, command launcher,
local font faces, explicit reconnect and History restart confirmation; the
standalone service-link leak; enabled zero-count filters; History focus lost
when a native consent button disabled itself during its request; and a
publication fingerprint unchanged by its newly transitive badge module. The
corresponding public-output journeys now pass. Native axe also exposed two controls partly
covered by the strip; moving it to the feed boundary made all four affected
DE/EN import/revision journeys pass, with the axe assertions retained. Existing
detail, transport, storage, candidate, export and lifecycle assertions are retained. The old empty-filter assertion now
uses a real Manual override to move a result out of its active filter, preserving
both the empty state and Show all recovery checks.

## Validation

Commands run from the repository root unless a package filter is shown. Browser
suites use one worker and isolated fixture databases; PostgreSQL-heavy final
suites run serially. Local logs/traces are ignored artifacts under `.tmp/211-*`
and the package test-result directories, not publication or qualification proof.

| Check | Observed result |
| --- | --- |
| `pnpm pagefind:verify` | Controlled Pagefind 1.5.2 verified; no gate bypass |
| `pnpm typecheck` | 22 tasks passed after final code and integration |
| `pnpm lint` | 22 tasks and repository Prettier check passed |
| `pnpm i18n:check` | 580 paired DE/EN messages; website content check passed |
| `pnpm build` | 13 tasks passed, including standalone website i18n preparation |
| `pnpm --filter @source-taster/extension test` | 22 passed; both package targets include six exact font hashes and complete notices |
| `pnpm --filter @source-taster/ui test` | 2 passed; React-free recipe/Toast boundaries |
| `pnpm --filter @source-taster/i18n test` | 5 passed |
| Default Web Playwright suite | 101 passed, including upload/selection/import/export, revisions, manual provenance, cancellation/Reset/reconnect, DE/EN, narrow zoom and axe |
| Final Web `checking-shell.spec.ts workspace.spec.ts manual-overrides.spec.ts revisions.spec.ts` | 27 passed after the final strip placement; includes preserved empty-filter recovery |
| Hosted shell Playwright suite | 8 passed after the History focus fix; DE/EN History, content-free handoff, fail-closed session, actual pre-search count/first-N completion and explicit standalone mode |
| Native Chromium panel functional suite | 16 passed after final strip placement, including actual upload, Bibliography selection, manual overrides, revisions, import/export, archive evidence, reopen/storage and axe |
| Native/Web synthetic-witness parity | Both EN/DE journeys passed in the preceding broad native run (12 witnesses each); not repeated after the final DOM-only strip relocation |
| Chromium selection/runtime/Undo suite | 13 passed on owned ports; native Firefox excluded explicitly |
| Native Account regressions | 4 passed: opaque credential/reload, access-token/sign-out, German keyboard confirmation, separate actual Web/native sessions |
| UI primitives Chromium | 14 passed: DE/EN light/dark, keyboard/modality, 320 px/zoom, reduced settings and actual glass contrast |
| Website `publication-inputs.spec.ts notices.spec.ts website.spec.ts privacy.spec.ts` | 15 passed after restoring original medium ownership; actual local Pagefind, source delivery, notices, no external resources/storage and transitive fingerprint invalidation |
| PDF structure suite | 13 passed on the original report fonts, independently parsed generated output |
| PDF packaged-assets suite | 1 passed using a local no-database Vitest config selecting `test/report-assets.test.ts`; emitted worker generates from exact manifest-bound original assets/notices |
| Web distribution asset inspection | Six built font SHA-256 values match pinned provenance; complete OFL, Adobe, Lucide and provenance files are byte-identical to owned sources |

The 101-case Web run preceded the final zero-count, History pending-focus and
strip-placement refinements. All 27 affected standalone journeys were repeated
after the final layout change. The final native functional run excludes only the
previously passing synthetic parity journeys; the repository's full suite and native
gates remain intact.
The History pending-focus fix was observed red and then passed in both
languages; the complete hosted suite passed against the final layout. Its first-N
journeys additionally wait for all 20 selected Verdicts before closing the
streaming client and changing the fixture Account identity. A minimized EN/DE
run reproduced the cross-case failure before that added completion assertion and
passed afterwards. No arbitrary sleep, retry, fabricated result or weaker
assertion was introduced. Final static/package checks follow all code refinements
and the integration merge.
Withdrawn-relocation-era observations are not counted in this table.

Exact browser commands (with the owned port environment listed below):

```sh
pnpm --filter @source-taster/web exec playwright test --output test-results-211-final
pnpm --filter @source-taster/web exec playwright test checking-shell.spec.ts workspace.spec.ts manual-overrides.spec.ts revisions.spec.ts --output test-results-211-focus-final
pnpm --filter @source-taster/web exec playwright test --config shell.playwright.config.ts
pnpm --filter @source-taster/extension exec playwright test --grep-invert 'synthetic witnesses' --output test-results-211-handoff
pnpm --filter @source-taster/extension exec playwright test --config selection.playwright.config.ts --grep-invert 'Firefox native selection' --output test-results-selection-211-handoff
pnpm --filter @source-taster/extension exec playwright test --config account.playwright.config.ts panel.spec.ts --grep 'native sign-in persists|Account verification uses|German native email-code|actual web UI keeps' --output test-results-account-211-handoff
```

Reproduction environment for real document uploads:

```sh
SOURCE_TASTER_DOCUMENT_IMAGE=$(cat /tmp/source-taster-design-document-image-id)
```

Owned final ports: Web/API `5622/3622`; hosted Web/API/HTTP-edge authority
`5623/3623/4623`; native panel Web/API `5613/3613`; selection Web/API/auxiliary
`5615/3615/3616`; native Account Web/API/authority `5618/3618/4618`; website `5624`.
The extractor was the existing isolated digest
`sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707`.

## Remaining qualification gates

The owner-approved private test source remains at
`a6d358ea41eb6be1ede14e6d2634460d358509a4`, with clean tracked files. Existing
both-program Account/History fixture attempts stop on HTTP 404 at the required
sign-in challenge prerequisite. No private tracked source, branch or dependencies
were modified. Only the public journey outcome and source SHA are recorded here.
The public hosted shell suite instead uses the established HTTP-edge Account
authority fixture with real verification API/worker/PostgreSQL; it does not
qualify the private implementation.

#207 remains open. Agent provenance is not specialist clearance, brand approval
or permission to activate private token consumption. Human screen-reader,
supported Web Safari/Firefox, native Firefox extension and OS context-menu,
frozen-quality/release, translation/publication and PDF-specific human acceptance
remain separate gates.
Chromium synthetic-witness Web/panel parity is not frozen release parity. The
controlled native dependency, PDF/UA and publication gates were not relaxed.
No new Check lifecycle or speculative structured suggestion fields were added;
the accepted new detail treatment is the separate #212 task.

The parent owns integration PR #220 and final review. No PR, push, issue closure,
subagent or other-worktree mutation is part of this implementation.
