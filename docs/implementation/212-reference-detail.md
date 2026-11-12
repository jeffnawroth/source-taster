# #212 — Reference detail and explicit Apply to fields

Public implementation completed on 11 November 2026 under the TDD workflow. The
worktree started at the required base `136748f` on `implement/design-remaining`.
The moved integration tip `fa62043` (#221 Rustix fix) is merged. AGENTS.md,
GLOSSARY.md, the issue and its dependencies (#206, #211), the accepted ADR-0027,
`components.md` §3.6 (TrackedChange) and the detail order in the design
specification informed the work. No server, contract, billing or migration
change was made.

## Delivered behavior

- The detail leads with the effective Verdict in a sticky glass header. Then
  come Original text, the comparison table, the Evidence disclosure (Candidates
  live inside it), the Correction suggestion with its actions, the field editor
  and Manual judgment. Escape and narrow Back restore feed focus, scroll and the
  filter. There is no Pager (see Review follow-up).
- An unsaved draft belongs to its slot, not to the mounted detail. Selecting
  another Reference (pointer or keyboard), changing the filter, Escape and Back
  keep it; reopening the Reference shows it again. Only Discard, a successful
  save or Replace in the Apply confirmation ends it.
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
  change runs, until the current result's suggestion has loaded, for results
  without a proven suggestion, and when the suggestion has no value that differs
  from the committed fields (so it never creates a no-op draft). A Reference
  without a suggestion shows an empty-state sentence instead of a disabled
  reason. An unbilled technical Status explains the quota consequence and
  offers no Apply.
- Manual judgment is a RadioGroup of the six Verdicts (glyph and label each),
  preset to the current Verdict.
- Exports (CSL-JSON/BibTeX original), the formatted bibliography (RTF) and the
  PDF report use committed fields only, never an Apply draft.
- On two panes the detail opens beside the list by default. A filter keeps the
  open detail only while its Reference still matches. A single pane returns to
  the filtered list. The pane state is `auto`, `open` or `closed` (Back). The
  stylesheet is the only breakpoint source and resolves `auto`, so resizing
  never passes through a state that hides the focused feed row. An explicitly
  opened detail stays open on a single pane; a filter change returns `open` to
  `auto`, without reading `matchMedia`.

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

## Review follow-up (review of `136748f...ceb4161`)

Fixed on `fix/212-review`. The owner decided the dirty-draft guard, the Pager
removal and the primitive migration; the rest follows the review's rule: keep
what ADR-0027, `components.md` or the styleguide specify or a spec rule needs,
otherwise revert.

- **Dirty-draft guard: keep the draft.** The feed is a GridList whose keyboard
  selection follows focus, so a confirmation on every arrow key is not
  workable. Drafts and in-flight requests therefore live in a per-slot store
  (`useReferenceWork`, `packages/ui/src/reference-work.ts`) above the keyed
  detail. The store sits inside `CheckResults`, which is keyed by Check, so a
  draft never crosses Checks.
- **Pager removed** with its counter and the `detail_pager`, `detail_previous`,
  `detail_next` and `detail_position` messages. `components.md` §3.5 item 1
  item 1 described it; the owner decided to remove it, so the design doc was
  updated in the same change.
- **Primitive migration finished** where raw controls sat beside primitives:
  author inputs (TextField), the truncated-authors and export-choice Checkbox,
  Copy (ghost Button), the manual verdict (Buttons, RadioGroup). Buttons use
  variants (`primary` for the commit, `ghost` for Discard, Cancel and Copy), no
  className overrides. `.st-choice` gained `position: relative` so the visually
  hidden input stays inside its label. `ReferenceListActions` predates #212 and
  keeps its raw controls.
- **Kept by spec:** sticky glass header (ADR-0027 L16; `components.md` L44,
  L314), OriginalInput reskin (L315), ≠ glyph (L316), manual-verdict hardening
  (the stale and concurrent reply rule), now through the shared snapshot gate.
- **Export choice binding kept:** the choice is bound to the result id plus the
  outcome. Those are exactly the inputs of the server's result token
  (`suggestionToken`). Outcome alone, as before #212, keeps a choice across a
  re-check with identical data whose token the server then rejects; the
  same-revision Re-check journey asserts the choice is dropped.
- **Drafts bind to identity:** `resultBinding` is Check, slot, revision and
  result id, never the outcome JSON, so an update that re-serializes the same
  result does not make a draft stale.
- **Summary counts:** `effectiveVerdict` returns no Verdict for a Status, so a
  re-checking slot is never counted; covered by "while a saved Apply draft
  re-checks, the earlier Verdict is not counted as current".
- **TrackedChange against the original, by spec** (`components.md` §3.6:
  "against the original"). Formatting differences can read as insertions. The
  client has no same-style rendering of the committed fields per entry (only
  `suggestion` and an optional whole bibliography), so no change was made.
- **Manual verdict note field omitted:** `components.md` item 8 names one, but
  `SetManualOverrideRequest` has no note, and adding one is a contract change
  outside #212.
- **Standards:** the lower-case "status" in `detail_status_evidence`;
  `correction_fields_unavailable` is now only a disabled reason and the empty
  state has its own `correction_none_current`; new
  `correction_fields_unchanged`.
- **Judgement calls done:** one breakpoint source (stylesheet), one draft
  object (`FieldDraft`), the `auto | open | closed` union, the names
  `unavailableReason`, `hasCurrentResult` and `bibliography`, and one shared
  busy and snapshot gate (`useReferenceWork`, `useSnapshotGate`) plus a shared
  `errorMessage`.
- **Skipped:** the `availability()` helper stays (two call sites, it carries
  the one busy reason); splitting `reference-actions.tsx` is a refactor without
  behavior change, outside this fix; the `.detail-verdict-header` `top: -16px`
  stays coupled to the detail's `p-4`, as no spacing variable exists to tie
  them.
- **Manual judgment selection** (the chosen radio before Save) stays local to
  the mounted detail; it is one click to restore and no text is lost.

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

Review follow-up, observed at `ceb4161` (UI sources and catalogs of the base,
new specs) and green after the fix:

- "an unsaved draft survives selecting another Reference, keyboard selection,
  a filter change and Escape" failed at base: the draft was gone after the
  first navigation.
- "once the committed fields carry the suggestion, Apply to fields is not
  offered as a no-op" failed at base: Apply was enabled.
- "an update that keeps the same result leaves an Apply draft current" and "a
  previously unbilled slot shows its first debit once the first Verdict
  arrives" passed at base. They are coverage for the binding change and for
  the unbilled journey the review found not visibly covered.
- The Pager test became "narrow Back restores the filter and focus after
  opening a filtered Reference".

Primitive Checkbox and Radio hide their input, so Playwright reports the label
as intercepting a press on it. Web journeys press the visible label
(`getByText`) and native journeys use `clickChoice`, which presses the label of
the input found by role and name.

Existing assertions changed only where the plain suggestion text became a
TrackedChange (`corrections`, `report`, native `panel`). Each still asserts the
proven insertion and the IEEE rendering through the visible suggestion. No
`waitForTimeout`, retry or weaker assertion was added.

### Validation mapping (`apps/web/e2e/reference-detail.spec.ts`)

| Issue validation | Journey |
| --- | --- |
| Current, dirty and stale revision | Apply/Discard/Keep/Replace/Save at 320 px (EN/DE); overlay keeps Publisher; 409 retains the draft; same-revision Re-check invalidates draft and export choice; a same-result update keeps the draft current; no no-op Apply after the suggestion is committed |
| Navigation with a draft | The draft survives row and keyboard selection, a filter change and Escape |
| Cancellation and failure | Cancel with an open draft keeps it unsaved; pending Save sends once, failure retains the draft, Reset fences a late reply; late suggestion cannot attach to a newer style |
| Previously unbilled slot | Unbilled technical Status shows the quota consequence and no Apply (EN/DE); a DOI save turns it into its first debited Verdict |
| Manual reset | Save and re-check after Apply resets the current Manual override and keeps it historical; a re-checking draft does not count the earlier Verdict as current |
| Export/report snapshot | CSL-JSON/BibTeX original and RTF bibliography exclude the draft; `e2e-report/report.spec.ts` PDF excludes it |
| Keyboard/focus | Detail order and Escape focus; Escape in the replacement dialog; narrow Back restores filter and focus; focus returns to Edit after Discard |
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

### Review follow-up validation

Final run on `fix/212-review` after merging `implement/design-remaining` tip
`59f4f85` (#214), with Web/API ports 6174/6192 (bibliographic 6175/6193) and
`SOURCE_TASTER_DOCUMENT_IMAGE` set as above.

| Check | Observed result |
| --- | --- |
| `pnpm pagefind:fetch && pnpm pagefind:build && pnpm pagefind:verify` | Verified controlled Pagefind 1.5.2 |
| `pnpm typecheck` | 23 tasks passed |
| `pnpm lint` | 23 tasks passed, including the repository Prettier check |
| `pnpm i18n:check` | 595 paired DE/EN messages (4 Pager messages removed, 2 added); website content check passed |
| Web Playwright suite (`--project chromium`) | 122 passed, including 21 `reference-detail` cases |
| Web bibliographic suite (`bibliographic.playwright.config.ts`) | 22 passed |
| Web report suite (`report.playwright.config.ts`) | 2 passed |
| Native Chromium panel `panel.spec.ts revisions.spec.ts manual-overrides.spec.ts` | 12 passed |
| Native `manual-overrides.spec.ts` alone, repeated | 2 passed, three runs out of three (the first inside the full native run) |

The first native run failed the DE parity journey deterministically (3/3
reruns) and passed at `ceb4161`. Cause: the native readiness check matched the
Verdict label as a substring, and the new empty-state sentence
(`correction_none_current`, "Korrekturvorschlag") contains "Korrekt" while the
Reference is still running. The check now matches whole words; the parity
journey then passed 2/2 runs in EN and DE, and the full native run passed
12/12.

## Manual-override journey: lost Save press (#220 CI)

CI run 43157513685 failed `manual-overrides.spec.ts:71` (EN): after the second
manual judgment to "Not found" the detail still read "Manual verdict: Correct".
It passed locally. The radio selection was not the problem: the Save press was
lost, so no submit ran.

**Cause (product bug, not a test race).** `.check-detail` scrolls (max-height,
`overflow-y: auto`) but was not positioned. The correction diff's visually hidden
labels (`span.sr-only`, "Deleted:"/"Inserted:") are absolutely positioned, so
their containing block was outside the scroller. They escaped its clip and added
phantom scrollable overflow to the page: at 360 x 780 the document was 6339 px
tall while the app root was 3933 px. Layout changes inside the detail (the
correction suggestions render roughly 50-300 ms after "Judge manually" and add
235-350 px) then move the window scroll. In the captured failures the window
moved 3387 to 3152 (and in another capture 3130 to 3387) between Save's
pointerdown and focusin, with no JavaScript `focus`, `scrollTo` or
`scrollIntoView` call and an unchanged detail scroll. Pointerup then landed on
another element, so no click or submit fired. Captured only with real CPU
contention (busy loops on every core, `CI=1`); CDP CPU throttling alone never
reproduced it. A real mouse user pressing a Button in the detail is exposed the
same way. This is the same class as the earlier "native focus scrolls the nested
detail scroller mid-press" note (focus after Discard).

**Causation check.** With the stylesheet fix reverted, inserting a 300 px block
above Save while the pointer is down moved the window from 3153 to 3453 and the
press was lost; with the fix the window stays at 3153 and the press saves.

**Ruled out:** the radio preset or selection state (the draft keeps "Not found"
and the press reached Save), a RadioGroup label press, and the
`scroll-padding-block-start` band (padding 141 px, no jump at any Save offset).

**Fix.** `.check-detail { position: relative }` in
`packages/ui/src/workspace.css`, so the scroller clips its hidden descendants and
the page range equals the app height (6339 to 3933 px).

**Test-first evidence** (`apps/web/e2e/manual-overrides.spec.ts`, 360 px, after
Confirm verdict and Judge manually, hidden diff labels present). Both are red on
the pristine stylesheet and green with the fix:

- "the scrolling reference detail does not extend the page's scroll range":
  document height must not exceed the app root (red: 6339 against 3933).
- "a layout change in the detail during a Save press does not lose the press":
  pointer down on Save, late 300 px content above it, pointer up; the window
  scroll must not move and the verdict must save (red: scroll 3153 to 3453).

**Evidence.** Instrumented repro, 60 repeats under full-core CPU load: 2 failed
before the fix (one of them this press loss; the other a check that stayed
"Running" under load), 60/60 passed after it. At the original rate of about 1 in
30-60 that alone is weak evidence; the deterministic tests carry the causal
claim. Full web suite (`--project chromium`): 123/123. Native panel, revisions
and manual-overrides suites: 12/12. The native journey presses with real mouse
events after `scrollIntoViewIfNeeded` (the same pattern) and renders the same
detail from `@source-taster/ui`; the side panel's document-versus-root height
was not measured separately.

## Open

- Before the review follow-up, one native `manual-overrides` (EN) run failed
  once: the Manual verdict combobox (now a RadioGroup) never appeared after
  "Judge manually". It did not recur in the follow-up's runs. The UI code was identical to
  the passing runs before and after it (the merge changed only lock files and
  docs). The cause was not reproduced then. It is likely the same mechanism as
  above (page scroll range moving mid-press), but this is not verified in the
  side panel; the phantom overflow itself is fixed in the stylesheet. The earlier
  Discard → Edit fields focus handling remains. `.check-list` also scrolls; whether
  it holds absolutely positioned hidden content was not checked, and it would
  need the same containing block if it does.
- The Quota-journal suite needs the private service worktree and was not run.
  Billing copy is covered by the debited/unbilled journeys and by "no request
  on Apply". No server or billing code changed.
- `components.md` §3.5 item 8 still names a note field for Manual judgment;
  it needs a contract change and stays out of #212. The Pager was removed from
  §3.5 item 1 together with the code.
- Human screen-reader, Safari/Firefox, native Firefox and release acceptance
  remain separate gates.

No push, PR or issue closure is part of this implementation.
