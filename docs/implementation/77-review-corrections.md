# #77 review corrections

The independent Standards and Spec reviews of `7a89b9c...d1b7aac` found five
unique defects: two P1 identity/evidence defects, received PMCID loss, affirmative
retraction loss, and missing Source links. The parent implements the response on
`fix/77-review-corrections`, based on `d1b7aac`; the original implementation
checkout remains frozen for independent comparison.

## Received PMCID remains comparable

ADR-0024 requires comparing remaining supplied identifiers with an identified
Candidate, even when no further lookup is permitted. OpenAlex accepted
`ids.pmcid` but dropped it from CSL. The projection now preserves a canonical
PMCID, retaining the provider's original value in raw evidence. Bare IDs,
`pmcid:` forms and both NCBI article-URL forms compare consistently. A confirmed
mismatch yields Exists, with deviations while equivalent forms retain Correct.
PMCID stays unweighted; exact Field scores and Scores are unchanged. Unsupported
standalone PMCID lookup remains unsupported and no lookup is added.

Four public HTTP/SSE cases inspect the immutable Verdict, raw supplied field,
canonical Candidate field, unweighted comparison, exact Score and request counts.
The initial two cases were RED before the projection/comparison correction.

## Affirmative retraction remains independent of the Verdict

ADR-0005's result flag and ADR-0007's retraction evidence rule require retaining
an affirmative report already received about the Best match. The Version 2
contract now carries `retraction: "unknown" | "retracted"` and optional affirmative
provenance: source, provider record ID and observation time. Legacy unknown
results stay readable and Version 1 is unchanged.

