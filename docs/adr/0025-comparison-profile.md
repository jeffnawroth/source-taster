---
status: accepted
---

# Compare fields with one fixed, integer-exact profile and calibrate only a declared parameter set

The client accepted this design on 26 October 2026 in [Versioned comparison algorithms and arithmetic profile](https://github.com/jeffnawroth/source-taster/issues/63), through [F1–F6](https://github.com/jeffnawroth/source-taster/issues/63#issuecomment-6408649104) and [F7–F9](https://github.com/jeffnawroth/source-taster/issues/63#issuecomment-6408673999), with the clarifications confirmed in the same session. [ADR-0008](0008-scoring-verdict-rules.md) fixed identity and Verdict precedence, the page formula and six-decimal storage. It did not approve the prototype's edit-distance metric, name and date weights, order penalty or thresholds. It also left the arithmetic and the handling of non-numeric pages and article numbers open. FA-ABG-01/03/05 require reproducible field similarity, weighted means and normalization. This ADR fixes the algorithms and arithmetic. It separates the few parameters that are calibrated from everything that is not. In exchange, a fixed rule can change only through a new decision and a new Scoring rules version, never through tuning.

The approved baseline remains [requirements v3.3](../requirements-specification.md). This is an accepted design. It is not a requirements amendment: sections 8.1–8.4, the §8.2 field weights and the §8.3 examples are unchanged. ADR-0008's identity, DOI-conflict, Mixed and Verdict rules, [ADR-0011](0011-non-ai-structuring.md)'s structured fields and [ADR-0018](0018-journal-title-abbreviations.md)'s abbreviation outcomes remain the foundations. No prototype number becomes a default.

## Text similarity

- **Metric:** Optimal String Alignment distance. Insertion, deletion, substitution and transposition of adjacent characters each cost 1. Distance is measured on Unicode code points after normalization.
- **Similarity:** `1 − distance / max(length A, length B)`. The metric has no free parameter. "Jouranl"/"Journal" = 85.714286 %.
- **Applies to:** titles, full journal titles (abbreviations follow ADR-0018), surnames, full given names and corporate authors.
- **Versioning:** the runtime's Unicode/ICU version belongs to the Scoring rules version and the Measured configuration.

## Normalization

Apply these steps in this fixed order to both sides. Raw values are always preserved.

1. Strip provider markup and decode entities.
2. Repair recognized UTF-8-read-as-Windows-1252 damage, and only when the result is valid.
3. Apply NFKC. Map typographic dashes, quotes and apostrophes to ASCII.
4. Apply case folding and map ß to ss.
5. Fold umlauts both ways: ä/ö/ü → a/o/u and → ae/oe/ue. Use the same fold on both sides; the higher similarity counts. Remove other diacritics.
6. Map punctuation to space and collapse whitespace.

Examples:

- "Müller"/"Muller" and "Müller"/"Mueller" agree fully.
- "Mueller"/"Muller" remains an 85.714286 % deviation.

Identifier normalization keeps §8.3. The §8.3 retraction-prefix rule and ADR-0008's provenance condition are unchanged.

**Journal acronyms (§8.3):**

- In the journal field only, remove one trailing token in round or square brackets on each side before comparison and before ADR-0018's abbreviation check. "Journal of Testing (JOT)" = "Journal of Testing".
- The token must contain at least two characters, all of them uppercase Latin letters or digits in the raw value, with no spaces.
- Mixed-case qualifiers such as "(Basel)" or "(Lond)" are therefore kept. They stay governed by ADR-0018's qualifier rule.

## Arithmetic and full agreement

- **Representation:** integer fixed point in millionths of a percentage point, from 0 to 100,000,000. No floating point is used anywhere in scoring.
- **Rounding:**
  - Within a field, compute with exact rationals (BigInt) and round once to the stored Field score.
  - The overall Score is `Σ(weight × stored Field score) / Σ weight` over the compared fields, using the integer §8.2 weights, and is rounded once.
  - Rounding is half up everywhere, including the two-decimal display.
- **Ranking and ties:** compare the stored integers exactly.
- **Full agreement:**
  - It is a separate flag on each Field score and on the overall Score.
  - A value without normalized full agreement is stored as at most 99.999999 and displayed as at most 99.99 %.
  - The overall Score has full agreement only when every compared field does.

## Field rules

### Dates

- **Year:** equal = 1, exactly one year apart = 0.5, otherwise 0.
- **Month and day:** equal = 1, otherwise 0.
- **Shared components:** compare only components present on both sides. Compare the day only when both sides also have a month. Renormalize the component weights.
- **Special forms:** seasons and date ranges compare only the year. "in press" and "n.d." count as no date: the field is excluded and the exclusion is explained.

### Pages and article numbers

- **Page ranges:** expand abbreviated ranges first, then apply ADR-0008's inclusive formula.
- **Roman numerals:** Roman numerals on both sides are converted and use the same formula. Roman against Arabic is not determinable.
- **Prefixes:**
  - Equal prefixes ("S12–S15") use the formula.
  - Different prefixes = 0 %.
  - A prefix on one side only is not determinable.
- **Article numbers:** compared after normalization; equal = 100 %, otherwise 0 %. An article number against a page range is not determinable.
- **Unrecognized formats:** normalized equality = 100 %, otherwise not determinable.

"Not determinable" means the field is excluded, the weights are renormalized and the reason is explained, as in ADR-0018.

### Volume and DOI

- **Volume:** read the volume number from combined notation ("Vol. 12 (3)" = 12); equal = 100 %, otherwise 0 %. Non-numeric volumes compare by normalized equality.
- **Issue:** explained, but not weighted.
- **DOI field:** binary after identifier normalization.

### Authors

**Name pair score:**

- **Surname:** compared by OSA. If either surname has a particle ("van der", "von"), compare it both with and without the particle; the higher value counts.
- **Given names:**
  - Split into components; hyphens also separate components ("Hans-Peter" ≙ "H.-P.").
  - Compare components positionally, only where both sides have one.
  - An initial against an initial or a full name scores 1 for the same letter, otherwise 0.
  - A full name against a full name is compared by OSA, so "Anna"/"Andrea" does not become equal through a shared initial.
  - If either side has no given name, only the surname is compared.
- **Pair score:** weighted mean of the surname score and the mean given-name score. The surname weight is greater than the given-name weight.
- **Corporate authors (CSL `literal`):** literal against literal compares the whole name by OSA. Literal against person = 0.
- **Full agreement:** a pair agrees fully exactly when its pair score is 1. "Müller, A. B." against "Muller, Anna" therefore agrees fully at 100 %.

**List assignment:**

- **Optimal assignment:**
  - Assign names one-to-one with the maximum sum of pair scores (Hungarian method).
  - Among equal sums, prefer the assignment that best preserves order, then the lowest Reference positions.
  - Pairs below the calibrated minimum name similarity are unassigned: they count 0 and are ignored for order.
- **Field score:** `Σ assigned pair scores / N × (1 − p × d)`.
  - N is the larger of the two name counts, so missing and extra coauthors reduce the score.
  - d is the fraction of discordant pairs (Kendall distance) among assigned names; d = 0 when fewer than two names are assigned.
  - p is the order penalty, with 0 < p ≤ 1.
- **Explicit "et al." / "u. a." (ADR-0011's truncation marker):** N = the number of Reference names plus the unassigned Candidate names that precede the last assigned Candidate position.
  - Only trailing omissions are free.
  - Such omissions do not prevent full agreement.
  - Without the marker, the normal N applies.
- **Full agreement of the field:** every name is assigned with full agreement, none is missing (except trailing names after an explicit marker) and d = 0.
- **Size limit:**
  - Optimal assignment runs for up to **100 Reference names**, against Candidates of any length. Cost grows about as (Reference names)² × (Candidate names), roughly 3 × 10⁷ steps in the extreme case.
  - Above that, names are assigned by position (name i against name i), using the same formula.
  - The 100 is an outcome-affecting Initial value, not a calibration parameter. Changing it requires a new Scoring rules version and a passed gate.

## Calibration boundary

**Free parameters,** tuned only on the Development set and within these constraints:

| Parameter | Constraint |
| --- | --- |
| Surname and given-name weights | Surname > given names |
| Minimum name similarity | > 0 |
| Order penalty p | 0 < p ≤ 1 |
| Month and day weights | Each < year weight |
| ADR-0008 thresholds: overall Score, strong field, lead, Mixed component and contradiction, counterevidence | As defined in ADR-0008 |

**Fixed:** everything else in this ADR is fixed and is never calibrated. That includes:

- metric, normalization, arithmetic, precision and rounding;
- page, article-number, volume and DOI rules;
- the 0.5 year rule;
- the assignment method;
- the size limit;
- the §8.2 field weights.

**Selection procedure:**

1. Declare a grid over the free parameters within the constraints before the search.
2. Run a deterministic search on the Development set.
3. Select the configuration that meets every §14.4 target with the largest minimum margin to those targets. Ties go to the first grid point in declared order.
4. Store the grid, every result and the selected values with the Scoring rules version.
5. Freeze the configuration and submit it to [ADR-0006](0006-reference-test-set-quality-gate.md)'s Reference test set gate.

Development builds before calibration use placeholder values marked "uncalibrated". Such a configuration can be neither released nor activated. If no grid point meets the targets, nothing is released. Changing a fixed rule then requires a new client decision.

## Versioning

Every rule, the size limit, the Unicode/ICU version and every calibrated value belong to the Scoring rules version and the Measured configuration. Any change creates a new version and requires a passed gate under ADR-0006. Old results keep their version.

## Acceptance evidence

- **§8.3 examples (FA-ABG-05):**
  - "Jouranl"/"Journal" = 85.714286 %.
  - "Müller, A. B." = "Muller, Anna" at 100 % with full agreement.
  - "2021" against "2021-06-15" fully agrees.
  - "125–126" within "123–128" = 100 %; "127–130" against "123–128" = 50 %.
  - "Vol. 12 (3)" = 12.
  - "Journal of Testing (JOT)" = "Journal of Testing".
- **Arithmetic (FA-ABG-03):** ten recalculated cases reproduce the stored integers and their two-decimal display exactly. A deviation that rounds to 100 is stored as at most 99.999999 and displayed as at most 99.99 %.
- **Authors:**
  - Reversed order is reduced by p.
  - A missing coauthor without a marker reduces the score through N; with an explicit "et al.", omitting trailing names leaves full agreement.
  - One Candidate name never satisfies two Reference names.
  - Literal against person = 0.
  - Lists above 100 Reference names use positional assignment.
- **Normalization:** "Müller"/"Mueller" agree fully, while "Mueller"/"Muller" deviates. Repaired mojibake agrees. "Cells (Basel)" keeps its qualifier.
- **Not determinable fields:** Roman against Arabic pages, one-sided prefixes, article number against range, and unknown unequal formats are excluded and explained.
- **Calibration and replay:** the calibration record reproduces the selected configuration from the declared grid; an uncalibrated build is refused at release and activation. Replay on another machine yields identical integers.

## Considered options

- **OSA distance, integer fixed point, declared calibration set (chosen):** proportional typo and transposition handling, exact replay across runtimes, few tunable parameters.
- **Levenshtein without transpositions:** a transposition would cost 2 and be scored too harshly. Rejected.
- **Jaro-Winkler or token-based similarity:** adds prefix bias or free parameters and does not reduce proportionally as FA-ABG-01 requires. Rejected.
- **Floating-point arithmetic:** risks cross-runtime differences at threshold boundaries. Rejected.
- **Calibrating every number, including normalization and field rules:** a large search space with overfitting risk on the Development set. Rejected.
- **Greedy or purely positional author assignment for all lists:** can misassign reordered lists and violates optimal one-to-one assignment. Kept only above the size limit.
- **Letting rounding to 100 count as agreement:** violates §8.2. Rejected in favour of the 99.999999 cap.

## Consequences

- `packages/core` (ADR-0003) gets one deterministic comparison module: normalization, OSA, field rules, author assignment and integer arithmetic. It has no floating point and no unversioned dependency.
- Structuring must provide ordered name parts, particles, the truncation marker and page/article-number formats (ADR-0011).
- The Development set must exist before any release. Until then, only uncalibrated development builds run.

Handed-off interfaces:

- **Implementation:** the comparison module, the calibration runner over the declared grid, and the release and activation refusal for uncalibrated configurations.
- **Reference test set and quality gate ([ADR-0006](0006-reference-test-set-quality-gate.md)):** include the acceptance cases above and record the calibration result with the gated configuration.
- **[Final technical-concept synthesis and requirements traceability](https://github.com/jeffnawroth/source-taster/issues/60):** close G03 and update the FA-ABG-01/03/05 and section 8 rows.
