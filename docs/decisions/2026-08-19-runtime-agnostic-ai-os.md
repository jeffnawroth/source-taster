# ADR-0006: Runtime-Agnostic AI-OS Canonical Core

> Status: accepted
> Date: 2026-08-19

## Context

The original AI operating model was a 76-section master prompt under
`.opencode/`. It combined runtime-neutral operating principles, Source Taster
project policy, and OpenCode implementation mechanics. This made the core
model difficult to apply in another runtime and made the master prompt, skills,
agents, commands, and project instructions appear to be competing authorities.

Baseline evidence retained before this change:

- the master prompt contains sections 1 through 76 exactly once;
- `node evaluation/ai-system/check-governance.mjs` passed;
- OpenCode 1.18.18 discovered 12 project subagents;
- the existing permissions, models, step caps, MCP root, commands, skills, and
  historical records are preserved by this migration.

## Decision

Create `docs/ai-os/core/` as the sole normative AI-OS source. Preserve the
original section identifiers at their new canonical anchors:

- core principles: 1-11, 75-76;
- core operating model: 12-18, 21-30, 38-40, 64-72;
- core evaluation and evidence: 31-36, 73-74;
- core governance and audit: 19-20, 37, 41-50;
- OpenCode adapter: 51-63.

The generic role contract remains in the core operating model. OpenCode agent
files remain runtime implementations, and project/domain facts remain in
`AGENTS.md` and the domain skill. `.opencode/master-prompt.md` becomes a thin
OpenCode bootstrap and is no longer a second normative copy.

Adapters implement the core but cannot redefine it. They must distinguish
instruction-level policy from technically enforced runtime guarantees. The
GitHub Copilot adapter must not claim technical enforcement that this repository
cannot demonstrate.

## Alternatives

- Keep the master prompt canonical: rejected because it couples the AI-OS to
  OpenCode and leaves no portable authority.
- Create a unified duplicate core document: rejected because it would create a
  second normative source.
- Move runtime boundary principles entirely into adapters: rejected because
  isolation, least privilege, credentials, human oversight, and rollback are
  runtime-neutral requirements even when enforcement differs.

## Consequences

- Existing section references remain meaningful through the canonical section
  map in `docs/ai-os/ARCHITECTURE.md`.
- OpenCode behavior remains unchanged; its configuration and artifacts stay in
  place.
- Governance checks must validate a distributed canonical source graph rather
  than a monolithic master prompt.
- Historical ADRs, audits, plans, and memory retain their original references
  as historical evidence and are not rewritten.
