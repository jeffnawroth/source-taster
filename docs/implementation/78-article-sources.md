# #78 remaining article Data sources and source failures

This file records the implementation of #78 under spec #70. The work used the
TDD skill and ran as an implementation sub-agent in the T3-bound worktree
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-cd316e76`, on
`implement/78-article-sources`. It is based on `origin/spec/70-78-article-sources`
at `75dca7caf22c7396f81c1b61dec1579c74274b37`. Outside this branch, nothing was
created or changed: no replacement checkout, child, access to the predecessor
repository, edit to the private service, issue or PR change, push to the
integration branch, deployment or publication. Integration and independent
review are the parent's responsibility.

## Behavior

Three new adapters share the existing bounded request, body, retry and
PostgreSQL budget transport:

- **Europe PMC** (`apps/server/src/sources/europepmc.ts`). PMID and PMCID lookup
  plus bibliographic search, all through the REST `search` endpoint with
  `resultType=core` and `format=json`. A lookup that returns a different
  identifier is unavailable (`identifier-mismatch`), not a match. `hitCount` 0
  is a completed empty result.
- **Semantic Scholar** (`apps/server/src/sources/semanticscholar.ts`). The
  `ARXIV:` index lookup and bibliographic search (`/graph/v1/paper/search`,
  limit 5). A 404 on a lookup is a completed empty result.
- **arXiv** (`apps/server/src/sources/arxiv.ts`). Identifier lookup only:
  `id_list` against the Atom API, read by a bounded parser. arXiv is never
  searched.

Routes follow ADR-0007:

- A supplied DOI goes to doi.org first, then OpenAlex and Crossref.
- PMID goes to OpenAlex, then Europe PMC. PMCID goes to OpenAlex, which is
  recorded as `unsupported` without a request, then Europe PMC.
- arXiv goes to the Semantic Scholar `ARXIV:` index, then the arXiv API.
- Bibliographic search runs OpenAlex, Crossref, Europe PMC, Semantic Scholar.

Core normalizes arXiv identifiers (`arXiv:` prefix, abs/pdf URLs and version
suffix) and carries them as `Csl.arXiv`. The existing #77 rules still apply:
one allocator per Data source, five Candidate slots and early termination.
Identifier identity settled by a DOI therefore ends retrieval before any PMCID
or arXiv request.

### Source failures

A transport failure makes a Data source unavailable for the rest of that
Reference. The failures are a timeout (new evidence reason `timeout`), a
rate-limit wait beyond its bound (`rate-budget`), an HTTP error (`http-error`)
or an unreachable source (`request-unavailable`). Later operations for that
source are recorded as `unavailable` / `after-source-failure` and send no
request. The other sources continue. This keeps one slow provider from consuming
the 30-second Reference deadline once per search kind.

`failedSources` names every source with unavailable evidence:

- Not found requires every enabled search source to complete. One failure blocks
  it (ADR-0008, `insufficient-search`).
- When every responsible source failed, the Verdict is Not verifiable with the
  new reason `sources-unavailable`. It is never Not found.
- Disabled sources are recorded as `disabled` / `operator-disabled` and are never
  failed.

The web result shows the failed sources as a list under the reasons, outside
the evidence details. Each entry gives its cause: did not respond in time,
request limit or waiting time, Reference time limit, or error/unreachable.
Source names are now display names: doi.org, Crossref, OpenAlex, Europe PMC,
Semantic Scholar, arXiv. They are used in the progress line, evidence list,
Candidate heading and retraction provenance. Source links now cover Europe PMC,
arXiv and Semantic Scholar records without a DOI. English and German messages
were added; the identifier-mismatch text now says "identifier" rather than
"DOI".

### Operating settings

`packages/core/src/search-settings.ts` holds the ADR-0007 initial values:

- 3 s request timeout, one retry, a Retry-After bound of 2 s.
- At most 10 running References per Check, 20 References per worker.
- Owner-then-Check round robin.
- Per-source interval, concurrency and maximum permit wait. The values are
  doi.org 50 ms; Crossref 200 ms (1 s for searches) with concurrency 1;
  OpenAlex 1 s / 1; Europe PMC 100 ms / 1; Semantic Scholar 1 s / 1;
  arXiv 3 s / 1.

The Operator changes them with `SOURCE_TASTER_SEARCH_SETTINGS`, a strict JSON
patch over the defaults. The config validates bounds and rejects unknown keys and
sources. An invalid patch, or settings without the bibliographic preview, refuses
startup (exit 78). Each Version 2 article result records the flattened settings
in its Search configuration. A 16-hex SHA-256 over their canonical form enters the
Search strategy version:
`article-search-78-1-<sources>-settings-<hash>-uncalibrated`. The verdict rules
suffix is `article-verdict-78-1`.

The budget reads per-source settings. The Check store applies
`activeReferencesPerCheck` and orders dispatch by the Owner's latest running
Check dispatch order first. Owners therefore alternate before one Owner's Checks
do. This needs no migration. The 30-second hard deadline is not an operator
setting (see deviations).

### Retraction hook

A Europe PMC record whose `pubTypeList` contains `Retracted Publication` adds
affirmative retraction evidence (`source: "europepmc"`) to the record already
received. It uses the existing #77 rule that ties evidence to the Best match
independently of the Verdict. No request is made for retraction. Without
affirmative evidence the result stays `unknown`. Semantic Scholar and arXiv
supply no retraction evidence.

### Contract

Version 2 adds the source names and the `arxiv` operation. It also adds the
`timeout` and `after-source-failure` evidence reasons, the `sources-unavailable`
reason, the progress values and the Europe PMC retraction source. The v2
`StructuredCsl` accepts `arXiv`, and Candidate CSL uses the v2 shape. The
committed `dist` and `openapi-v2.json` are regenerated. Version 1 and its
`openapi.json` are unchanged. A Version 1 create keeps the DOI tracer and default
budgets (maximum permit wait 30 s) regardless of the new settings.

## Acceptance criteria and public evidence

All server tests use real PostgreSQL and the public `/v2` HTTP/SSE API. Provider
HTTP is replaced by loopback fixtures; no internal call is mocked.

| Criterion | Tests |
| --- | --- |
| Europe PMC, Semantic Scholar, arXiv (identifier only) adapters with recorded fixtures; DOI first. **Partially met:** Semantic Scholar has no recorded fixture (see below) | `article-sources.test.ts`: "identifies a PMCID through Europe PMC…", "handles a supplied DOI before the PMCID and arXiv routes", "identifies an arXiv identifier through the Semantic Scholar index…", "falls back to the arXiv API, identifier only…" |
| A timeout, rate-limit wait or error lets the search continue and is named | "continues past a failing, a timed-out and a rate-limited source and names each"; browser `e2e-bibliographic/search.spec.ts` "names a failed Data source instead of reporting Not found" (EN/DE, axe) |
| All responsible sources fail: Not verifiable naming them, never Not found | "is Not verifiable naming every source when all responsible sources fail"; "blocks Not found while one responsible source has failed"; "reaches Not found only when every enabled search source completed" |
| Per-source budgets, timeouts and Owner fairness are versioned operating settings | "versions the Operator's search operating settings with the Search strategy"; five startup-refusal cases; `article-fairness.test.ts` "alternates between Owners…" and "caps running References per Check…" |
| Retraction hook only | "records a Europe PMC retraction report already received, without an extra request"; the PMCID test asserts `unknown` without evidence |

The recorded fixtures, their URLs, hashes, sanitization and rights are listed in
[the fixture README](../../apps/server/test/fixtures/article-sources/README.md).
No Semantic Scholar payload is stored: the live request returned 429 and the data
licence is unresolved. Its tests use synthetic records.

### Test-first record

- The adapters, failure continuation and failure naming were each written RED
  first.
- While the failure test was RED, it timed out because a failed source was asked
  again for every search kind. That led to the `after-source-failure` rule.
- Both fairness tests failed against a store with the cap and Owner ordering
  reverted, and pass with them.
- The first cap test passed without the cap because of pg-boss polling. It now
  observes a bounded 1.5 s window and was re-verified RED and GREEN.
- The retraction, settings-versioning, startup-refusal and DOI-precedence tests
  passed on their first run, because the implementation already existed. They
  are characterization witnesses, not RED→GREEN evidence.
- The browser witness was added after the UI change.

Existing #77 tests changed in three ways:

- Exact version literals became prefix/suffix checks, because the version now
  carries the settings hash.
- One completed-search case now also asserts that Europe PMC and Semantic Scholar
  are disabled and not failed.
- The test fixture's `reset()` now releases holds.

## Deviations and open questions

- **arXiv not implemented in full.** Cross-Check arXiv batching and Semantic
  Scholar 200 ms batching from ADR-0007 are not implemented; lookups are single
  and rate-limited. The parser does not extract arXiv identifiers from free
  text; only structured `arXiv` input is routed. arXiv is not a compared field.
- **Semantic Scholar as the arXiv index.** It is the index ahead of the arXiv
  API, chosen from ADR-0007's route list. Its data licence for a paid product
  is unresolved (research note), and no Semantic Scholar payload is stored.
- **Deadline not a setting.** The 30-second Reference deadline remains the
  ADR-0007 constant.
- **Timeout is global.** The criterion names per-source timeouts, but only one
  `requestTimeoutMs` exists and it applies to every source. The per-source
  settings are interval, concurrency and maximum permit wait.
- **Fairness is not switchable.** `fairness` is recorded and hashed but has one
  value and is not accepted in the `SOURCE_TASTER_SEARCH_SETTINGS` patch. The
  operator-tunable fairness settings are `activeReferencesPerCheck` and
  `workerConcurrency`.
- **No Semantic Scholar fixture (open decision).** Criterion 1 asks for
  recorded fixtures; Semantic Scholar has only synthetic ones. Recording a
  sanitized payload, or accepting synthetic-only, depends on the unresolved
  licence and is left to the parent.
- **Changed #77 evidence.** A failed source's later operations now read
  `after-source-failure`. Previously each was attempted again and recorded as
  `rate-budget` or `deadline`.
- **Negative-window cap test.** The per-Check cap is shown by a bounded
  negative observation window, not by an internal signal.
- **Browser E2E with a stub website artifact.** The local browser run used a
  minimal, git-ignored `apps/website/dist-preview` stub, because the website
  preview build requires the controlled Pagefind source build, which was not
  available. The information-page browser case therefore cannot pass locally;
  all others are unaffected.

## Validation

Node 24.14.0, macOS arm64, with an owned PostgreSQL 18 container
`st78-sources-pg-20261029` on loopback 55578. Pre-merge results on the
implementation tree:

- **Server `vitest run`.** 239 passed, 2 skipped, in 13 of 14 files.
  `website.test.ts` fails because `apps/website/dist-preview` is missing; that
  file needs the controlled Pagefind website build, which is unavailable here.
- **Earlier full server runs.** These also showed about 60 failures in
  `bibliographic.test.ts`: `ECONNREFUSED`, or Verdicts belonging to other
  fixtures. Their cause is a collision on the fixed test port 54777. Another
  session in the main checkout was running the same file at the same time
  (process listing). The failures are not from this change. The file passes
  61/61 in isolation and in the clean full run above.
- **Same run, one real failure.** The #77 case "continues to Crossref after an
  OpenAlex failure…" failed and was updated to the intended
  `after-source-failure` evidence (two OpenAlex requests in total).
- **Browser, bibliographic config.** 20/20 passed, including the new
  failed-source case in English and German with axe.
- **Browser, main config.** 47 passed, 1 failed:
  `information.spec.ts`, against the stub website artifact (see deviations).
- **Static checks.** `tsc` passed for core, contract-verification, ui, i18n,
  web, extension, server and root `scripts`. `eslint` passed for each of
  those packages and root `scripts`. `prettier --check .` passed.
  `pnpm i18n:check` validated 190 messages in DE and EN.
- **Build.** The contract-verification build reproduces the committed `dist`
  and `openapi-v2.json`.
- **After merging** `origin/spec/70-78-article-sources` at `ebb8681`:
  - The full server run passed every file except `website.test.ts` (Pagefind,
    as above) and `bibliographic.test.ts`. The latter hit the port collision
    again: the other session was still running.
  - Re-run separately, `article-sources`, `article-fairness`,
    `bibliographic-lifecycle` and `lifecycle-recovery` pass. The merged
    admission-observation change in `lifecycle-recovery` is included.
  - `bibliographic.test.ts` passes 61/61 as an uncommitted temporary copy that
    differs only in using port 54879. The copy was deleted after the run.
- **Final tree.** Server `tsc` and `eslint` and root `prettier --check .`
  pass again after the merge and the test changes.
- **Extension.** `pnpm test:native` in `apps/extension` passed 4/4 (native side
  panel, web parity in EN and DE, Preferences with axe). It ran against the same
  stub website artifact, which was removed afterwards.
- **Not run.** `test:authority` needs the private peer service, and the website
  build needs Pagefind.
