# Source Taster

Source Taster checks whether references point to sources that exist and are cited correctly. This vocabulary follows the [English requirements specification](docs/requirements-specification.md), especially sections 8 and 18.

## Language

**Reference**:
A bibliographic entry as raw text whose existence and correctness are to be checked.
_Avoid_: Citation, entry (as names for this concept)

**Source**:
The actually published work to which a reference points.
_Avoid_: Work, publication (as competing domain names), data source

**Data source**:
A database or catalog in which the system searches for sources, such as OpenAlex or a library catalog.
_Avoid_: Source, provider (without qualification)

**Check**:
A verification run over a set of references.
_Avoid_: Scan, job, verification (as names for the run)

**Hallucination**:
A reference invented by an AI or incorrectly assembled from real components.

**Structuring**:
Breaking a reference down into bibliographic fields such as authors, title, year and journal, through AI extraction or parsing.

**AI extraction**:
Structuring references with an AI, including references in running text.
_Avoid_: Parsing (when specifically referring to the AI path)

**Parsing**:
Structuring references with a rule-based parser, including individual references supplied by bibliography detection.
_Avoid_: AI extraction

**Candidate**:
An entry returned by a data source that could match the reference.
_Avoid_: Hit, result (as competing domain names)

**Field score**:
Agreement from 0 to 100 % between a reference field and the corresponding candidate field, under the scoring rules.
_Avoid_: Confidence

**Score**:
Weighted agreement between a reference and a candidate from 0 to 100 %, based on their compared field scores.
_Avoid_: Confidence, rating

**Best match**:
The candidate with the highest overall score; being the best match does not by itself establish an unambiguous match.
_Avoid_: Winner, best result

**Verdict**:
The result for a fully checked reference: Correct, Exists, with deviations, Mixed citation, DOI conflict, Not found or Not verifiable (the labels from section 8.4).
_Avoid_: Status, rating; Deviating, Mixed or Unverifiable as alternative labels

**Mixed citation**:
A reference whose components come from different real works.

**DOI conflict**:
The given DOI does not exist or belongs to a different work.

**Status**:
The state shown instead of a verdict while a reference is running, after cancellation or after an internal technical error.
_Avoid_: Verdict

**Correction suggestion**:
The reference rebuilt from the data of the source found, in the selected citation style.
_Avoid_: Fix

**Scoring rules version**:
The version of the rules used to score candidates and derive a verdict.

**Early termination**:
The end of the search for a reference as soon as a candidate matches unambiguously.
_Avoid_: Cancellation

**Verification report**:
A document containing all verdicts of a check as evidence.
_Avoid_: Report (as the canonical domain name)

**History**:
Stored earlier checks of an account, limited in the free plan and extended in paid plans.

**Plan**:
A service package with price and quota, such as Free or Pro.
_Avoid_: Tier

**Quota**:
The number of checked references that a plan allows within a period.
_Avoid_: Credits

**Check pack**:
A one-time purchase of a quota with a validity period and Pro features, without a subscription.
_Avoid_: Bundle, credits

**Guest**:
A user without an account.
_Avoid_: Anonymous user (as a competing role name)

**Account**:
A person's registration, confirmed by e-mail, with which they sign in to the extension and the web app; at market launch each account acts for exactly one owner, its own.
_Avoid_: Owner (as a substitute)

**Owner**:
The person to whom a quota, plan or stored check is assigned at market launch; later, an owner can also be an organization.
_Avoid_: Customer, user (as substitutes for ownership)

**Operator**:
The role responsible for providing, selling and supporting the service, including plans, customers and quotas.
_Avoid_: Admin (as a substitute for this role)

**Reference test set**:
The versioned collection of real and invented references maintained by the operator for quality measurement.
_Avoid_: Benchmark (as a competing domain name)

**Initial value**:
A value set by the requirements specification for market launch that the operator can change afterwards.

**Trigger**:
An observable event from which a deferred requirement is reassessed.

**Deferred**:
A requirement implemented only when its trigger occurs and the client reassesses its obligation in a new specification version.
_Avoid_: Optional
