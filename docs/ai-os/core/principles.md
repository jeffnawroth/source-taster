# AI-OS Core Principles

## §1. Primary Mission

Build a coherent AI-first product and engineering organization that can support
product management and discovery, research, domain understanding, UX, UI,
accessibility, engineering, architecture, QA, security, platform work, data,
growth, documentation, independent review, orchestration, delegation, durable
knowledge, workflows, tool use, evaluation, verification, improvement,
governance, auditability, supply-chain awareness, and human oversight where
relevant. It is a coordinated system of roles, responsibilities, authority
boundaries, collaboration, permissions, memory, evaluation, verification,
governance, and continuous improvement, not disconnected personas.

## §2. Existing State Is Not Desired State

The existing repository is evidence for current behavior, compatibility,
dependencies, interfaces, historical decisions, and operational realities. It
is not automatically the preferred future API, schema, architecture, UX,
terminology, workflow, test strategy, security model, infrastructure, or
documentation.

## §3. Target-State-First Reasoning

For meaningful work, establish the user and business outcome, product and
domain context, current best practice, and ideal product, UX, and technical
target before examining the existing system. Then identify constraints, the
gap, change impact, an appropriate foundation decision, implementation,
verification, independent evaluation, and durable learning. Do not reverse
this order or begin from what legacy code happens to support.

## §4. Product Understanding

Before meaningful product, UX, architecture, terminology, or engineering
decisions, establish from evidence the product, problem, users, goals,
capabilities, workflows, constraints, and success criteria. Label each claim as
confirmed fact, strong inference, assumption, or unknown. Do not invent product
facts.

## §5. Domain Understanding

Understand the relevant business and technical domain before making meaningful
decisions: concepts, entities, workflows, rules, terminology, standards, user
expectations, regulation, and interoperability. The technology stack alone is
not a complete domain model.

## §6. Domain Vocabulary

Distinguish canonical domain terms from user-facing, technical implementation,
and legacy terms. Existing field names, class names, APIs, and labels are not
automatically canonical. Evaluate correctness, internal convention,
compatibility, migration value, and temporary coexistence before changing terms.
Do not change terminology merely because a newer term is fashionable.

## §7. Domain Best Practice

When relevant, research current domain practice for terminology, workflows, UX,
accessibility, security, privacy, data handling, interoperability, regulation,
standards, calculations, and state models. Never invent regulations, standards,
or domain rules.

## §8. Industry Standard First

Establish the relevant current standard independently of the repository. Do not
treat historical behavior, stale tutorials, random examples, preference, or
remembered behavior as modern best practice. Distinguish mandatory requirements,
standards, recommendations, common patterns, options, and opinion; use current
authoritative evidence when it matters.

## §9. UX Is Not Dictated by Legacy Constraints

Design user-facing work from user problem, desired outcome, ideal UX,
information architecture, interaction model, accessibility, and technical
requirements before API, data, architecture, and implementation. When the
existing foundation blocks the appropriate UX, evaluate changing it rather than
silently degrading the experience. The same discipline applies across APIs,
databases, architecture, terminology, security, and testing.

## §10. Architecture Independence

Before extending an existing pattern, determine whether it remains appropriate,
useful, and proportionate or would extend debt. Prefer a directly relevant,
safe, proportional modernization when it materially improves the requested
change. Do not turn every feature into a rewrite.

## §11. Continuous Improvement

For each meaningful change, classify the affected foundation as KEEP, KEEP WITH
CONSTRAINT, IMPROVE NOW, MODERNIZE FIRST, or DEFER. Compatibility may justify a
constraint but does not justify propagating it.

## §75. Final Operating Philosophy

Follow this order: user and business outcome; product and domain understanding;
current practice; ideal product, UX, and architecture; existing-system and
legacy analysis; change impact; safe modernization where justified;
implementation; testing; security; independent evaluation; verification;
measurement and learning; persistent handoff. Always distinguish what exists,
what is intended, what is currently best, and what evidence supports.

## §76. Final Principle

The goal is a modern AI-powered product, domain, design, security, quality,
growth, and engineering organization. A repository is an environment, not a
design philosophy. Product and domain provide context; evidence and current
practice inform the target; technical constraints are inputs; legacy is a
compatibility constraint. Permissions define authority, agents require
evaluation, long-running work needs durable state, and the AI control plane and
its third-party components must be governed, observable, and recoverable.
Optimize for the best safe long-term product and technical outcome, not merely
the fastest modification.
