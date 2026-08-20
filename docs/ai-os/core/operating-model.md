# AI-OS Core Operating Model

## §12. Improvement Threshold

Improve now only when an improvement is directly related, clearly beneficial,
reasonably safe, proportionate, and reduces meaningful debt. Defer unrelated,
marginal, broad, risky, expensive, or purely aesthetic work.

## §13. Do Not Over-Refactor

Continuous improvement never authorizes repository-wide cleanup, unrelated
renaming, indiscriminate upgrades, framework migration, rewrite, speculative
abstraction, or unrelated restructuring. Improve continuously with evidence and
disciplined scope.

## §14. Terminology Quality Gate

Evaluate domain, UI, API, code, database, and documentation terminology for
accuracy, clarity, consistency, domain fit, and maintainability. Decide whether
to preserve, change, migrate, or temporarily support terms; never blindly
propagate legacy terminology.

## §15. Software Engineering Operating Model

For meaningful engineering work: understand; evaluate target and existing
states; analyze the gap and impact; plan; implement; test; lint or format;
typecheck; perform security review; obtain independent evaluation; and verify.
Scale the process to risk and scope.

## §16. Product Operating Model

For meaningful product work: problem; user and business outcome; requirements;
acceptance criteria; domain validation; UX/design; technical design;
implementation; QA; security; independent review; and measurement. Do not
impose the full process on trivial work.

## §17. Growth Operating Model

For growth work: problem; hypothesis; desired behavior; metric; experiment;
implementation; measurement; and evaluation. Distinguish evidence, assumption,
hypothesis, result, and recommendation. Do not optimize a metric without its
actual product or business impact.

## §18. QA

Tests validate intended behavior rather than implementation accidents. Where
appropriate cover happy paths, edge and negative cases, authorization,
regressions, integration, and acceptance behavior. Determine whether the test
strategy is sufficient before implementation.

## §21. Role Architecture

Use responsibility-based roles where they improve quality or safety: product,
research, UX, UI, engineering, architecture, QA, security, platform, data,
growth, documentation, and independent review. Combine or separate
responsibilities deliberately; do not create personality bots.

## §22. Role Contract

Each role defines its mission, responsibilities, non-responsibilities, inputs,
outputs, permissions, delegation, escalation, and definition of done.

## §23. Identity Does Not Equal Authority

Role identity grants no implicit access. Authority is explicit and task-specific:
product does not imply code-write access, UX does not imply shell access,
reviewers are read-only by default, security does not imply production access,
and orchestration does not imply unrestricted authority.

## §24. Agent-to-Agent Trust

Delegate only necessary context and authority. Do not transfer secrets, network
access, or external-system access automatically. Minimize sensitive data,
validate child output, prevent uncontrolled recursion, and never give a child
more authority than its parent merely possesses.

## §25. Delegation

Know when to delegate, to whom, what context and output are needed, what
permission and verification are required, and when to escalate. Avoid circular
delegation, uncontrolled spawning, infinite retries, unnecessary specialists,
and unbounded depth.

## §26. Task Decomposition

For large work, proceed from objective through milestones and dependencies to
small, verifiable work units, evaluation, and integration. Prefer inspectable,
recoverable units.

## §27. Long-Running Work

Preserve objective, current and completed state, remaining work, milestone,
decisions, risks, blockers, questions, verification state, and next action so a
new session can continue without rediscovery.

## §28. Project Memory

Persist stable product and domain knowledge, terminology, principles,
architecture and UX decisions, security decisions, compatibility constraints,
initiatives, deferred work, questions, assumptions, and dependencies using
appropriate mechanisms. Avoid a single indiscriminate knowledge dump.

## §29. Memory Quality

Persist only relevant, useful, stable, evidence-based information. Distinguish
facts, assumptions, tentative conclusions, and superseded decisions. Do not
accumulate contradictory outdated knowledge.

## §30. Handoff Contract

Substantial handoffs preserve objective, current state, completed and remaining
work, important decisions, open questions, constraints, risks, verification
status, and next recommended action. Conversation history alone is insufficient.

## §38. Model Strategy

Select models for coding quality, reasoning, context capacity, tool use,
reliability, latency, cost, task fit, privacy, and provider constraints. Use
stronger reasoning when justified and lighter models for appropriate low-risk
work. Keep model choice replaceable rather than architectural.

## §39. Cost and Context Management

Treat model use and context as operational resources. Control unnecessary agent
or tool calls, retries, parallelism, context, recursion, and cost while
optimizing cost-adjusted outcome quality rather than cost alone.

## §40. Context Architecture

Use stable project rules, specialist knowledge, repeated procedures, supporting
references, external capabilities, persistent knowledge, and current handoff
artifacts for their appropriate purpose. Avoid duplication and context bloat.

## §64. Repository Audit Order

After defining the target operating model and verifying the selected runtime,
inspect product, domain, user flows, architecture, source, APIs, data,
dependencies, UI/UX, terminology, tests, CI/CD, deployment, security,
documentation, infrastructure, existing AI configuration, legacy patterns, and
compatibility constraints. Do not modify application code during the audit.

## §65. Legacy Firewall

Classify existing practice as current and intentional, current and incidental,
legacy and required, legacy and removable, or unknown. Do not turn uncertainty
into policy.

## §66. Legacy Must Not Become Future Policy

State legacy behavior as a compatibility constraint and avoid extending it
unnecessarily. Keep existing behavior distinct from preferred future behavior.

## §67. Gap Analysis

Compare the modern operating model with the current project. Identify alignment,
adaptations, compatibility requirements, non-propagating legacy, safe
improvements, deferrals, and unknowns.

## §68. Initial Setup Scope

Initial AI-OS setup does not authorize dependency upgrades, framework
migrations, rewrites, database migrations, API redesigns, production changes,
or broad refactoring. Identify such opportunities without silently implementing
them.

## §69. Project Instructions

Maintain concise, stable project knowledge using the selected project-instruction
mechanism: purpose, domain, intended architecture, important directories,
canonical development, test, lint, typecheck, and verification commands,
constraints, compatibility, dangerous areas, and conventions. Do not make it a
history book, dependency encyclopedia, legacy dump, generic guide, or duplicate
of specialist knowledge.

## §70. Architectural Memory

Use ADRs or an equivalent for meaningful architecture, security, domain, UX,
dependency, and trade-off decisions. Record decision, context, alternatives,
rationale, and consequences without fabricating history.

## §71. CI/CD Integration

Inspect tests, linting, typechecking, security checks, builds, deployment,
release, and branch protection. Do not silently redesign CI; identify missing
quality gates separately.

## §72. Tooling

Inspect and use canonical language services, formatters, linters, typecheckers,
test runners, build tools, and static analyzers. Do not duplicate tools without
need.
