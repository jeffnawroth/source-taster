---
name: ux-target-state
description: UX independence — user problem → ideal UX → API/backend adaptation instead of UX degradation. Use when designing user flows or when the backend constrains the UX.
---

# UX Target-State

## Core rule (§9)
The UX must be designed from the user problem, not from what the backend happens to support. If the backend forces a worse UX, the recommendation is a backend change — not UX degradation.

## Workflow
1. **User problem** — what is the user trying to do? (context: academic verification workflows)
2. **Ideal UX** — design the flow as if the API were perfect (user flow, states, feedback)
3. **Backend impact** — list what the ideal UX requires that the API does not provide; quantify (endpoint, payload, latency)
4. **Recommendation** — recommend the backend change explicitly; degrade UX only with a documented constraint reason (never silently)

## Deliverable
User flow → design → backend-impact list → recommendation. Hand off to `ui` for visual design when interaction is clear.