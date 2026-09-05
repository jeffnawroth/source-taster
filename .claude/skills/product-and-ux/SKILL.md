---
name: product-and-ux
description: Product and UX method — problem → outcome → requirements → acceptance criteria → domain validation, UX designed from the user problem rather than from backend limits, and the hypothesis/metric discipline for growth work. Use when defining features, scoping work, designing user flows, or evaluating whether requirements serve the real user problem.
---

# Product & UX

Canonical method: `docs/ai-os/core/operating-model.md` (§16/§17) and
`principles.md` (§4/§9). Source Taster domain validation is project-specific —
see the `domain-academic-references` skill.

## Product workflow (§16)

1. **Problem** — the user problem in one sentence, validated against the domain
   (academic reference verification).
2. **Outcome** — the measurable outcome the feature must produce, e.g.
   "hallucinated citations are caught before the thesis is submitted".
3. **Requirements** — derived from the outcome; every requirement traces back
   to a problem element. No orphan requirements.
4. **Acceptance criteria** — testable Given/When/Then per requirement. A
   requirement without acceptance criteria is not done.
5. **Domain validation** — check against the canonical domain model (AGENTS.md
   terminology, CSL-JSON, matching thresholds). If a requirement contradicts
   the domain model, escalate instead of bending the domain.

Keep requirements minimal. Reject gold-plating not tied to the outcome.

## UX independence (§9)

**The UX is designed from the user problem, not from what the backend happens
to support.** If the backend forces a worse experience, the recommendation is a
backend change — not a silently degraded UX.

1. **User problem** — what is the user trying to do?
2. **Ideal UX** — design the flow as if the API were perfect: states, feedback,
   error and empty cases, accessibility.
3. **Backend impact** — list what the ideal UX needs that the API does not
   provide; quantify it (endpoint, payload, latency).
4. **Recommendation** — name the backend change explicitly. Degrade the UX only
   with a documented constraint reason, never silently.

Both surfaces are bilingual (de + en) — new UI strings need both locales.

## Growth work (§17)

Hypothesis ("if X then Y because Z") → the one **metric** that would falsify it,
with direction and threshold → the smallest **experiment** that tests it →
**measurement** planned before the experiment runs, with a pre-registered
decision rule. A claim with no falsification threshold is an assumption, not a
hypothesis. Do not scale an experiment that failed its threshold; iterate the
hypothesis instead.

## Evidence and approval discipline (§36/§46)

- Separate **facts** (observed/measured) from **assumptions** (untested) in
  every report.
- Product artifacts this workflow produces are written `Status: proposed` —
  never `Status: accepted`. Status is not a self-assessment.
- `accepted` is set only in the commit that follows an explicit human approval,
  reusing the existing commit human-gate rather than inventing a new mechanism.
