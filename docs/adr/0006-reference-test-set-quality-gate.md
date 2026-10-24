# Gate every verdict-changing release and Operator change on a frozen, private Reference test set

The client accepted this decision on 24 October 2026 in [Reference test set and release quality gate](https://github.com/jeffnawroth/source-taster/issues/15). It defines the Reference test set and the 50-Reference parity set that [ADR-0003](0003-system-architecture.md) left to this ticket. It builds on the slot, result and Status model of [ADR-0005](0005-check-reference-lifecycle.md).

The quality targets of section 14.4 are measured on a frozen Reference test set. The set is never used to tune thresholds and is kept in a private, versioned dataset repository. In the gate, Data source responses are replayed, while AI extraction runs live three times. A configuration that has not passed cannot be released or activated, whether it is changed by a release or in the Operator area.

This makes the measured values reproducible, independent of drifting external metadata and hard to game. The cost is a second, separately built Development set and human review of every record's ground truth.

This ADR fixes the protocol only. Two things are out of scope:

- assembling the corpus;
- building the measurement harness.

The spec minimums and target values of section 14.4 are frozen input. They are not restated here; this ADR adds floors and rules on top of them.

## Storage and rights

- **Private dataset repository.** The Reference test set, the Development set, the replay fixtures, the other fixture suites and the measurement logs live in their own private, versioned repository, outside the open-core repository (ADR-0001). This keeps the targets from being tuned against public answers and prevents third parties from optimizing against them.
- **License per fixture.** Every recorded Data source response carries the license of its Data source.
  - Crossref, OpenAlex and arXiv metadata is CC0 and may be published.
  - Semantic Scholar forbids redistribution, and Open Library and Google Books are commercially restricted. Their responses are stored privately and never published.
- **Publication hook (FA-UEB-31, FA-UEB-32).** Results may be published. At most a subset whose fixtures are all CC0 may be published with them. Before any publication, a test set version must reach the FA-UEB-32 size: 1,000 real References in 10 citation styles, and 300 invented or falsified References.
- **No user content.** A reported wrong Verdict (FA-ERG-15) is never copied into a set. The Operator may rebuild the case as a new record from public metadata of the affected Source, without the user's text. That record enters the Development set first.

## Record classes and expected outcomes

Every record has exactly one class:

| Class | Expected outcome | Counts toward |
|---|---|---|
| real, correctly cited | Correct | Correctness (APA only), False alarms (all styles) |
| real, with deviations | Exists, with deviations, with the deviating fields | no section 14.4 target; regression check |
| falsified (with mutation type, such as swapped title, wrong DOI, invented author, wrong year) | one fixed Verdict per record | Detection |
| entirely invented | a red Verdict | Detection and Detection of entirely invented works |
| outside coverage (such as a law or an archival record) | Not verifiable | regression check |

- **Record content.**
  - The raw input string, citation style, language and source type.
  - The accepted identifiers of the expected Source (DOI, ISBN, URL or catalog ID). This is a list when the work exists in several versions, such as a preprint and the publisher version, or several editions.
  - For every real record, the expected CSL fields.
  - Provenance:
    - who reviewed the record and when;
    - for invented and falsified records, the generating model, date and prompt.
- **Correctness denominator.** "Real APA references" in section 14.4 means real, **correctly cited** APA References. A real Reference with deviations is rightly yellow and must not lower Correctness.
- **Identity.** A Correct counts as a hit only if the Best match is one of the record's accepted identifiers. A Correct for a different work is a miss.
- **Expected Verdict per slot.** The expected Verdict refers to the newest result of the record's Reference slot (ADR-0005).
- **Two paths per run.** Every gate run checks each record twice, once with AI extraction and once with parsing only. The AI-path targets apply to the AI run, the parser targets to the parser run.

## Composition floors

On top of the section 14.4 launch minimums, the launch version of the Reference test set has:

- **Real References:**
  - at least 300 real, correctly cited References, of which at least 100 are in APA. Example: 300 means at most 3 red Verdicts at the 1 % False-alarm target.
  - Real References with deviations count toward the 400 real References.
  - At least 30 % of the real References are in German, so that the section 19 trigger can be measured.
- **Invented and falsified References:**
  - at least 75 entirely invented References among the at least 150 invented or falsified ones. Example: 75 means at most 3 misses at the 95 % target.
  - They come from at least 3 current AI models of at least 2 providers.
- **All 11 styles of FA-STR-02, with at least 20 records each.** At 90 %, that allows at most 2 errors per style.
  - This goes beyond the five styles of section 14.4, because FA-STR-02 is accepted on the Reference test set itself.
  - A record counts as correctly structured when every expected CSL field matches after normalization and no invented field is added. Normalization covers Unicode NFC, whitespace and dash variants.
  - FA-STR-02 is judged on the AI path; the parser path is measured for information.

## Development set and calibration

- **The Reference test set is entirely the evaluation set.** It is frozen per version, and its full size counts toward the minimums.
- **Thresholds are calibrated only on a separate Development set** built by the same rules (FA-ABG-15). Failures in the Reference test set may be analyzed, but no threshold is tuned on them.
- **One-way movement.** Records move from the Development set into the Reference test set only with a new test set version, never in the other direction.

## Ground truth

- **Real records.**
  - An agent may prepare a record.
  - A human checks the accepted identifiers and expected fields against the canonical entry before the record enters a set. The canonical entry is the DOI landing page, the publisher page or a library catalog.
- **Invented records.**
  - Before entering a set, each one is confirmed as non-existent against all Data sources and by web search.
  - If the work does exist, the record is reclassified: as falsified if the citation contains errors, otherwise as real.

## Pass rule

- **Exact share on the full set.** A target "≥ p" passes when the hits are at least ⌈p · n⌉. Example: 100 real, correctly cited APA References need at least 93 Correct results with the right identity.
- **Confidence intervals** (Wilson, 95 %) are logged for information only and never block.
- **Three AI runs.** The AI path runs three times, as deterministically as the provider allows; for example, with temperature 0 where offered. A configuration passes only if all three runs meet every target, and the log keeps all three.
- **Validity.** A run is invalid if any record ends with a Status (failed, cancelled), or gets Not verifiable because Data sources failed.
  - Such records are rerun.
  - If the problem persists, the run does not count and nothing is released.
  - No record is ever excluded from the rates.
  - Not verifiable as the *expected* Verdict of an outside-coverage record is normal.

## Gate triggers and Operator changes

- **Triggers.** The gate runs on every change that can alter a Verdict:
  - the Scoring rules and the AI model, as FA-UEB-30 requires;
  - a new Data source (section 7: new Data sources must not worsen existing Verdicts);
  - the parser, the search strategy and the extraction prompt.
- **Measured configuration.** A measured configuration combines:
  - the code version;
  - the AI model;
  - the thresholds, including the early-termination threshold;
  - the test set version.
- **Activation in the Operator area.** The Operator area activates an AI model (FA-BTR-05) or a threshold set (FA-ABG-15, FA-SUC-06) only if a passed measurement exists for exactly that measured configuration. This keeps "without changing the software" and still means no unmeasured configuration ever serves users.
- **Thresholds and Scoring rules version.** Every threshold change creates a new Scoring rules version.

## Repeatability

- **Replay in the gate.**
  - Data source responses are recorded per test set version, and again when a Data source is added. The gate replays them.
  - AI extraction runs live, because it is under measurement. Its outputs are logged per run.
- **Live drift run.** A monthly live run against the real Data sources detects drift.
  - If it falls below a target, it opens a finding.
  - The finding blocks the next release until its cause is explained.

## Measurement log

- **One log per measured configuration**, versioned in the private dataset repository and free of user data. It records:
  - the code version, Scoring rules version, AI model, test set version and fixture state;
  - every target value per path and per run.
- **Per-stratum values.** The log also gives every target per language, source type and citation style. These values are informational and do not gate.
- **Section 19 trigger.** A stratum with at least 30 records that falls below a target fires the trigger for the deferred Data sources. Smaller strata are marked as too small. Example: 40 German-language books with 6 red Verdicts give a 15 % False-alarm rate and fire the trigger for the German National Library.
- **Acceptance evidence.** The release notes link the log of every released version. This is the FA-UEB-30 log and the section 16 quality measurement.

## Test set versions

- A new test set version re-measures the current release.
- Values are comparable only within a version.
- A record is removed only for a documented reason, such as wrong ground truth or a withdrawn work. Reaching a target is never a valid reason.

## FA-GLE-03 parity set

- **50 fixed records from the Reference test set:**
  - every expected Verdict at least 5 times, including Not verifiable;
  - both languages;
  - at least 5 citation styles.
- **Full replay.** The set runs through the web app and through the extension against the same API. Both Data source **and** AI responses are replayed, so the test checks the clients and not the model.
- **Pass.** Verdicts and Scores must be identical at stored precision. The parity run is part of every release.

## Performance sets (FA-UEB-40 to FA-UEB-42)

- **Live measurement.** Latency of the real Data sources is the point, so these sets run live.
- **Records may come from both sets.** Performance raises no leakage concern, so the Reference test set and the Development set may both be used.
  - 200 real, findable References;
  - 200 **entirely invented** References. The Development set must contain enough of them to reach 200 together with the Reference test set.
  - The 100-Reference test list of FA-UEB-42 is drawn from both, mixed.
- **Cadence.** When and how often performance is measured belongs to [Search strategy and latency budget](https://github.com/jeffnawroth/source-taster/issues/16) and [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22).

## Other fixture suites

Separate suites live in the same private repository, each with its acceptance criterion from the specification. All of them run on every release:

- **FA-ERF-05 documents:** 20 test documents in PDF, DOCX and plain text, in both languages and mixed styles. They include hard layouts: two columns, footnotes, and a bibliography in mid-text.
- **Imports:** Zotero, Citavi and EndNote.
- **Export and reimport fidelity.**
- **CSL style and locale rendering.**
- **Unicode, names, dates and identifiers.**

## Considered options

- **Keeping the set in the open-core repository**, rejected because targets would be tuned against public answers, and because some Data source responses may not be redistributed.
- **Splitting one set 50/50 into calibration and evaluation**, rejected because the evaluation half would fall below the 400/150 minimum.
- **Passing on the lower confidence bound**, rejected because it is practically unreachable at launch sizes and not what the specification asks.
- **Gating against live Data sources**, rejected because external metadata drift would pass or fail a release without any code change.
- **A single AI run per gate**, rejected because a release could pass by chance.
- **Routing model and threshold changes through the release pipeline**, rejected because FA-BTR-05 and FA-ABG-15 require changes without changing the software.
- **Counting any Correct as a hit**, rejected because a Correct for a different work would inflate Correctness.
- **Excluding failed records from the rates**, rejected because it would flatter every rate; an outage-grey run would trivially pass Detection.
- **Copying reported wrong Verdicts into the set**, rejected because it would store user content beyond its retention.

## Consequences

- **More corpus work.** A second, Development set of the same build quality is needed, together with human review of every record and 11 styles at launch.
- **Gate cost.** Each gate run makes three live AI passes over the full set.
- **Operator activation depends on measurement.** A model or threshold switch takes as long as a gate run.
- **Handed-off interfaces:**
  - [Scoring and verdict rules](https://github.com/jeffnawroth/source-taster/issues/17):
    - calibration on the Development set only;
    - every threshold change is a new Scoring rules version;
    - the expected-Verdict classes and the identity rule for Correct.
  - [Search strategy and latency budget](https://github.com/jeffnawroth/source-taster/issues/16):
    - recordable, replayable Data source responses;
    - the early-termination threshold is part of the measured configuration;
    - the performance measurement cadence.
  - [AI provider and model](https://github.com/jeffnawroth/source-taster/issues/19):
    - three gate runs per model;
    - deterministic settings where the provider offers them;
    - a replayable AI response for the parity run;
    - activation only after a passed measurement.
  - [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20):
    - the parser path measured on every gate run;
    - FA-ERF-05, import, export and rendering fixture suites.
  - [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22):
    - the private dataset repository;
    - CI running the gate, parity and fixture suites;
    - the monthly live drift run;
    - performance measurement.
  - [Operator tools without a dedicated interface](https://github.com/jeffnawroth/source-taster/issues/24): activating a model or threshold set only for a passed measured configuration.
