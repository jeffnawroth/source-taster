# #212 — Reference detail and explicit Apply to fields

Public implementation completed on 11 November 2026 under the TDD workflow. The
worktree started at the required base `136748f` on `implement/design-remaining`.
The moved integration tip `fa62043` (#221 Rustix fix) is merged. AGENTS.md,
GLOSSARY.md, the issue and its dependencies (#206, #211), the accepted ADR-0027,
`components.md` §3.6 (TrackedChange) and the detail order in the design
specification informed the work. No server, contract, billing or migration
change was made.

## Delivered behavior

- The detail leads with the effective Verdict in a sticky glass header that
  also holds the Pager. Then come Original text, the comparison table, the
  Evidence disclosure (Candidates live inside it), the Correction suggestion
  with its actions, the field editor and Manual judgment. The Pager pages
  within the active filter ("n of m"). Escape and narrow Back restore feed
  focus, scroll and the filter.
- The Correction suggestion is a TrackedChange preview against the Original
  text. It is a word-level diff where deletions precede insertions: a neutral
  strike for deletions, a 2 px underline for insertions and sr-only
  "Deleted:"/"Inserted:" labels. It is never green. Copy still yields the clean
  suggestion text.
- **Apply to fields** overlays the proven `entries[].suggestion.csl` onto a
  local draft bound to the current result. Committed fields absent from the
  suggestion (for example Publisher) are kept, as is `authorsTruncated`.
  - Apply sends no request and debits nothing.
  - Discard restores the committed fields and returns focus to Edit fields.
  - A dirty draft is replaced only after a Keep/Replace confirmation. Escape
    in that dialog keeps the draft.
  - A stale draft (same-revision Re-check, newer revision elsewhere, 409) is
    retained but cannot be saved; only Discard leaves it.
  - "Save and re-check" is the only commit. It sends one revision plus
    re-check and resets a current Manual override, which stays on the
    historical result.
- Apply is unavailable, with an explanation, while a save, re-check or verdict
  change runs, until the current result's suggestion has loaded, and for
  results without a proven suggestion. An unbilled technical Status explains
  the quota consequence and offers no Apply.
- Exports (CSL-JSON/BibTeX original), the formatted bibliography (RTF) and the
  PDF report use committed fields only, never an Apply draft.
- On two panes the detail opens beside the list by default. A filter keeps the
  open detail only while its Reference still matches. A single pane returns to
  the filtered list. The pane state is `default`, `true` (opened) or `false`
  (Back). The stylesheet resolves `default` per breakpoint, so resizing never
  passes through a state that hides the focused feed row. An explicitly opened
  detail stays open on a single pane.

## Decisions

- **Overlay, not replace:** the suggestion carries only proven fields, so a
  replace would silently drop committed values such as Publisher.
- **TrackedChange replaces the plain suggestion text** (§3.6). Assertions that
  read the old plain text now read the kept and inserted parts. Copy output is
  unchanged.
- **Candidates stay inside the Evidence disclosure**, so the documented order
  holds without losing the candidate list.
- **Focus after Discard:** the pressed control unmounts, so focus returns to its
  opener. Without this, the next Edit press moved focus natively, scrolled the
  nested detail scroller mid-press and lost the press in the existing DE
  revision-save-only journey. That journey passes at base and failed 3/3 before
  the fix.
- **External re-check:** a re-check triggered through the API without the
  browser lease ends as Cancelled. The stale-draft journey therefore uses the
  in-browser Re-check.

## Public seams and red/green evidence

Real Web and native-panel journeys run over the existing verification API, the
DE/EN catalogs and the deterministic DOI fixtures (`10.1038/nphys1170`
deviating and correct, `10.5555/browser-held` held). The generated PDF report is
parsed independently. External providers stay at their HTTP boundaries.

Observed red before green:

- At base, all 15 original `reference-detail.spec.ts` cases failed: no Apply to fields,
  TrackedChange, Pager, header or detail order.
- The focus-after-Discard assertion failed in EN and DE before its fix.
- The narrow filter and 320 px zoom journeys (`manual-overrides`, `workspace`)
  and the resize journey in `checking-shell` regressed when the detail opened by
  default on two panes. A first fix that used a JavaScript breakpoint listener
  still lost feed focus for one frame. All three pass with the stylesheet-resolved
  pane state, and the new two-pane filter journey covers the kept detail.

Existing assertions changed only where the plain suggestion text became a
TrackedChange (`corrections`, `report`, native `panel`). Each still asserts the
proven insertion and the IEEE rendering through the visible suggestion. No
`waitForTimeout`, retry or weaker assertion was added.

### Validation mapping (`apps/web/e2e/reference-detail.spec.ts`)

| Issue validation | Journey |
| --- | --- |
| Current, dirty and stale revision | Apply/Discard/Keep/Replace/Save at 320 px (EN/DE); overlay keeps Publisher; 409 retains the draft; same-revision Re-check invalidates draft and export choice |
| Cancellation and failure | Cancel with an open draft keeps it unsaved; pending Save sends once, failure retains the draft, Reset fences a late reply; late suggestion cannot attach to a newer style |
| Previously unbilled slot | Unbilled technical Status explains why Apply is unavailable (EN/DE) |
| Manual reset | Save and re-check after Apply resets the current Manual override and keeps it historical; a re-checking draft does not count the earlier Verdict as current |
| Export/report snapshot | CSL-JSON/BibTeX original and RTF bibliography exclude the draft; `e2e-report/report.spec.ts` PDF excludes it |
| Keyboard/focus | Detail order and Escape focus; Escape in the replacement dialog; Pager within the filter and narrow Back; focus returns to Edit after Discard |
| 320 px reflow | No horizontal scroll and axe clean at 320 px (EN/DE) |
| Two-pane filter | A filter keeps the open detail only while its Reference matches |

## Validation

Commands run from the repository root on the merged head. Browser suites use
one worker on owned ports (Web/API `5712/3712`, report `5722/5721`, native panel
`5793/3793`). Logs and traces are ignored artifacts under the package
`test-results-212-*` directories.

| Check | Observed result |
| --- | --- |
| `pnpm pagefind:fetch && pnpm pagefind:build && pnpm pagefind:verify` | Verified controlled Pagefind 1.5.2; required again after merging the #221 Rolldown lock change |
| `pnpm typecheck` | 22 tasks passed |
| `pnpm lint` | 22 tasks and repository Prettier check passed |
| `pnpm i18n:check` | 597 paired DE/EN messages; website content check passed |
| Web Playwright suite (`--project chromium`) | 117 passed in 23 files, including 16 `reference-detail` cases |
| Web report suite (`report.playwright.config.ts`) | 2 passed; the generated PDF excludes an Apply draft |
| Native Chromium panel `panel.spec.ts revisions.spec.ts manual-overrides.spec.ts` | 12 passed |

The full Web run sets `SOURCE_TASTER_DOCUMENT_IMAGE` to the existing isolated
extractor, as in #211. Without it, the six document upload journeys
(`bibliography-selection`, `documents`, `intake-composition`) fail at upload.
Those journeys passed 10/10 in a separate run with the image set. The native
suites passed 12/12 before the merge and in the final run. One run in between
failed once (see Open).

```sh
SOURCE_TASTER_DOCUMENT_IMAGE=$(cat /tmp/source-taster-design-document-image-id) \
  pnpm --filter @source-taster/web exec playwright test --project chromium --output test-results-212-final2
pnpm --filter @source-taster/web exec playwright test --config report.playwright.config.ts --output test-results-212-final2-report
pnpm --filter @source-taster/extension exec playwright test panel.spec.ts revisions.spec.ts manual-overrides.spec.ts
```

## Open

- Selecting another Reference, by feed row or by the new Pager, discards an
  unsaved draft without confirmation. The remount on selection predates #212,
  but the Pager adds a one-click route from the detail itself. ADR-0027's
  confirmation covers Apply replacing a draft, not navigation; extending it is
  an owner decision and was not added.
- One native `manual-overrides` (EN) run failed once: the Manual verdict
  combobox never appeared after "Judge manually". The UI code was identical to
  the passing runs before and after it (the merge changed only lock files and
  docs). The cause was not reproduced. It matches the diagnosed lost-press
  mechanism: native focus scrolls the nested detail scroller mid-press. That
  mechanism is fixed only for Discard → Edit fields, so other partly clipped
  detail buttons may still lose a press.
- The Quota-journal suite needs the private service worktree and was not run.
  Billing copy is covered by the debited/unbilled journeys and by "no request
  on Apply". No server or billing code changed.
- Human screen-reader, Safari/Firefox, native Firefox and release acceptance
  remain separate gates.

No push, PR or issue closure is part of this implementation.
