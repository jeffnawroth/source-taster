# Google Books response fixtures: storage and publication rights

Checked **2026-10-30**. Scope: #79 / PR #134 development fixtures, including the
existing HTTP 429 recording. This is source-based research and a recommended
engineering decision, not legal clearance or a conclusion that particular
bibliographic facts are copyrightable. No credentials, live Books API calls,
third-party contact, code/fixture/ADR changes, or issue/PR actions were used.

## Decision for this change

**Recommendation:** do not add a durable Google Books success recording, even
locally or in a private dataset repository, until its storage basis is recorded.
Do not publish a recorded success payload on GitHub without a basis covering
redistribution as well. Continue using independently authored synthetic protocol
witnesses, clearly labelled as synthetic, while keeping the successful-recording
requirement explicitly unresolved. The reason is the distinction between access
to the API and permission to retain or redistribute its content: the general
terms expressly address permanent copies, cache retention and distribution,
with exceptions for content-owner permission or applicable law. This is a
conservative project decision under unresolved rights, not a finding that every
small metadata fixture is unlawful. [G5a] [G5e]

Treat three questions separately:

1. **API access and allowance:** whether a request is authorized and within quota.
   A key, a successful request or an increased quota does not itself establish
   content-storage or publication rights. [G2] [G3c] [G5a]
2. **Fixture rights before recording/publication:** permanent local retention,
   offline replay, transformation and public redistribution of the selected
   content. These questions already arise during development. [G5e]
3. **Paid-service qualification:** Books-specific terms prohibit charging users
   any fee for use of the application absent a separate Google agreement or
   Google's written permission. A public, free development repository does not
   itself answer whether the future paid application qualifies. [B-fees]

Consequently, “provider approvals can wait until launch” is too broad for
recorded fixtures. Paid-service qualification can remain a separate launch
workstream, but rights for recording and publication must be resolved before
those acts, or the recordings must be avoided. [G5e] [B-fees]

## What the official sources actually say

The Books terms state **last modified April 25, 2012** and incorporate the general
Google APIs Terms of Service. The general terms state **last modified November
9, 2021**; their introduction includes accompanying documentation, policies and
guidelines in the “Terms,” and says API-specific additional terms control a
conflict. Both dates and texts were independently retrieved from Google's
official pages on the checked date; the supplied extracted texts were also
read. The generated “Page Summary” panels were not treated as contractual text.
[B] [G]

The material provisions are:

- **Ownership and protected content:** section 3(c) says API use does not acquire
  ownership of API/content rights. Section 5(a) says content may be subject to
  intellectual property rights and, if so, “you may not use it unless you are
  licensed to do so by the owner of that content or are otherwise permitted by
  law.” Google expressly describes third-party content. Access is therefore not
  a general downstream content license. [G3c] [G5a]
- **Permanent copies and distribution:** section 5(e) begins, “Unless expressly
  permitted by the content owner or by applicable law,” and prohibits, among
  other things, “Scrape, build databases, or otherwise create permanent copies
  of such content, or keep cached copies longer than permitted by the cache
  header”; its next bullet includes copying, modification, distribution,
  public display and sublicensing to third parties. The exception is material:
  this is not an unconditional statement that every response can never be
  redistributed. Neither does it grant a fixture-specific permission. [G5e]
- **Notices and origin:** section 5(e) also prohibits misrepresenting source or
  ownership, removing proprietary notices, and falsifying/deleting author
  attributions or origin labels. [G5e]
- **Attribution:** section 6(b) requires the attributions described in API
  documentation. Books branding guidance, “Overview” and “Search results and
  book information,” requires Google attribution, prominent Google Books links,
  and an adjacent “powered by Google” logo when rendering book results. The
  guidance also restricts alteration/reordering of results. Its opening says no
  pre-approval is needed to use the APIs, but expressly subjects use to the
  terms; that is not permission to archive or republish content. [G6b] [Brand]
- **Deletion/removal:** general section 8(b) requires deletion of cached/stored
  content permitted by cache headers on termination or discontinuation of API
  access. Books “Content Removal” requires removal of allegedly infringing
  content as required by law or on Google's request, and a rights-holder contact
  route. Those obligations matter when considering durable public copies.
  [G8b] [B-removal]

