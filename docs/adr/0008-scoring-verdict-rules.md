---
status: accepted
---

# Separate Source identity from similarity when deriving Verdicts

The client accepted these rules on 24 October 2026 in [Scoring and verdict rules](https://github.com/jeffnawroth/source-taster/issues/17). Highest Score determines Best match; an unambiguous Source additionally requires identity evidence. This prevents a title-only 100% Score, tied metadata or unavailable mandatory verification from being presented as a correctly cited Source. It also permits a confirmed wrong identifier to remain a deviation or DOI conflict even when the other weighted fields agree.

This records an accepted design, not a calibrated implementation. The accompanying **requirements specification v3.2 was approved by the client on 24 October 2026** and supersedes v3.1 as the working baseline, including the expanded Not verifiable conditions and coverage-first exception to mandatory DOI verification. The prior English baseline remains in Git history. No other research-derived requirement change is approved by this ADR.

## Evidence and scope

The decisions were accepted in five rounds: [F1–F3](https://github.com/jeffnawroth/source-taster/issues/17#issuecomment-6388514073), [F4–F6](https://github.com/jeffnawroth/source-taster/issues/17#issuecomment-6388595891), [F7–F9](https://github.com/jeffnawroth/source-taster/issues/17#issuecomment-6388683808), [F10–F12](https://github.com/jeffnawroth/source-taster/issues/17#issuecomment-6388721529), and [F13–F15](https://github.com/jeffnawroth/source-taster/issues/17#issuecomment-6388767673).

[Final offline experiment-0.6](https://github.com/jeffnawroth/source-taster/blob/f889c96e730a3e211290ba41f10feef7ce1479ea/docs/prototypes/scoring-verdicts.prototype.html) is preserved at immutable commit `f889c96e730a3e211290ba41f10feef7ce1479ea` on throwaway branch `prototype/scoring-verdicts`. Its 48 invented cases and guided walkthroughs are primary discussion evidence, not real source responses, the Development set, the Reference test set, or a production implementation. The HTML is not merged into main.

The prototype's edit-distance illustration, name-component weights, order penalty, 80/15/5 date weights, 85% total threshold, 95% strong-field threshold, five-point lead and <50% counterevidence threshold are **not approved launch parameters**. Numeric thresholds and field-comparison parameters must be selected on the Development set and evaluated through [ADR-0006](0006-reference-test-set-quality-gate.md). The explicit page-coverage formula and six-decimal percentage precision below are accepted rules, not tunable demonstration thresholds. Production normalization and metadata capabilities still need their own evidence.

## Field agreement and precision

Keep the specification's default field weights: title 30, authors 25, publication date 15, journal/edited volume 15, DOI 10, volume 3 and pages 2. Exclude fields missing on either side and renormalize participating weights. Missing fields are explained, not zero-scored or inferred to be correct. Confirmed ISBN and URL deviations affect the Verdict without adding new weighted fields.

Apply §8.3 normalization before comparison, preserving originals and provenance. Typos must reduce similarity proportionally; the "Jouranl" example remains above 80% and below 100%. Exact metric/parameter qualification belongs to the versioned calibration work, not a claim from synthetic examples.

- **Authors:** compare names through one-to-one assignment. One Candidate author cannot satisfy multiple supplied names. Compatible initials and surname variants may agree, including the specification's `Müller, A. B.` / `Muller, Anna` example. Incompatible full given names must not become equal through shared initials. Reversed order and unmarked missing coauthors are deviations. Explicitly recognized et al. truncation may omit trailing names without penalty; absence alone does not prove intentional truncation. The exact similarity weights and order penalty remain calibration inputs.
- **Dates:** compare shared components only, renormalizing component weights. Year has greatest weight; a difference of exactly one year earns half agreement on the year component. `2021` / `2021-06-15` fully agrees on the shared year. No unprovided month/day is invented. Exact component weights remain calibration inputs.
- **Pages:** expand shortened notation first. For numeric ranges, use `number of cited pages inside Source range / number of cited pages`. A contained single page or range agrees fully; `125–126` within `123–128` is 100%, `127–130` against `123–128` is 50%, disjoint ranges are zero. Preserve valid cited locations in suggestions. Article numbers, Roman/supplement pages and other formats require explicit parsing/normalization qualification rather than treating every number as a range.
- **Retraction prefix:** ignore a Candidate-side `RETRACTED: ` prefix only when evidence proves the Data source added it and retraction is known. Preserve raw values. Do not strip arbitrary literal titles or user Reference text. Retraction remains an independent flag; unavailable/absent retraction data is unknown, not a verified negative.

Process and store Field scores and Scores to **six decimal places in percentage points**; display two. Retain normalized full-agreement information independently of rounded scores. Display rounding never participates in ranking, threshold tests or Verdict choice; even an internally rounded 100% cannot erase a known deviation. The implementation must fix and replay the arithmetic/rounding behavior as part of its Scoring rules version. The prototype rounds non-negative values to nearest at the declared precision; it does not prove cross-runtime production arithmetic parity.

## Identity, Best match and ties

A Score measures agreement; it is not a probability or identity proof. Highest Score defines Best match, while accepted identity evidence depends on Source type:

| Evidence route | Minimum identity evidence |
| --- | --- |
| Supplied identifier | A verified DOI, ISBN, PMID or arXiv ID leads to that Candidate without strong identity counterevidence. Candidate metadata alone is not proof that the Reference supplied the identifier. |
| Article/book without identifier proof | Strong title **and** author agreement, with a sufficient lead over different Sources. Title alone without authors is insufficient. |
| Web | Same or verified canonical target URL plus matching title; HTTP 200 alone is insufficient. A matching archive must establish the cited original URL and title. |

Identity/counterevidence and margin thresholds require calibration. Normalize supported identifiers without inferring undocumented provider capabilities. Use known identifiers to distinguish Sources; do not merge different editions merely because titles/authors resemble one another. A confirmed wrong ISBN with independently established intended identity yields Exists, with deviations. Unresolved identifier/edition identity yields Not verifiable; confirmed foreign/non-existent DOI keeps its dedicated Verdict.

For equal highest Scores belonging to different Sources, a uniquely verified supplied identifier without strong counterevidence may select one tied Source. Scores remain unchanged and the selected Candidate still has the highest Score. Otherwise the tie remains Not verifiable. Stable display ordering never manufactures identity. Identifier proof cannot silently promote a lower-scoring Candidate; when evidence cannot reconcile identity and Best match, explain the unresolved identity rather than returning a false Correct. Record the proof, competing Candidates, Score precision and selection rule for replay.

## Verdict derivation

Statuses remain separate from final Verdicts under [ADR-0005](0005-check-reference-lifecycle.md): running, cancelled, failed and not checked do not become billed Verdicts. For a finished run, apply the following precedence and evidence rules:

1. **Coverage first:** outside-coverage References receive Not verifiable even when they contain a DOI. They require no DOI verification. This is an explicit v3.2 amendment, not a reinterpretation of v3.1 FA-ABG-14.
2. **Confirmed DOI conflict:** within supported coverage, a confirmed non-existent DOI or DOI belonging to another Source produces DOI conflict ahead of Mixed citation. Keep any mixed evidence in the explanation. Successful resolution to another Candidate is not by itself proof of a foreign DOI; independent bibliographic evidence must establish the intended different Source. An unavailable resolver or a database's missing DOI record is not confirmed non-existence.
3. **Incomplete mandatory verification:** when a required verification step is unavailable or incomplete, produce Not verifiable and name it. In particular, do not finalize Mixed citation while unresolved mandatory DOI verification leaves DOI-conflict precedence unknown. Preserve mixed evidence as evidence.
4. **Mixed citation:** require strong component evidence identifying different Sources with contradictory opposing fields, such as title from A and authors from B. Shared authors, similar titles or a high total alone are insufficient. Calibrate component and contradiction thresholds and measure the unchanged FA-ABG-13 target of at least 18/20 mixed References.
5. **Identity and deviations:** unambiguous identity with normalized full agreement and no confirmed identifier/URL deviation yields Correct; unambiguous identity with deviations yields Exists, with deviations. Ambiguous different Sources or insufficient identity evidence yield Not verifiable. Completed, sufficient searches with no sufficiently matching Candidate yield Not found.

A total responsible-Data-source outage is Not verifiable. For partial failures, name failed sources and continue other responsible sources. Sufficient completed identity evidence can establish a Source, but incomplete mandatory work cannot be counted as negative evidence or be hidden behind a low Score. Capability limitations are not successful empty responses. At deadline, sources not contacted/completed remain unavailable under [ADR-0007](0007-search-strategy-latency.md), not no-match observations.

Use the exact six product Verdicts. Explanations name compared/missing fields with both values, Candidates when available, identifier conflicts, failure/incomplete-verification reasons and provenance. The expanded grey outcomes remain billed final Verdicts; billing is still once per slot and same-slot Re-checks remain free. No new Verdict or billing exception is introduced.

### Web and archive outcomes

| Observation | Outcome |
| --- | --- |
| Same/canonical live URL and matching title | Identity may be established; compare other fields normally. |
| HTTP 200 alone | Insufficient identity evidence; Not verifiable. |
| 403, 429, timeout or unclear/soft-404 response | Not verifiable; do not infer non-existence. |
| Definitive 404/410 plus completed archive lookup with no matching page | Not found, provided mandatory DOI verification is complete and no higher-priority evidence applies. |
| 404/410 with unavailable/incomplete archive verification | Not verifiable. |
| Archive proves original URL and matching title, original URL gone | Exists, with deviations; name the dead original URL and retain archive provenance. |

These rules use the existing URL → Internet Archive route. They do not add providers or permit extra retrieval after Early termination. Use retraction evidence already obtained/permitted in cache only. Retrieval, redirects and SSRF protections remain ADR-0007 responsibilities; a status string alone is not proof that an archive contains the cited page.

## Correction suggestions

Provide a Correction suggestion in the selected citation style for **Correct** and **Exists, with deviations**. For **DOI conflict**, provide one only if independent evidence unambiguously establishes the intended Source; the red Verdict does not disappear because a correction exists. A result combining DOI conflict with unresolved mixed identity must not receive an invented replacement. Do not provide a complete replacement for Mixed citation, Not found or unresolved identity.

Build from proven Source metadata, preserve valid contained page locations and do not invent missing fields. A matching archive may be offered with its provenance while retaining the original URL/input. Ignore only proven provider-added title decorations when constructing the normalized suggestion. Offer changes for the user to apply; never overwrite original input or automatically modify the user's document. Corrections become field revisions and a Re-check appends a new result under ADR-0005; Manual overrides remain a separate result-bound layer. Citation style/locale/rendering versions and actual CSL rendering are owned by [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20).

## Calibration, versions and handoff

The concept decision is complete; production feasibility and accepted launch settings are not. Calibrate total/strong-field/margin/mixed/counterevidence thresholds and free comparison parameters **only on the Development set**, then freeze the exact configuration for ADR-0006's independent Reference test set gate. Record comparison algorithms, normalization, field/date/order parameters, weights, precision and thresholds under the Scoring rules version. Every outcome-changing rule or threshold creates a new version; old results retain theirs and Re-checks use the current version.

The exact measured configuration also includes Search strategy version, source enablement, five-Candidate allocation and outcome-affecting budgets/deadlines/concurrency. Nothing is released or activated without the required passed gate; Operator changes are not exempt. Keep the fixed five-Candidate per-source budget, including identifier evidence, and initial 1 combined + 2 title + 2 authors/year allocation. Early termination requires sufficient identity and completed mandatory verification, not merely a high Score. No speculative later source is queried to improve a lead or add retraction evidence after termination.

Expanded Not verifiable is **not** permission to remove records from quality denominators, change expected classes or relax targets. Ambiguity/insufficient-evidence grey results on real-correct, real-deviating, falsified or invented records remain evaluated against the record's expected outcome. Source-failure/incomplete-mandatory-evidence cases retain the existing invalid-run/retry rules, never disappearing from rates. Live latency/load acceptance remains separate; this decision does not prove that routing/budgets meet launch targets.

- **[Reference test set and release quality gate](https://github.com/jeffnawroth/source-taster/issues/15):** exercise independent identity, mixed/DOI precedence, grey reasons, edition/identifier conflicts, retraction provenance, contained/partial pages and internal-versus-display precision; check suggestions preserve accepted identity and locations. Corpus assembly, calibration and gate implementation remain later execution work.
- **[Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20):** retain ordered names, explicit truncation provenance, partial date components, identifier/edition relationships, page/article-number formats and raw versus normalized metadata; select and qualify CSL rendering.
- **[Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22)** and **[Operator tools](https://github.com/jeffnawroth/source-taster/issues/24):** preserve failure/mandatory-work classification, versioned configuration and activation gates; capture enough evidence for replay without moving Check content into operational logs.

## Rejected shortcuts

- **Score or shared-field count as identity:** a title-only 100% Score has no independent identity proof.
- **First displayed tied Candidate as truth:** a stable ordering makes output reproducible, not unambiguous.
- **Treating unavailable evidence as no-match:** it creates false negative evidence and bypasses mandatory verification.
- **A seventh Verdict for ambiguity or identifier conflict:** use explicit Not verifiable reasons and the existing dedicated DOI conflict/deviation rules.
- **Automatic full-reference replacements for mixed identity:** source-proven field evidence is not permission to fabricate one coherent Source.
- **Approving prototype numbers or tuning on the Reference test set:** synthetic examples expose policy branches, not launch quality or calibrated thresholds.
