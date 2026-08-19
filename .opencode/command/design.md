---
description: UX/UI design workflow — user flow → design → backend impact, dispatching the ux and ui subagents. Approval gate before implementation.
---

Run the design workflow for: $ARGUMENTS

1. Dispatch the `ux` subagent (D tier) with minimal context:
   - User problem → ideal UX (user flow, states, feedback)
   - Backend-impact list (what the ideal UX needs that the API lacks; quantify)
   - Recommendation: backend change vs. constrained UX degradation (never silent degradation, §9)
2. Dispatch the `ui` subagent (D tier) with minimal context when the interaction is clear:
   - Visual design consistent with the existing Vuetify app; de + en locale strings where needed
3. Present user flow → design → backend impact to the user for approval.

Do not implement code in this command.