**No express development-test, recorded-fixture, open-source-repository or CI
exception was found** in the two terms pages or the Books branding, Getting
Started, Using the API, Volumes resource and Performance Tips pages checked.
The Getting Started guide mentions an account “for testing purposes”; it does
not authorize permanent recording or redistribution. Performance Tips explains
partial responses through `fields`, not a retention license. This is a bounded
negative finding about those documents, not a claim that no negotiated
permission or legal exception could exist anywhere. [B] [G] [Brand] [Start]
[Using] [Volume] [Performance]

## Applying the terms to the fixture choices

**Durable local or private recording.** Interpretation: a response committed to
Git for indefinite offline replay is a strong practical example of a permanent
copy, even with a single record and no public access. A private repository
addresses disclosure but does not, by itself, answer section 5(e)'s retention
restriction. Calling the file a fixture rather than a cache does not establish
an exception. Obtain permission or a documented applicable-law basis covering
the actual retained fields and use. [G5e]

**Public GitHub recording.** Interpretation: committing response content to a
public repository adds copying/distribution and potentially public display.
Public access to the API and attribution do not establish these rights.
Permission should cover Git history, forks, offline developer/CI copies and
continued retention; a project code license cannot supply third-party rights
that the project does not hold. No repository-wide relicensing of Google or
publisher content should be implied. [G3c] [G5a] [G5e]

**Cache duration.** The checked terms give no universal Google Books “24-hour”
or “30-day” fixture allowance. Section 5(e) refers to the response cache header;
no header value for a future success response was obtained in this research.
Missing headers are not affirmative evidence of indefinite permission. A finite
cache allowance does not establish perpetual Git storage or public
redistribution. The project's initial 24-hour cache TTL is conditional on source
permission, not a Google grant, and does not solve durable fixture retention.
[G5e] [R7]

**Metadata-only payloads.** A minimal candidate would retain only the protocol
structure and needed bibliographic values, such as record ID, title, authors,
publisher, publication date, ISBNs, language and a provenance link. This is a
recommended reduction in copied material, not an assertion that Google licenses
those fields for publication. The Volumes schema describes the fields but does
not attach a blanket metadata reuse license. Requesting only needed fields with
`fields` is documented; using it does not itself change section 5(e). Do not
assume `projection=lite` excludes expressive material: the resource reference
marks `volumeInfo.description` and image links as included in LITE. [Volume]
[Performance] [G5e]

**Descriptions, covers and snippets.** The schema defines
`volumeInfo.description` as an HTML-formatted synopsis, `imageLinks` as image
URLs, and `searchInfo.textSnippet` as text containing the search query. These are
unnecessary for the proposed bibliographic fixture and should be excluded.
Fetching and storing cover image bytes would be an additional copying act;
retaining a URL is not evidence of rights to the image at that URL. Expressive
text/images require their own rights analysis, rather than borrowing a metadata
assumption. [Volume] [G5a] [G5e]

**Public-domain flags.** `accessInfo.publicDomain` describes whether the book is
public domain in `accessInfo.country`. It is not a blanket license for the full
API response, a separately authored synopsis or cover, or worldwide
redistribution. Interpretation: do not use that flag alone as the fixture's
rights evidence. [Volume] [G5a]

**Attribution is a condition, not permission.** Preserve source/author/legal
notices and record provenance if a recording is authorized. A README credit
cannot cure missing retention/distribution permission. The precise branding
presentation for an offline JSON file in a public repository is unresolved: the
guidance describes displayed results, not a clear raw-fixture exception.
Likewise, its alteration rule should be clarified for a sanitized recording;
requesting a partial response is expressly documented, but that is not an
unlimited modification grant. Ask Google what attribution/linking treatment is
required for that specific use. [G5e] [G6b] [Brand] [Performance]

The CC BY 4.0 / Apache 2.0 footer on Google Developers documentation is not a
license for production Books API responses. Site Policies describes reuse of
content on the documentation pages and code samples, with exclusions; the
separate API content provisions still need to be addressed. [Site] [G5a] [G5e]