OpenAlex `is_retracted: true` and Crossref `updated-by` entries with
`type: "retraction"` supply affirmative evidence. Crossref `update-to` points from
a notice to the work it updates; it does not retract the notice itself. This
follows [Crossref's Retraction Watch documentation](https://www.crossref.org/documentation/retrieve-metadata/retraction-watch/)
and its [worked API example](https://community.crossref.org/t/retraction-watch-retractions-now-in-the-crossref-api-crossref/13119),
also recorded in the project's earlier data-source research. Fixtures here are
explicitly synthetic protocol witnesses, not new claims about real Sources.

The coordinator associates already-received evidence with the Best match's
Source, including equivalent source records and received duplicates. It never
scores a duplicate again or requests enrichment. Evidence is deduplicated by
provider and record ID with a Map. A different Source's retraction is not attached
to the Best match. Missing, false and non-retraction data remain unknown, never
a verified negative. Retraction leaves the citation Verdict and Score independent;
a correctly cited retracted Source can therefore remain Correct.

The UI shows a visible DE/EN notice and provenance in the existing evidence view.
Two new browser witnesses demonstrate RED before that display and GREEN with axe
afterwards. Public HTTP/SSE covers affirmative OpenAlex and Crossref reports,
false/missing data, another Source, correction/notice direction, and received
duplicate evidence. One duplicate fixture initially omitted given names, which
correctly allowed early termination under ADR-0025; the fixture now supplies an
explicit incompatible full name so the intended later query is reachable. That
fixture failure is retained and is not a product RED.

## Versions, checks and limits

The new Search strategy prefix is `article-search-77-3-received-evidence`, with
`receivedEvidence: normalized-pmcid-affirmative-retraction-1` in its configuration.
The exact #75 Scoring rules version, field algorithms, approved author ties,
resource limits and uncalibrated parameters are unchanged. Old immutable results
retain their versions. Version 2 artifacts are regenerated; Version 1 schemas,
OpenAPI and frozen clients retain their established contract.

The previously approved real-PG HTTP/SSE and browser seams are used, with only
external HTTP/time fixtures. The parent owns disposable PostgreSQL container
`st77-review-fix-pg-20261028` on loopback 55478 and isolated test ports. No
application-table, queue-state or internal-call assertions are introduced.
Logs and failed-run traces are retained under `.tmp/st77-review/`.

Validation at this checkpoint: focused PMCID, affirmative/negative retraction,
Crossref direction and duplicate cases pass; the DE/EN retraction/axe cases pass.
Core/server/web typechecks, scoped ESLint and paired catalogs pass. Final broad
regressions, artifact checks and release refusal are recorded after their runs.

The unchanged controlled website preview prerequisite is reused from the
previous parent checkout. Its recipe/content inputs are unchanged; this is not
a new website/source-build qualification. Dependencies, lockfile, private pin,
source enablement, pacing, deadlines, lifecycle and authority fences are unchanged.
No new calibration, advisory, live, load, supplier, human accessibility/security,
release or publication qualification is claimed. Existing release/activation and
legal publication gates remain closed.

## Regression checkpoint

The final HTTP/SSE suite passes **201 cases / 12 files**, and rebuilding all
four transport packages leaves all **38** generated artifacts identical. Core,
server and web builds/typechecks, scoped ESLint and the **162** paired app
catalog messages pass. The Vite chunk-size advisory remains the existing advisory.

An initial parallel run of the full HTTP suite, Authority suite and browser suite
passed HTTP but hit timeouts in three pre-existing Authority cases and two
pre-existing normal browser cases (28/31 Authority and 36/38 browser passed).
The second bibliographic browser stage did not run after the normal-stage failure.
No failure count is reported as passing. The failing browser snapshots showed
running References rather than wrong PMCID/retraction results. Logs/traces are
retained; isolated reruns without concurrent suites are in progress. No timeout,
rate, lease or production setting has been relaxed. These functional reruns do
not establish performance or load qualification.

Isolated browser minimization passed all three selected cases: the two original
failures plus the other-language lifecycle control, with the Check results in
about four seconds per case. No product change or timeout increase was required.
The full Authority file is then rerun alone to keep the concurrency variable
separate from the source-evidence correction.

The isolated complete Authority run passes **31/31** against the actual private
peer (`authority-isolated-final.log`). The same source and unchanged timeouts
are used. This narrows the failing parallel observation to that combined run;
it does not establish a general load root cause or performance acceptance.
The complete normal/bibliographic and hosted-Guest browser stages are then run
sequentially.

## Final executed results

| Check | Result / transcript under `.tmp/st77-review/` |
| --- | --- |
| Full server HTTP/SSE | **201 passed / 12 files**, `server-full-final.log` |
| Full Authority, run alone | **31 passed**, `authority-isolated-final.log` |
| Normal then bibliographic web/axe, run alone | **38 + 10 passed**, `web-isolated-final.log` |
| Hosted Guest browser, after web | **5 passed**, `guest-final.log` |
| Core, server, contract and web builds | Passed, `*-final-build.log`; existing Vite chunk advisory only |
| Core/server/web typechecks, scoped ESLint, catalogs | Passed; **162** paired messages |
| All four transport packages rebuilt | **38** artifacts identical, `artifacts-final.log` |
| Legacy transport inventory | **70** non-v2 files byte-identical to `d1b7aac` |
| Release guard | Expected refusal **78**, `release-refusal.log` |
| Whitespace/format | Passed |

No product code, timeout, lease or budget setting changed between the failed
parallel observation and the successful serial runs. The failed logs and
standalone-browser traces remain retained. The workflow uses serial browser
stages, and no claim of launch throughput or a general load fix follows from
these passing functional checks. The original #77 website, license, advisory and
controlled-source results retain their original scope; they were not relabeled
as new runs of this correction.


## Spec corrections: identity groups and sufficient evidence

The first Spec review reproduced two tied OpenAlex records sharing a DOI but
carrying conflicting PMIDs. A DOI-only Crossref record previously appeared
pairwise equivalent to each record and erased that conflict. Shared provider
record IDs or normalized DOI/PMID/PMCID keys now connect an identity group; every
pair in the group is checked for conflicting known identifiers. Neither an
identifier route nor stable display ordering can make a conflicting group an
unambiguous Source. Its result remains Not verifiable with ambiguous identity.
Retraction evidence from another record is not transferred through that conflict;
a direct report about the displayed Best match remains attributable to it.

Four HTTP/SSE witnesses cover the reported sparse bridge and a complete-field
bridge, each with consistent-identity controls. The complete-field case gives
all three records the same stored Score of 96.428571% through independently
worked title/author pairs (100/90 and 95/96). Conflict, rather than absent fields
or a differing Score, must prevent identification. Both conflicting cases were
RED before the group correction and GREEN afterward.

The second P1 concerns records whose title/author comparisons are unavailable.
Missing comparisons remain distinct from numerical zero. An ID-only, title-only,
author-only or year-only record cannot establish a completed negative search,
and an otherwise strong later match cannot manufacture a sufficient lead over
an unknown different Source. Records with no scored fields have no Best match.
A sparse record linked consistently to a fully comparable record of the same
Source does not itself introduce an unknown competing Source. Verified supplied
identifier proof retains its separate identity route and DOI conflict and
mandatory-verification precedence remain unchanged.

Five HTTP/SSE witnesses demonstrated false Not found/Correct outcomes before
this correction. The related Mixed citation slice then demonstrated two more
false positives: an unknown sparse competitor and a consistent transitive bridge
between the purported component Sources. Mixed citation now requires distinct
consistent identity groups; unresolved comparison groups cannot be used as
negative evidence. A sparse record of an already-known Source preserves a valid
Mixed citation control. These tests retain the exact fixed #75 comparison rules
and configured thresholds rather than tuning around the witnesses.

Equal sufficiently matching top Scores across different identity groups keep
the reason ambiguous identity, even when a tied record is sparse. The tie rule
does not depend on completeness, so the insufficient-evidence reason applies
only when no such tie exists. A low equal-Score tie between sparse different
Sources remains insufficient search. The first full server run after the group
correction caught that precedence change in the existing equal-Score witness;
the decision now falls through to the pre-existing reason cascade, which leaves
Mixed citation and the DOI identity-unresolved branch unchanged. A new HTTP/SSE
witness covers the low-Score tie.

The first post-edit Mixed/group run accidentally used the previous compiled core
package and reproduced the two RED cases; its transcript is retained as
`identity-completeness-mixed-stale-build.log`, not reported as a new product
regression. The core was rebuilt before the corrected run. Functional suites
below run serially after build/artifact checks.

## Spec correction: usable Source links

Candidates without DOI now link to their validated OpenAlex record ID. The
fallback accepts only an HTTPS `openalex.org/W` record with a numeric ID; arbitrary
metadata URLs do not become clickable Source destinations. Existing DOI links,
new-tab behavior and `noopener noreferrer` remain. Two DE/EN browser witnesses
were RED without the anchor and GREEN after the correction; they open the
synthetic external destination and check that it has no opener.

## Consolidated version and validation

The current Search strategy prefix is `article-search-77-4-identity-evidence`,
with `identityEvidence: consistent-connected-groups-complete-comparisons-1` and
the prior received-evidence configuration recorded in each immutable result.
Scoring rules, algorithms, parameters, source budgets, deadlines, Candidate slots,
transport schemas, dependencies and the private contract pin are unchanged by
this second correction. The earlier checkpoint above describes commit `6bbe991`;
its results are not substituted for final-head runs.

Final validation and independent rechecks follow below. The owned PostgreSQL
fixture for the Spec corrections is `st77-spec-fix-pg-20261028` on loopback 55478.
All existing release, calibration, native-browser and publication limits remain.
