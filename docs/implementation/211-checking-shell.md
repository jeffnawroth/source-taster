# #211 — Shared checking shell

Implementation checkpoint, 11 November 2026. Work is still in progress.

The prepared isolated branch started exactly at required integration commit
`55275f49179ac0a2dc832f19ac407161f5202fb4`; ancestry was verified before edits.
Integration follow-up `d5c33ce06c3d04e83ec321cd17382bee2bc20536` was merged
before implementation. AGENTS.md, GLOSSARY.md, the issue and its closed native
dependencies, accepted ADR-0027/0016/0023 and the component/style specifications
were read. The explicitly invoked implement-spec and TDD skills and TDD support
files govern this work. No subagent, predecessor, push, PR or issue closure is
part of this branch.

Public seams: real web/native-panel journeys over existing verification APIs,
DE/EN catalogs and packaged assets. External-provider and Account-authority
fixtures remain at their existing HTTP boundaries. Product authority, identity,
content storage, consent, billing, native dependency and release gates are not
relaxed.

Observed red/green so far:

- The new streamed GridList test first failed because no grid existed. It then
  passed with stable input order, roving keyboard focus and narrow Back return.
- Compact summary tests first failed because no toolbar existed; both DE/EN
  320px dark/reduced-motion journeys passed with six glyph filters, separate
  Status menu, labelled active filter and label reveal.
- Existing-action launcher tests first failed because no launcher existed;
  both DE/EN journeys passed with Escape/focus restoration and intake focus.
- Font loading first returned zero actual font faces. The same browser test
  passed after local fonts were bundled; it observes no external requests.
- Both DE/EN explicit reconnect tests first failed on the absent action and
  then passed: a real snapshot read restores the same Check after a simulated
  stream 503, with exactly one Check creation.
- Three native Chromium journeys passed: actual toolbar/panel opening, English
  synthetic-witness Web/panel outcome parity, and DE/EN close/reopen/reload with
  preference-only storage and axe assertions.
- A 97-case exploratory Web run passed 71. Follow-up 31-case regression run
  passed 22. Remaining failures included selectors for the new compact filter,
  duplicate finding text, an accessible-name mismatch and tests interrupted by
  concurrent development reloads; they are not passing validation evidence.
  Two real DOCX/PDF upload journeys passed in the follow-up run with the existing
  isolated document image from `/tmp/source-taster-design-document-image-id`.
- Workspace typecheck passed before the latest follow-up edits. Final full
  checks, packaging and serial regressions are still required.

The owner-approved existing private test source is at
`a6d358ea41eb6be1ede14e6d2634460d358509a4`. Its tracked files were clean. Existing
both-program Account/History fixtures currently stop on an HTTP 404 for their
required sign-in challenge route. No private tracked code, branch, dependency,
content or design-token consumption was changed. New public shell tests use the
established public HTTP-edge Account-authority fixture with the real verification
API/worker/PostgreSQL; they do not qualify the private implementation.

History restart confirmation and final focused regression fixes remain under
active implementation. Human screen-reader, supported native-browser, release
and #207 rights qualifications remain separate and open. Agent provenance is
not specialist clearance or private token/brand activation approval.

## Second checkpoint

History now uses a modal drawer and a nested safe-focus confirmation. Its new
public HTTP-edge Account journey observed the absent alert dialog as red and
passed after implementation in DE/EN. Public hosted handoff, fail-closed session
and first-N behavior have passing English/DE cases; one parallel run encountered
transient HTTP 500s and is being repeated serially after stopping only orphaned
processes whose working directory belonged to this worktree.

Four native Account regressions now pass: opaque-credential persistence/reload,
Account-token verification and sign-out everywhere, German keyboard confirmation
and scoped sign-out, and separate actual Web/native sessions. Navigation asserts
the full accessible Account name in the narrow panel and explicitly opens the
entry before sign-out. The draft and original transport/storage assertions stay.

All 22 extension package/preference tests pass, including exact built font
hashes and full OFL/Lucide/Adobe notices in Chromium and Firefox packages. The two
UI boundary tests and five catalog tests pass. Workspace typecheck, lint and
DE/EN checks passed at this checkpoint. A concurrent website build collided with
another build's output directory; the serial `pnpm build` passed. These checks
must be repeated after the latest integration/font consolidation.

The standalone-mode test exposed a real service-UI leak when a service URL was
configured despite explicit standalone mode: the statutory service link was
rendered. Its mount is now limited to hosted mode; hosted service failure still
leaves that independent statutory link reachable. This is mode enforcement,
not a change to cancellation policy.
