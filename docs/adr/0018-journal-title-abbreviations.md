---
status: accepted
---

# Score abbreviated journal titles only against attested abbreviations, and leave the rest unscored

The client accepted this design on 25 October 2026 in [Journal-title abbreviations in scoring](https://github.com/jeffnawroth/source-taster/issues/50), through [F1–F3](https://github.com/jeffnawroth/source-taster/issues/50#issuecomment-6397392186) and [F4–F9](https://github.com/jeffnawroth/source-taster/issues/50#issuecomment-6397420309). The evidence is the [journal-title abbreviation research](https://github.com/jeffnawroth/source-taster/blob/0b2664b6694d0c4e5d9f1711b8ef7dddcd6c7753/docs/research/journal-title-abbreviations.md).

[ADR-0010](0010-ai-provider-model.md) and [ADR-0011](0011-non-ai-structuring.md) store an abbreviated journal title as written in CSL `container-title-short`. Without a comparison rule, abbreviating styles (Vancouver, IEEE, AMA, ACS) would lose the journal weight of [ADR-0008](0008-scoring-verdict-rules.md) as a missing field. No free, license-clear source covers abbreviations across all disciplines. ISO 4 abbreviation is one-way, and shared abbreviations are common. The client therefore chose a rule that scores the journal field only when the abbreviation can be proven, and otherwise leaves the field unscored.

The approved baseline remains [requirements v3.3](../requirements-specification.md). The weights, renormalization and Scoring rules version of ADR-0008, the search rules of [ADR-0007](0007-search-strategy-latency.md) and the test-set gate of [ADR-0006](0006-reference-test-set-quality-gate.md) still apply. This is an accepted design. It is not a requirements amendment, a calibrated configuration, or a measured result.

## Comparison outcomes

When a Reference gives its journal title as an abbreviation, comparing it with the Candidate's journal has exactly one of three outcomes:

- **Demonstrably matching:** the abbreviation is attested for the Candidate's journal. The journal field fully agrees.
- **Demonstrably different:** the Candidate's journal has an attested abbreviation that differs, and the Reference's abbreviation is attested for another journal. The journal field is a normal deviation.
- **Not determinable:** every other case. The journal field is excluded and the participating weights are renormalized, as for a missing field. The explanation names the reason.

"Not determinable" never silently counts as agreement, as a deviation or as an error. In particular, a journal that is absent from the abbreviation sources is never treated as a deviation.

## Identity boundary

An abbreviation match proves only that the journal agrees, not that the work is the same. Identity keeps the ADR-0008 rules: identifiers, or strong title and author agreement. An abbreviation match can never decide a Mixed citation or a tie on its own.

## Abbreviation sources

- **NLM list:** a pinned snapshot of the NLM J_Medline list ships as part of the Scoring rules version. It maps abbreviations to journals by title, ISSN and NLM ID. Explanations and Verification reports name NLM as the source and show the snapshot date, as the NLM terms require.
- **Received records:** abbreviations already present on the record received for the Candidate also count:
  - the Europe PMC NLM abbreviation;
  - Semantic Scholar venue alternate names;
  - Crossref `short-container-title`, but only when it differs from the full title. The research found that 40 % of these entries simply repeat the full title.
- **No extra requests:** no source, including OpenAlex Sources, is queried only for an abbreviation. This keeps the ADR-0007 rule that no further source is queried after an unambiguous match.
- **Excluded:**
  - ISO 4 / LTWA rule-based abbreviation: the license is unresolved and there is no mature JavaScript tooling;
  - JabRef lists: CC0, but derived from upstream lists whose rights are not cleared;
  - CASSI: redistribution is forbidden.

  Adding any of them later requires a new decision and a new Scoring rules version.

## Normalization and matching

- **Form:** dots, whitespace and case are ignored, so "J. Biol. Chem." and "J Biol Chem" are equal.
- **Diacritics:** both the §8.3 folding ("ü" → "ue") and the NLM folding ("ü" → "u") count as matching.
- **Qualifiers:** when a Reference omits a qualifier that distinguishes journals with the same name, such as "(Basel)" or "(Lond)", it matches only if the Candidate is exactly the journal carrying that qualifier.
- **Shared abbreviations:** an abbreviation used by several journals still matches when one of them is the Candidate's journal, identified by ISSN, NLM ID or full title.
- **Acronyms:** acronyms such as "NEJM" or "PRL" are treated like any other abbreviation. They match only when attested for that journal. No separate acronym list is maintained.

## Correction suggestions

Correction suggestions keep the Reference's style:

- A correct abbreviation gets no suggestion to switch to the full title.
- On a journal deviation, the attested abbreviation of the correct journal is suggested.
- If the correct journal has no attested abbreviation, the full title is suggested and marked as a full title.
- An abbreviation is never invented.

## Versioning and evidence

- **Versioning:** the list snapshot, the source selection and the normalization rules belong to the Scoring rules version. A new snapshot is a new Scoring rules version, refreshed on a planned cadence such as each rules release, never daily. Existing results keep their version, and Re-checks use the current one.
- **Evidence:** both the Development set and the Reference test set contain abbreviating styles (Vancouver, IEEE, AMA, ACS). The cases cover:
  - shared abbreviations;
  - qualifiers;
  - acronyms;
  - diacritics;
  - abbreviations outside the NLM list, which must yield "not determinable".

  Calibration uses only the Development set, as ADR-0008 requires. Every new Scoring rules version must pass the Reference test set gate of ADR-0006, including these cases.

## Considered options

- **Attested abbreviations only, otherwise unscored (chosen):** never produces a false deviation from missing data, needs no extra requests, and stays license-clean. Coverage outside biomedicine depends on the abbreviations present on received records.
- **Rule-based ISO 4 abbreviation with the LTWA:** broad coverage, but the license is unresolved, the only JavaScript tool is unpackaged, and ISO 4 abbreviation is one-way, so it cannot prove a match in reverse.
- **Fuzzy matching of abbreviation against full title:** cheap, but it cannot tell journals with similar names apart and would produce unexplainable matches.
- **Extra OpenAlex Sources request:** adds latency and contradicts ADR-0007. Its `abbreviated_title` was missing in every sampled record.
- **Treating abbreviations as a missing field:** simple, but abbreviating styles would systematically lose the journal weight.

## Consequences

- **Coverage is uneven.** Biomedical journals are well covered by NLM. Other disciplines often end as "not determinable", which lowers the weight of the evidence but never fails the field.
- **Attribution and currency.** The explanation and the Verification report show NLM attribution and the snapshot date. The NLM snapshot appears in the license notices and the source register.
- **Update work.** Refreshing the snapshot is a release step that creates a new Scoring rules version and reruns the test-set gate.
- **ADR-0010 and ADR-0011 are completed, not changed:** their open scoring gap for `container-title-short` is resolved here.
- **Handed-off interfaces:**
  - [Results presentation and correction workflow](0016-results-presentation-workflow.md): the explanation shows "not determinable" with its reason and the abbreviation source.
  - [Accessible PDF verification reports](0017-accessible-pdf-reports.md): the report carries the same explanation, attribution and snapshot date.
