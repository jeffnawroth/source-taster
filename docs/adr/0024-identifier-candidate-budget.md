---
status: accepted
---

# Fill each source's five Candidate slots in one fixed sequence, identifiers first

The client accepted this design on 26 October 2026 in [Identifier evidence within the five-Candidate budget](https://github.com/jeffnawroth/source-taster/issues/62), through [F1–F4](https://github.com/jeffnawroth/source-taster/issues/62#issuecomment-6408525384). [ADR-0007](0007-search-strategy-latency.md) and [ADR-0008](0008-scoring-verdict-rules.md) fixed a five-Candidate evaluation budget per Data source that includes identifier evidence, and an initial 1 combined + 2 title-only + 2 authors/year allocation. They did not say which query yields capacity when identifier Candidates occupy slots, how duplicates and refill work, or how several supplied identifiers are ordered. This matters exactly when an identifier conflict or ambiguity prevents early termination. This trades a few bibliographic slots for identifier evidence while keeping the combined query and one title-only slot.

The approved baseline remains [requirements v3.3](../requirements-specification.md). This is an accepted design. It is not a requirements amendment: FA-SUC-02, FA-SUC-03 and FA-SUC-06 are unchanged. The source routes and order of ADR-0007 and the identity, early-termination, DOI-conflict and Verdict rules of ADR-0008 remain the foundations.

## Slot sequence per Data source

Each Data source fills at most five evaluated Candidates per Reference run in one fixed sequence:

```text
identifier Candidates (0–3) → combined → title-only → authors/year → title-only → authors/year
truncate at five
```

| Identifier Candidates in this source | Combined | Title-only | Authors/year |
| --- | --- | --- | --- |
| 0 | 1 | 2 | 2 |
| 1 | 1 | 2 | 1 |
| 2 | 1 | 1 | 1 |
| 3 | 1 | 1 | 0 |

Without identifier Candidates this is the accepted 1 + 2 + 2 allocation. Identifier Candidates displace the later bibliographic slots in reverse sequence order; the combined query and one title-only slot always remain. An unambiguous match among the identifier Candidates ends the search under ADR-0008's early-termination rules, and no bibliographic query follows. Bibliographic queries keep ADR-0007's behaviour: the combined Candidate is evaluated first, and title-only and authors/year queries run only if it is not unambiguous.

## Identifier Candidates

- **One per identifier:** a supplied DOI, PMID, PMCID, arXiv ID or ISBN contributes at most one Candidate: the record carrying that exact identifier. If the provider returns several exact hits, for example several editions under one ISBN, the first in provider order is the Candidate and the others are logged as identifier ambiguity for ADR-0008's identity rules.
- **One record, one slot:** several identifiers leading to the same source record occupy one slot; all identifiers that led to it are recorded.
- **At most three:** identifier Candidates occupy at most three slots per source.
- **doi.org is not a Candidate:** the doi.org existence check is mandatory verification evidence under ADR-0007 and occupies no slot. Its failure remains a named failure, not evidence of an invalid DOI.
- **Failed lookups:** an unavailable or failed identifier lookup is a source failure under ADR-0007 and occupies no slot.
- **Counting by source:** an identifier lookup counts against the budget of the source that served it, even when that source's bibliographic turn comes later in the route.

## Several supplied identifiers

Look up identifiers in the fixed order **DOI → PMID → PMCID → arXiv ID → ISBN**, each in its responsible source under ADR-0007's routes.

- When an identifier Candidate is an unambiguous match, stop. Compare the remaining supplied identifiers as fields against that Candidate; do not look them up. A wrong PMID on an otherwise matched Source thus becomes a deviation without an extra request.
- Do not look up an identifier already carried by an evaluated Candidate.
- Otherwise continue with the next identifier, then the bibliographic queries.

## Duplicates, refill and ties

- **Duplicates:** a record already evaluated in the same source (same source-record ID) is skipped; the next unique hit of the same query fills the slot in provider order.
- **Unused slots:** when a query returns fewer unique hits than its slots, the unused slots pass along the sequence to the next query.
- **No extra requests:** refill uses only results already received. It never triggers another request, a further result page or a query of another source.
- **Ties:** equal provider positions are ordered by source-record ID, so replay is stable. Score ties remain ADR-0008's rules; display order never establishes identity.

## Provenance and versioning

Record for each evaluated Candidate its origin (identifier type or query kind), slot position and the identifiers that led to it. Record skipped duplicates, unused slots and logged identifier ambiguity. This extends ADR-0007's search log and replay data.

The slot sequence, identifier order, three-slot identifier cap and refill rule are outcome-affecting. They belong to the Search strategy version and the Measured configuration; changing any of them requires a new version and a passed quality gate under [ADR-0006](0006-reference-test-set-quality-gate.md).

## Acceptance evidence

- Replay cases with 0, 1, 2 and 3 identifier Candidates in one source show the allocations above and never more than five evaluated Candidates per source.
- A valid DOI with an incorrect title is found via the DOI (FA-SUC-02); an unambiguous identifier match queries no bibliographic search and no further source (FA-SUC-06).
- A DOI resolving to another Source still leaves combined and title-only slots for the intended Source, preserving ADR-0008's DOI-conflict precedence.
- An ambiguous ISBN logs identifier ambiguity; duplicates are skipped; short result lists pass unused slots on; no refill issues an extra request.
- Several identifiers follow the fixed order; already-carried identifiers are not looked up; remaining identifiers are compared as fields.
- Identical inputs and recorded responses produce identical Candidate sets and order in replay.
- The quality gate measures the allocation's effect on retrieval and on the FA-ABG-13 mixed-citation target.

## Considered options

- **One fixed slot sequence, identifiers first, capped at three (chosen):** deterministic, simple to replay, keeps the combined query and a title-only probe for the intended Source.
- **Identifier Candidates outside the budget:** keeps 1 + 2 + 2 untouched, but exceeds five scored Candidates and contradicts ADR-0007/0008. Rejected.
- **Shrink the combined slot first:** keeps both mixed-citation probes, but drops the most likely Candidate for the intended Source when an identifier points elsewhere. Rejected.
- **Score more records and keep the best five:** better recall, but scores unlimited records under a nominal cap of five. Rejected.
- **Refill with extra requests or further pages:** fuller slots at the cost of provider budget and latency. Rejected.

## Consequences

- One shared, deterministic allocator per source in the search pipeline, with provenance in the search log.
- References with several distinct identifier Candidates evaluate fewer authors/year Candidates; the quality gate measures whether that affects mixed-citation recall.

Handed-off interfaces:

- **Implementation:** the per-source slot allocator, identifier order and deduplication, refill from received results and the provenance fields in the search log and replay data.
- **Reference test set and quality gate ([ADR-0006](0006-reference-test-set-quality-gate.md)):** include the replay cases above and measure the allocation's effect.
- **[Final technical-concept synthesis and requirements traceability](https://github.com/jeffnawroth/source-taster/issues/60):** close G02 and update the FA-SUC-02/03/06 rows.
