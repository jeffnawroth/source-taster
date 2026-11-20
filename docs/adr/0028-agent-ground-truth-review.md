---
status: proposed
---

# Let an agent review ground truth under an auditable, two-pass method

[ADR-0006](0006-reference-test-set-quality-gate.md) requires a human to check every record's accepted identifiers and expected fields against the canonical entry, and to confirm every invented record as non-existent. The Operator has decided that nobody will hand-curate records and that agents build and review the Reference test set and the Development set. This ADR refines the Ground truth section of ADR-0006: the reviewer may be an agent, provided the review follows the method below and leaves a record that a person can audit afterwards. Nothing else in ADR-0006 changes: the classes, floors, pass rule, Development set rule and private storage stay as accepted.

It becomes effective when the Operator merges it. A set frozen before that is frozen under a method the client has not yet accepted, and says so in its manifest.

## Why a method and not trust

A single agent that prepares and then approves its own record shares its blind spots with itself, and the Data sources it consults are the same ones the gate measures. The method therefore adds independence in three places: a second reviewer, a canonical entry that is not the measured Data source alone, and a mechanical audit trail.

## Reviewer identity and review record

- **Reviewer identity.** `reviewedBy` names the reviewer as `agent:<provider>/<model-id>` with the exact model version. A person may still review; the identity is then `human:<name>`. The reviewer is never the model that generated the record.
- **One review entry per record**, kept in the private dataset repository and never in this one. It holds the reviewer, the date, every source consulted with the identifier or query used, the decision (accept, reclassify, drop) and the reason for anything other than accept. The record's `provenance.reviewedBy` and `provenance.reviewedAt` point at the final accepted decision.
- **Method version.** The set manifest names the version of this method and whether it was accepted when the set was frozen.

## Real records

The reviewer checks the accepted identifiers and expected fields against the canonical entry:

- the Crossref record and the DOI landing metadata (the response of doi.org and, where it gives bibliographic metadata, the landing page);
- OpenAlex or arXiv for the same work;
- for books, a library catalogue lookup, where the catalogue's terms allow a lookup. A lookup is a read for review, not a stored fixture.

Rules:

- **Independence.** The canonical entry must not be only the Data source the record is measured against. A record that rests on a single Data source's metadata is flagged `single-source` and goes to the second pass.
- **Identity and existence only.** The canonical entry proves identity and existence. Expected field values stay as written in the Reference (ADR-0006, [ADR-0010](0010-ai-provider-model.md)); the reviewer compares them to the rendered or supplied text, not to the entry's spelling.
- **Accepted identifiers.** The reviewer confirms every accepted identifier resolves to the same work, and adds the other versions of the work (preprint and publisher version, other editions) that the canonical entries show.
- **Outside coverage.** A work the Data sources do not cover is confirmed to exist by web search and a primary page. Web search results are evidence for the decision and are not stored.

## Falsified records

A falsified record is a real record with a deliberate, typed mutation. The mutation is checked mechanically against the unmutated record: the review confirms the mutation type and that the fixed expected Verdict follows from [ADR-0008](0008-scoring-verdict-rules.md). A mutation that happens to produce another real work is reclassified.

## Invented records

Before entering a set, each invented record is confirmed as non-existent:

- against every Data source the product is configured to use, including those whose responses may not be stored. Querying a restricted Data source live to confirm absence is allowed; its response is not stored and the set's provenance says so;
- by web search.

The review entry logs the queries: query text, where it was run, the date and a short account of the closest results and why none is the cited work. At least two queries per record: the title phrase, and the title with the first author. A record with an invented DOI also logs the DOI resolution result. If the work does exist, the record is reclassified as falsified when the citation contains errors, otherwise as real, as ADR-0006 already requires.

## Second, independent pass

- **Sample.** An independent second reviewer repeats the review for at least 10 % of the records of each class, rounded up, drawn at random with a recorded seed, plus every disputed record, every `single-source` record, every record the first reviewer marked uncertain, and every outside-coverage record.
- **Independence.** The second reviewer is a different model from the first reviewer and from the generator of the record. It is from another provider where one is available; if not, the review entry says why. It receives the raw input and the source to look up, not the first reviewer's decision.
- **Disagreement rule.** A record is disputed when the two passes differ on its class, its set of accepted identifiers, its existence or non-existence, or any expected field after the ADR-0006 normalization.
- **Resolution.** A third pass by a model different from both sees both decisions and the sources. If it agrees with one pass completely, that decision stands. Otherwise the record is dropped. A record is only ever dropped before its set is frozen, with the reason logged; after freezing, ADR-0006 applies (a documented reason such as wrong ground truth, never a missed target).
- **Escalation.** If the second pass disputes more than 5 % of its sample in a class, every record of that class gets the second pass.

## Consequences

- **Evidence stays private.** Review entries and query logs contain record content and live in the private dataset repository. The public repository and its issues carry aggregate counts only.
- **Honest limit.** An agent review shows that independent agents reached the same conclusion from the canonical entries. It is not a human sign-off, and a client who later requires one can add a human sample to the same entries.
- **Cost.** Every set needs a second review pass, a third pass for disputes, and logged non-existence checks for every invented record.
- **Handed-off interfaces.** The dataset record already holds reviewer provenance and generator provenance; the review entries are a sidecar in the private repository, so the loader contract of [94](../implementation/94-quality-measurement.md) is unchanged.

## Considered options

- **Keeping a human review of every record**, rejected by the Operator because nobody will hand-curate records.
- **One agent reviews alone**, rejected because it cannot catch its own systematic errors.
- **A human sample on top of the agent review**, not required but compatible; the review entry's reviewer identity allows it.
- **Checking only against the Data sources under measurement**, rejected because the gate would then partly verify itself.
