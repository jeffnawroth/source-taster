# Review and corrections for #86

The `code-review` skill ran two independent agents against
`git diff 3855cc64906e3f7e47097e906739a94067ce23d7...28ec12a`.
This records their separate findings and the subsequent corrections.

## Standards

1. **Concrete correctness finding: synchronous rendering blocks the API.**
   Each eligible Reference constructed a separate citeproc engine and rendered
   three formats inside the Hono request. The automatic UI request repeated
   this whole-Check operation on each completed slot. The reviewer measured
   100 single-entry APA renders at 28,579 ms during concurrent tests; this was
   evidence of event-loop blocking, not a production capacity measurement.
   ADR-0003 and ADR-0016 require responsive SSE, lease renewal and cancellation.
2. **Judgment call: possible Duplicated Code.** The API tests repeated the
   bibliography POST, headers and schema parsing in several tests.

**Resolution:** One reusable worker thread per web process handles rendering,
with eight queued requests and a 30-second active deadline. It does not retain
a Check cache or hold an Owner authorization lock while computing; snapshot
read and publication remain separately guarded. One batch engine produces
independent suggestion entries with numbering, disambiguation and repeated
author substitution disabled. The client requests only visible/selected
suggestions automatically and renders the full bibliography on explicit
export. API coverage renders a twelve-Reference Check while `/health` remains
responsive and checks that repeated-author substitutions/year suffixes do not
leak into independent suggestions. Public-HTTP test helpers remove repetition.

## Spec

1. **P2: selected-style paragraph layout was lost in rich exports.** #86 asks
   for a bibliography copied as rich text; ADR-0023 requires RTF in the selected
   style. Discarding citeproc layout parameters omitted APA hanging indents and
   double spacing; stripping alignment classes placed IEEE labels on separate
   blocks.
2. **P2: selected-correction preview was missing.** ADR-0016 says, “Before
   download show format, selected citation style and the selected suggested
   corrections.” Only the currently open Reference showed its selection.

**Resolution:** RTF paragraph controls and safe, generated clipboard HTML now
retain hanging indents, line/entry spacing and inline number labels. Untrusted
HTML attributes, links and images are discarded. API tests check APA indentation
and double spacing and IEEE inline labels. The export section shows RTF, the
localized style name and every selected correction. A two-slot browser case
selects both corrections, checks the complete preview and downloads RTF while
original fields and Verdicts remain unchanged.

Original findings: **Standards 2** (one correctness issue, one judgment call),
**Spec 2** (both P2). All four were addressed. The most significant Standards
issue was API blocking; the most significant Spec issue was rich-export layout.
No review issue remains intentionally deferred.
