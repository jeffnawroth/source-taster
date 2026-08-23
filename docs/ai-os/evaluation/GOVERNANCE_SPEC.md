# AI Governance Validation Specification

## Static Checks

`check-governance.mjs` verifies the repository structure that can be proven
without an LLM or live runtime interaction:

- canonical core, adapter, bootstrap, and project-policy files exist;
- all 76 preserved section identifiers occur exactly once at their canonical
  CORE or OpenCode-adapter anchors;
- all `§N` references in governance, project, historical, and evaluation
  Markdown resolve to that canonical index;
- CORE contains no configured runtime identifiers or syntax;
- the bootstrap contains no numbered duplicate AI-OS sections;
- agents retain complete contracts, OpenCode control-plane edit protection,
  recursion caps, and API namespace protections;
- all eight skill files are enumerated and participate in reference validation;
- active project instructions and README use `/v1/*` rather than stale `/api/*`;
- adapters declare the difference between runtime-enforced and
  instruction-level controls.

## Runtime and Human Evidence

Static checks cannot prove interactive permission prompts, actual command/skill
discovery, model availability, or behavior after a runtime restart. These require
resolved configuration inspection and interactive runtime verification. The
evaluation scenarios document the evidence method and must not claim that
headless subagent dispatch proves permission enforcement.

## Pass Criteria

Static checks must pass in CI. Runtime-enforced controls require resolved runtime
configuration evidence. Instruction-level controls require explicit documentation
and human review; they must never be reported as technically enforced.
