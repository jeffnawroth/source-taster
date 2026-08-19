---
name: product-operating-model
description: Product operating model — problem → outcome → requirements → acceptance criteria → domain validation. Use when defining product features, scoping work, or reviewing whether requirements serve the real user problem.
---

# Product Operating Model

## Workflow (§4/§7/§16)
1. **Problem** — state the user problem in one sentence; validate it against the domain (academic reference verification)
2. **Outcome** — measurable outcome the feature must produce (e.g. "hallucinated citations are caught before the thesis is submitted")
3. **Requirements** — derive from outcome; each requirement must trace back to a problem element (no orphan requirements)
4. **Acceptance criteria** — per requirement, testable Given/When/Then criteria
5. **Domain validation** — check against canonical domain model (AGENTS.md terminology, CSL-JSON, matching thresholds): does this contradict how references/sources/matching work?

## Rules
- Requirements without acceptance criteria are not done
- If a requirement contradicts the domain model, escalate instead of bending the domain
- Keep requirements minimal — YAGNI; reject gold-plating not tied to the outcome