---
description: Run the canonical quality gates (lint, typecheck, test) and report results.
---

Run all repository quality gates and report each result:
1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`

Report pass/fail per gate. If a gate fails, summarize the failure clearly. Do not fix anything unless the user explicitly asks. $ARGUMENTS