## Copyright, database rights and contract are separate questions

A response schema, an API access allowance, Google's contract, rights in
individual content and rights in a collected database are different evidence.
General section 2(b) requires compliance with third-party rights and applicable
law in addition to Google's terms; section 5(a) explicitly leaves protected
content rights with the relevant content owner. Google's permission would need
to identify what rights Google can actually grant. [G2] [G5a]

No definitive copyright conclusion is made for factual bibliographic metadata.
For example, German UrhG section 2(2) requires a personal intellectual creation
for a protected work. That supports examining the actual material rather than
assuming every field is protected or that every “metadata” field is free of
rights. German database protection separately depends on a qualifying
substantial investment (section 87a); section 87b addresses substantial parts
and certain repeated/systematic uses of insubstantial parts. These provisions
do not establish that Google Books qualifies, that a particular tiny fixture
infringes, or that extraction is automatically permitted. [D2] [D87a] [D87b]

Mandatory legal limits on contractual restrictions may also matter: German
section 87e limits agreements restricting specified legitimate uses of
insubstantial database parts, subject to its conditions. Whether its conditions,
territorial scope and governing-law rules apply here requires legal analysis;
this note does not resolve it. The general Google terms specify California law
and Santa Clara venue for the ordinary case, which is another reason not to
assume the German examples settle this contract. [D87e] [G10c]

Nor is “testing/research” automatic US fair use: 17 USC section 107 lists research
among examples but requires assessment of purpose, nature, amount and market
effect. That provision does not itself decide the contract question or create a
universal public-test-fixture license. It is cited from the official 2024 US Code
edition as an illustration, not a cross-jurisdiction legal clearance. [US107]

## The existing HTTP 429 recording

Repository observation: the README reports an unauthenticated 2026-10-30 request
that returned quota exhaustion, and explicitly says no successful Google Books
recording exists yet. The JSON contains a Google service error, quota metadata,
a consumer project identifier and a quota-help link; it contains no returned
book record, synopsis, cover or snippet. It stores a body, not the original HTTP
response headers. This is a separate, narrower rights question from publishing
publisher/book content. [R-readme] [R429]

**Assessment:** third-party book-content concerns identified above are absent
from this particular body, but no express published exception for permanent
storage/publication of error responses was found. The terms say “content
returned from the APIs”; whether and how that includes this operational error
body is unresolved, not an automatic exemption or proven infringement.
Its existence proves neither rights to a successful response nor fulfillment of
the successful-recording gap. The embedded project identifier does not establish
that Source Taster owns that project or has an authorized allowance. [G5e]
[G2] [R429] [R-corrections]

**Recommendation before further publication:** assess that exact file separately.
For public regression coverage, prefer a minimal independently authored synthetic
429 witness containing only needed protocol values, clearly marked synthetic,
with no real consumer/project identifiers. Keep a factual provenance note of the
observed quota failure without implying the synthetic body is a recording. If
retaining the verbatim body is required, obtain a rights basis specifically
covering error responses. Do not imply that redacting the recorded JSON alone
creates permission. This research leaves the existing file unchanged. [G5e]
[R429]

## Missing evidence and concrete next steps for #79 / PR #134

The implementation note and review corrections report successful Google Books
responses as synthetic and the live-success recording as outstanding. ADR-0007
separates paid-service rights from fixture/cache rights and allows raw replay
responses only where licensed. ADR-0006 says Google Books responses are kept
private and never published. Those are internal decisions, not proof of a
content license; in particular, private storage still needs a basis. The ADR's
short characterization of a whole data source as “commercially restricted”
cannot replace checking the actual content/retention terms. [R-implementation]
[R-corrections] [R7] [R6] [G5a] [G5e]

Missing now: a successful response and its cache headers; a permission/license
covering durable recording and public downstream copies; evidence of the rights
and grant authority for the chosen content; a reviewed legal-exception rationale
if one is relied on; and a separate basis for retaining/publishing the error
body. None is supplied by the existing provenance README or implementation
receipts. [R-readme] [R-implementation] [R429] [G5a] [G5e]

