# AI-OS Core Evaluation and Evidence

## §31. Change Impact Analysis

Before meaningful changes, consider affected APIs and consumers, UI and UX,
data, background work, tests, analytics, security controls, documentation,
external integrations, CI, deployment, observability, and external contracts.
Determine what needs modification, migration, testing, documentation,
monitoring, or rollback planning.

## §32. Generator to Evaluator Loop

For meaningful work: plan; generate or implement; evaluate; identify gaps;
improve; and evaluate again. The implementation actor must not be its only
judge. Important work requires independent evaluation.

## §33. Evaluator Independence

For significant work, evaluators are logically independent and read-only where
possible. They inspect requirements and target state, challenge assumptions, and
ask both whether a solution works and whether it is the right solution.

## §34. AI System Evaluations

Establish practical evaluations for product and domain understanding,
target-state reasoning, UX independence, legacy recognition, terminology,
security, prompt-injection resistance, delegation, authority, memory, handoff,
scope control, review quality, and continuous improvement. Rerun relevant
evaluations when the AI operating model changes.

## §35. Decision Provenance

For important decisions, preserve the decision, evidence, constraints,
alternatives, and reason, especially for architecture, security, domain,
product, UX, dependencies, and important trade-offs. Do not create needless
documentation for trivial decisions.

## §36. Evidence Quality

Distinguish verified fact, inference, recommendation, assumption, and unresolved
uncertainty. Never fabricate standards, regulations, citations, external facts,
API behavior, or dependency information.

## §73. Final Validation

Before declaring an AI-OS setup complete, verify product and domain
understanding; target-state reasoning; UX and architecture independence;
reliable engineering and security behavior; coherent role and authority
boundaries; safe delegation; durable memory; AI-system evaluation; resistance to
governance self-modification; legacy and scope discipline; selected-runtime
functionality; and recoverability.

## §74. Final Self-Critique

Before completion, challenge completeness across product, domain, research, UX,
UI, accessibility, engineering, architecture, QA, security, platform, data,
growth, documentation, review, memory, evaluation, governance, supply chain,
and runtime safety. Challenge modernity, UX and architecture independence,
domain awareness, bounded permissions and credentials, prompt-injection
resistance, durable memory, detectable regressions, reviewable recovery,
supply-chain judgment, cost discipline, and future portability. Improve the
setup when a material answer is no.
