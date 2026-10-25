---
status: accepted
---

# Choose the AI extraction configuration by measurement among EU-only, zero-retention providers, and verify only what the user wrote

The client accepted this decision on 25 October 2026 in [AI provider and model](https://github.com/jeffnawroth/source-taster/issues/19). It builds on the evidence in [AI extraction provider capabilities](https://github.com/jeffnawroth/source-taster/issues/7), at research commit [`9d21175`](https://github.com/jeffnawroth/source-taster/blob/9d211752f6534e6bd6c0c52309e4dac684a04b8a/docs/research/ai-extraction-providers.md). It fills the AI provider port of [ADR-0003](0003-system-architecture.md) and applies the quality gate of [ADR-0006](0006-reference-test-set-quality-gate.md).

- No model is chosen up front. No vendor publishes a benchmark for bibliographic extraction, so the client fixes eligibility criteria, a candidate order and a selection rule. The Reference test set picks the model.
- AI extraction may only find, split and cut up text. It never supplies values the user did not write. Verification therefore always judges the Reference as written.

This keeps data protection and quality evidence ahead of convenience. The cost is measuring up to three provider paths before launch and accepting that the best-known frontier models may not be the launch model.

The baseline is the approved [requirements specification v3.2](../requirements-specification.md). This ADR approves no requirement change. Its change-request candidate is listed under Consequences.

## AI input and output

- **Pasted text, including running text.** AI extraction finds the References, splits them and structures them (section 6).
- **Documents.** The non-AI bibliography detection of FA-ERF-05 delimits the bibliography first, in every Plan. Only that text goes to the AI. A user's correction of the start or end of the selection re-runs Structuring.
- **Text only.** The AI never receives file bytes or images. This keeps image-only safety retention (for example Bedrock's CSAM detection) out of scope by design.
- **Verbatim original span.** For every Reference, the AI returns its original text span. Code checks that the span occurs verbatim in the input, tolerating whitespace, line breaks and hyphenation at line ends.
  - The span is the original text of FA-STR-01 and the source span of [ADR-0005](0005-check-reference-lifecycle.md).
  - A span that fails the check is discarded.
- **No References found.** If AI extraction returns no Reference, FA-STR-06 applies: a message with hints, and no Quota is consumed.
- **Notice.** Every AI result carries the FA-STR-07 notice.

## Verify what the user wrote

- **Grounded values only.** The AI returns field values as verbatim substrings of the Reference's original span, under the same tolerance as above. Two outputs are allowed beyond that:
  - splitting names into family and given parts, where each part is itself verbatim;
  - the CSL item type, which is a classification, not text.
- **Ungrounded values.** Any other value fails the grounding check and counts as added or changed by the AI. It is marked (FA-STR-08) and shown, but it is **not** used as input to search or scoring.
  - Silently corrected typos or added DOIs would otherwise hide exactly the deviations Source Taster must report, and an ungrounded value may be invented.
  - The user can adopt such a value through a correction; it then carries provenance "user" (ADR-0005).
- **Normalization stays in code.** §8.3 normalization, such as expanding shortened page ranges, runs in application code ([ADR-0008](0008-scoring-verdict-rules.md)), never in the AI.
- **Test-set expectation (refines ADR-0006).** The expected CSL fields of a record are the values *as written in the Reference*, not the canonical values of the Source.
  - An abbreviated journal title is expected in `container-title-short`, a full one in `container-title`.
  - A Reference with deviations expects the deviating value, such as the typo.
  - The canonical entry proves identity and existence; it does not set expected field values.
- **Prompt injection.** User text may contain instructions aimed at the AI. Structured output and the grounding checks bound the damage: whatever the AI is talked into, only verbatim spans and values reach verification, and the AI has no tools or other data.

## Failure and fallback

- **One retry** per affected chunk on timeout, an invalid schema response, provider unavailability or failed span checks.
- **Then the non-AI path for that chunk only**, not for the whole Check. One Check can therefore hold Reference slots with AI and parser provenance; provenance is recorded per field anyway.
  - **Document bibliographies:** the failed chunk is parsed using the FA-ERF-05 reference boundaries.
  - **Pasted text:** the failed chunk goes to the parser line by line. Lines the parser does not recognize as a Reference do not become Reference slots.
- **Notice.** The user sees which passage AI extraction could not structure and can retry AI extraction for it. Structuring consumes no Quota (FA-STR-05).
- **No automatic second provider.** A second measured configuration from another provider is kept as a reserve that the Operator switches to (FA-BTR-05). It is never an automatic failover, because every configuration must have passed the quality gate on its own.

## Eligibility criteria

Every provider path must meet all five criteria before it is measured:

1. No training on Source Taster data.
2. No storage of content beyond processing, except narrowly documented safety exceptions for content Source Taster never sends, such as images.
3. Processing and storage only in EU member states, without EFTA. FA-UEB-13 does not require this; it prepares the deferred FA-UEB-14 without a specification change.
4. JSON-schema structured output and dated model versions.
5. Self-service setup, without a sales approval from the provider.

Applied to the research:

| Path | Result |
|---|---|
| Claude Haiku 5.5 and Sonnet 5.5 on Amazon Bedrock, `eu.` Geo profile from eu-central-1, `data_retention_mode: none` | eligible |
| IONOS AI Model Hub (DE), open-weight models | eligible |
| STACKIT AI Model Serving (EU01), open-weight models | eligible |
| Fable on Bedrock | excluded: requires retention and AWS review |
| Scaleway | excluded: may store full requests up to 2 weeks in misuse cases |
| Vertex AI `eu` | excluded: prompt logging can only be dropped with a Cloud Master Agreement |
| Azure OpenAI, OpenAI | excluded: zero retention or modified abuse monitoring needs approval |
| Mistral | excluded: EFTA data centres, training opt-out required |
| Anthropic API, Gemini Developer API | excluded: no EU processing |

Unverified facts are checked when accounts are set up. A candidate that fails a criterion there drops out:
- the effective Bedrock `allowed_modes` for Haiku 5.5 and Sonnet 5.5;
- JSON-schema structured output at IONOS and STACKIT.

## Selection rule

- **Candidate order:**
  1. the strongest eligible open-weight model at IONOS or STACKIT;
  2. Claude Haiku 5.5 on Bedrock EU;
  3. Claude Sonnet 5.5 on Bedrock EU.
- **Launch configuration.** The first candidate that passes the quality gate in all three AI runs (ADR-0006) and meets the structuring-time target below becomes the launch configuration.
  - The EU open-weight path goes first: an EU company without a US parent, fewer sub-processors and no AWS Organization to operate. Its extraction quality is the biggest unknown, which the gate settles.
  - Cost does not decide. Even the most expensive candidate costs a few dollars per maximal Check.
- **Reserve.** The next passing configuration from a different provider is the Operator's reserve.
- **Quality passes, time misses.** If at least one candidate passes the quality gate but none meets the structuring-time target, the fastest passing configuration is chosen and the Operator adjusts the Initial value. Quality comes before speed.
- **Nothing passes.** If no candidate passes the quality gate, AI extraction does not launch and the decision goes back to the client, because FA-STR-02 is a must.

## FA-UEB-12 evidence

- **Launch precondition.** For the launch configuration and the reserve, the provider's terms or data processing agreement must exclude training and storage, as the FA-UEB-12 acceptance criterion requires.
- **Bedrock.** If `data_retention_mode: none` is only a documented setting and not a contract term:
  - Source Taster documents the setting, enforces it through an SCP and keeps CloudTrail evidence;
  - a change-request candidate is recorded: "contract **or verifiable, enforced configuration**";
  - until the client approves it in a new specification version, Bedrock qualifies only if its contract covers the exclusion.
- **Residual exceptions**, such as legally required retention, are listed in the record of processing activities and the privacy policy.

## Measured configuration

[ADR-0006](0006-reference-test-set-quality-gate.md) defines the Measured configuration and its "AI model" part. That part consists of:
- the provider path;
- the dated model ID, never a moving alias;
- the region or inference profile;
- the extraction prompt version and the extraction schema version;
- the sampling parameters, as deterministic as the provider allows;
- the chunk size.

Rules:
- **Any change creates a new configuration.** Changing any part needs a new quality gate (FA-UEB-30).
- **Deprecation.** When a provider announces a model's retirement, the successor is measured before the retirement date. The Operator then switches without user impact (FA-BTR-05).
- **Traceability.** Every Check records the ID of the configuration that structured it.

## Chunking and structuring time

- **Chunking.** About 1,000 References need roughly 250K output tokens, against at most 128K per response, so input is chunked.
  - Chunks break at paragraph boundaries; document bibliographies break at the FA-ERF-05 Reference boundaries.
  - Neighbouring chunks overlap slightly. Duplicates are removed by original span.
  - Chunks run in parallel.
- **Extraction schema.** The schema is flat and non-recursive. Code maps it to CSL-JSON and re-validates the constraints the provider cannot express.
- **Schema warm-up.** Where the provider compiles schemas (Bedrock: up to minutes, cached 24 h), deployment calls each schema once so no user pays the compilation.
- **Structuring-time target.** Under [ADR-0007](0007-search-strategy-latency.md), Check duration starts after Structuring, so Structuring sits outside the FA-UEB-40 to 42 budgets. The research note that counts structuring latency against those budgets is superseded by ADR-0007. Initial values, which the Operator can change:
  - 100 References structured in at most 30 s (p95);
  - 1,000 References in at most 3 min.

  The gate measures both, and the selection rule uses them.
- **Abuse limit.** Structuring consumes no Quota. AI extraction therefore gets its own FA-BTR-04 counter per principal and time window, in the request-limit mechanism of ADR-0003. The Operator sets its Initial value.

## AI provider port

- **One provider-neutral port** in `core`. It carries the flat extraction schema; mapping to CSL happens in application code.
- **Two adapters at launch:**
  - the launch provider's adapter;
  - an OpenAI-compatible adapter, which also covers IONOS and STACKIT.
- **Standalone mode** (ADR-0003). The developer chooses adapter and model freely through environment variables. No quality gate applies. The product states that quality is not measured, and the responsibility lies with the developer.
- **BYOK (FA-KON-20 to 22, FA-STR-04, deferred): hook only.** A later per-Owner credential slot accepts only measured configurations and comes with its own privacy notice. The reason is that first-party APIs without EU processing or approval-free zero retention do not meet these criteria. Nothing of BYOK is built at launch.

## Considered options

- **Pick a frontier model up front (for example Claude Sonnet 5.5)**, rejected: there is no benchmark for this task, and the ticket forbids treating a recommendation as proof of quality.
- **Claude first, EU open-weight as reserve**, rejected: Claude is more likely to pass the gate but costs an AWS Organization and a US processor. EU open-weight costs one measurement to rule out.
- **Let the AI normalize and complete values**, rejected: verification would judge AI-corrected References and hide the deviations it must report, and invented values could enter search.
- **Expected test-set values from the canonical entry**, rejected: abbreviating styles (Vancouver, IEEE, AMA, ACS) would fail systematically even when extraction is correct.
- **Whole-Check fallback on any chunk failure**, rejected: it throws away valid AI results and turns pasted running text into parser noise.
- **Automatic failover to a second provider**, rejected: every configuration must pass the gate on its own, and an unattended switch would hide provider problems from the Operator.
- **Allow EFTA processing (Azure EU Data Zone, Mistral `api.eu`)**, rejected: it would block the deferred FA-UEB-14 without a specification change.
- **Send PDFs or images to the AI**, rejected: it triggers image safety retention and is not needed while OCR (FA-ERF-07) is deferred.

## Consequences

- **The launch model is unknown until measured.** Accounts with IONOS, STACKIT and AWS are needed to run the gate.
- **Change-request candidate** (recorded on the map, not approved): FA-UEB-12 acceptance "contract **or verifiable, enforced configuration**", needed only if Bedrock is chosen and its contract does not cover the exclusion.
- **ADR-0006 is refined, not changed:** expected CSL fields are the values as written in the Reference.
- **Handed-off interfaces:**
  - [Non-AI structuring approach](https://github.com/jeffnawroth/source-taster/issues/20):
    - the parser is the per-chunk fallback of AI extraction;
    - for pasted text, it runs line by line and must reject lines that are not References;
    - FA-ERF-05 boundaries are used for document chunking and fallback.
  - [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22):
    - do not assume co-location with AWS, because EU open-weight is measured first;
    - accounts for the three candidate paths;
    - if Bedrock is chosen: AWS Organizations, the SCP for `data_retention_mode: none`, CloudTrail evidence and the `eu.` profile from eu-central-1;
    - schema warm-up on deploy;
    - the AI provider and reserve in the service-provider register and the record of processing activities.
  - [Operator tools without a dedicated interface](https://github.com/jeffnawroth/source-taster/issues/24):
    - activating a measured configuration and switching to the reserve;
    - the AI-extraction FA-BTR-04 counter;
    - the structuring-time Initial values;
    - tracking provider deprecation dates.