Recommended follow-up, without changing the issue/PR in this research task:

1. **Keep the gap explicit.** Do not fetch/commit a success recording just to
   satisfy the recorded-fixture review item. Public synthetic protocol witnesses
   can support adapter regressions, but do not meet the recorded-success
   requirement or establish source qualification. Seek an explicit scope/acceptance
   decision if #79 is to finish without that requirement. [R-corrections]
2. **Resolve rights before durable recording or publication.** Record either
   suitably scoped written permission/license or a reviewed applicable-law
   rationale for the exact fields, amount, origin, retention and distribution.
   For public publication, also resolve ADR-0006's existing nonpublication rule
   through the project's decision process; this note does not amend it. [G5a]
   [G5e] [R6]
3. **Maintain a per-fixture rights record if recording is approved:** acquisition
   date and documented request, selected fields and transformations, applicable
   terms/version, actual relevant response cache headers, content owners and
   license/permission evidence, attribution/link requirements, permitted local
   and public uses, expiry/deletion and removal obligations. Do not infer an
   indefinite license from a successful HTTP response or from the repo license.
   [G2] [G3c] [G5a] [G5e] [G6b] [G8b] [B-removal]
4. **Obtain access allowance separately.** Any later authorized recording must
   respect documented identification and quota requirements. Do not bypass the
   observed 429. Quota approval alone does not close the fixture-rights item.
   Paid-application permission under “Fees” remains another separate
   qualification. [Start] [G2] [B-fees]
5. **Review the 429 file separately** using the narrower assessment above, before
   treating its present inclusion as a precedent for public response recording.
   [G5e] [R429]

A narrowly scoped question for Google, to prepare but **not send**:

> May Source Taster permanently retain and replay a small, fixed set of Google
> Books Volumes API responses solely as offline software regression fixtures,
> first privately and also in its public GitHub repository? The proposed success
> fixtures would contain only protocol fields and necessary bibliographic
> metadata (IDs, titles, authors, publisher, publication date, ISBNs, language and
> a Google Books provenance link), excluding descriptions, cover/image content,
> snippets, previews, reviews, user data and credentials. Please separately
> confirm whether sanitized quota-error bodies may be retained and published.
> Does the permission cover partial-field selection/sanitization, indefinite Git
> history, forks and downstream developer/CI copies despite section 5(e)'s
> permanent-copy, cache and redistribution restrictions, and what attribution,
> linking, expiry or removal conditions apply? Please identify any third-party
> rights this permission does not cover and whether you can grant the necessary
> rights for the included metadata. This request concerns fixtures only; it does
> not request or presume permission to charge for the application under the
> Books-specific Fees clause.

If Google cannot grant the necessary third-party rights, obtain an independent
rights basis or keep real responses out of the fixtures. Neither silence nor an
API key/quota increase answers that question. This recommendation follows the
separate content-owner permission and access provisions. [G2] [G5a] [G5e]

## Sources and verification boundary

All external sources cited below were fetched from their official publishers on
**2026-10-30**. No Books data endpoint was called. The listed Google terms,
branding, API guides/reference and site-policy pages returned their substantive
text; the German statutory pages and the official US Code section were also
read. Unusable retrievals (including EUR-Lex's empty/challenge response and
blocked US Copyright Office/eCFR pages) are not used as evidence. The absence of
a checked fixture exception is limited to the documents identified above.

Repository observations refer to local files read at HEAD
`1b583c8fcce2548321d41b2d41fa896fc2dc570c`; their first-party GitHub URLs are
pinned below. AGENTS.md, GLOSSARY.md and all requested ADR/implementation/fixture
context were read. No predecessor repository was accessed.

[G]: https://developers.google.com/terms "Google APIs Terms of Service — introduction; last modified November 9, 2021"
[G2]: https://developers.google.com/terms#section_2_using_our_apis "Section 2(b)–(d): law/third-party rights, permitted access, API limitations"
[G3c]: https://developers.google.com/terms#c_ownership "Section 3(c): Ownership"
[G5a]: https://developers.google.com/terms#a_content_accessible_through_our_apis "Section 5(a): Content Accessible Through our APIs"
[G5e]: https://developers.google.com/terms#e_prohibitions_on_content "Section 5(e): Prohibitions on Content"
[G6b]: https://developers.google.com/terms#b_attribution "Section 6(b): Attribution"
[G8b]: https://developers.google.com/terms#b_your_obligations_post-termination "Section 8(b): Your Obligations Post-Termination"
[G10c]: https://developers.google.com/terms#c_general_legal_terms "Section 10(c): General Legal Terms — law/venue"
[B]: https://developers.google.com/books/terms "Books-specific terms — incorporation; last modified April 25, 2012"
[B-fees]: https://developers.google.com/books/terms#fees "Fees"
[B-removal]: https://developers.google.com/books/terms#content-removal "Content Removal"
[Brand]: https://developers.google.com/books/branding#search-results-and-book-information "Branding Guidelines — opening; Overview; Attribution and logos; Search results and book information"
[Start]: https://developers.google.com/books/docs/v1/getting_started#before_starting "Before you start — testing account; authorizing requests and identifying your application"
[Using]: https://developers.google.com/books/docs/v1/using "Using the API — authorization, search and volume retrieval"
[Volume]: https://developers.google.com/books/docs/v1/reference/volumes#resource-representations "Volumes resource representation — volumeInfo, accessInfo and searchInfo fields"
[Performance]: https://developers.google.com/books/docs/v1/performance#partial-response "Performance Tips — Partial response"
[Site]: https://developers.google.com/terms/site-policies "Site Policies — documentation license; What is not licensed?; Attribution"
[D2]: https://www.gesetze-im-internet.de/urhg/__2.html "UrhG § 2(1)–(2): protected works / personal intellectual creation"
[D87a]: https://www.gesetze-im-internet.de/urhg/__87a.html "UrhG § 87a(1)–(2): database and database-maker definitions"
[D87b]: https://www.gesetze-im-internet.de/urhg/__87b.html "UrhG § 87b(1): database-maker rights and repeated/systematic insubstantial uses"
[D87e]: https://www.gesetze-im-internet.de/urhg/__87e.html "UrhG § 87e: contractual restrictions on database use"
[US107]: https://www.govinfo.gov/content/pkg/USCODE-2024-title17/html/USCODE-2024-title17-chap1-sec107.htm "17 USC § 107 — fair use; official 2024 edition, operative text"
[R6]: https://github.com/jeffnawroth/source-taster/blob/1b583c8fcce2548321d41b2d41fa896fc2dc570c/docs/adr/0006-reference-test-set-quality-gate.md#storage-and-rights "ADR-0006 — Storage and rights"
[R7]: https://github.com/jeffnawroth/source-taster/blob/1b583c8fcce2548321d41b2d41fa896fc2dc570c/docs/adr/0007-search-strategy-latency.md#source-permissions-cache-and-url-retrieval "ADR-0007 — Source permissions, cache and URL retrieval; Candidate retrieval and early termination"
[R-readme]: https://github.com/jeffnawroth/source-taster/blob/1b583c8fcce2548321d41b2d41fa896fc2dc570c/apps/server/test/fixtures/books/README.md "Book Data source fixtures — provenance and synthetic/recorded distinction"
[R429]: https://github.com/jeffnawroth/source-taster/blob/1b583c8fcce2548321d41b2d41fa896fc2dc570c/apps/server/test/fixtures/books/googlebooks-rate-limit.json "Recorded 429 JSON body"
[R-implementation]: https://github.com/jeffnawroth/source-taster/blob/1b583c8fcce2548321d41b2d41fa896fc2dc570c/docs/implementation/79-books.md#validation-and-qualification "#79 implementation — Validation and qualification"
[R-corrections]: https://github.com/jeffnawroth/source-taster/blob/1b583c8fcce2548321d41b2d41fa896fc2dc570c/docs/implementation/79-review-corrections.md#spec "#79 review corrections — Spec item 1: successful Google Books recording gap"

Portions of this note reproduce or adapt Google Developers documentation, used
under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); the individual
Google source pages and sections are linked above. Analysis and recommendations
are this note's additions, not statements by Google.
