# AI-OS Architecture

## Purpose

The AI Operating System is separated into a runtime-neutral core, Source Taster
project policy, and runtime adapters. This prevents a runtime's configuration
syntax from becoming a product or governance principle.

## Authority Model

1. `docs/ai-os/core/` is the sole normative source for AI-OS principles.
2. `AGENTS.md` is the sole source for Source Taster project policy,
   terminology, constraints, and operational commitments.
3. A runtime adapter describes how one runtime implements the core. It cannot
   redefine the core.
4. Runtime configuration is the authoritative evidence of a runtime-enforced
   control. Adapter prose records its meaning and evidence status; it does not
   replace the configuration.
5. Skills, agents, and commands are derived delivery artifacts. They may link
   to canonical sections but do not define competing policy.
6. ADRs, audits, plans, and memory are historical or operational records, not
   normative sources.

## Adapter Contract

Every adapter must state, for each relevant core requirement:

- the canonical core anchor;
- the implementation mechanism;
- whether it is runtime-enforced, instruction-level, or unsupported;
- permission, delegation, isolation, filesystem, network, credential, and
  tool-integration boundaries;
- human approval gates, evaluation evidence, observability, and recovery;
- known limitations and compensating process controls.

An adapter may strengthen a core requirement with technical enforcement. It
must not weaken, reinterpret, or silently omit it.

## Canonical Section Map

This map preserves the original 76 section identifiers without duplicating the
normative content. `CORE` entries are runtime-neutral; `OPENCODE` entries are
the OpenCode adapter.

| Section | Canonical anchor | Category |
|---|---|---|
| §1 Primary Mission | `core/principles.md#1-primary-mission` | CORE |
| §2 Absolute Principle | `core/principles.md#2-existing-state-is-not-desired-state` | CORE |
| §3 Target-State-First Reasoning | `core/principles.md#3-target-state-first-reasoning` | CORE |
| §4 Product Understanding | `core/principles.md#4-product-understanding` | CORE |
| §5 Domain Understanding | `core/principles.md#5-domain-understanding` | CORE |
| §6 Domain Vocabulary | `core/principles.md#6-domain-vocabulary` | CORE |
| §7 Domain Best Practice | `core/principles.md#7-domain-best-practice` | CORE |
| §8 Industry Standard First | `core/principles.md#8-industry-standard-first` | CORE |
| §9 UX Is Not Dictated by Legacy Constraints | `core/principles.md#9-ux-is-not-dictated-by-legacy-constraints` | CORE |
| §10 Architecture Independence | `core/principles.md#10-architecture-independence` | CORE |
| §11 Continuous Improvement | `core/principles.md#11-continuous-improvement` | CORE |
| §12 Improvement Threshold | `core/operating-model.md#12-improvement-threshold` | CORE |
| §13 Do Not Over-Refactor | `core/operating-model.md#13-do-not-over-refactor` | CORE |
| §14 Terminology Quality Gate | `core/operating-model.md#14-terminology-quality-gate` | CORE |
| §15 Software Engineering Operating Model | `core/operating-model.md#15-software-engineering-operating-model` | CORE |
| §16 Product Operating Model | `core/operating-model.md#16-product-operating-model` | CORE |
| §17 Growth Operating Model | `core/operating-model.md#17-growth-operating-model` | CORE |
| §18 QA | `core/operating-model.md#18-qa` | CORE |
| §19 Security | `core/governance-and-audit.md#19-security` | CORE |
| §20 Prompt Injection and Untrusted Content | `core/governance-and-audit.md#20-prompt-injection-and-untrusted-content` | CORE |
| §21 Role Architecture | `core/operating-model.md#21-role-architecture` | CORE |
| §22 Role Contract | `core/operating-model.md#22-role-contract` | CORE |
| §23 Identity Does Not Equal Authority | `core/operating-model.md#23-identity-does-not-equal-authority` | CORE |
| §24 Agent-to-Agent Trust | `core/operating-model.md#24-agent-to-agent-trust` | CORE |
| §25 Delegation | `core/operating-model.md#25-delegation` | CORE |
| §26 Task Decomposition | `core/operating-model.md#26-task-decomposition` | CORE |
| §27 Long-Running Work | `core/operating-model.md#27-long-running-work` | CORE |
| §28 Project Memory | `core/operating-model.md#28-project-memory` | CORE |
| §29 Memory Quality | `core/operating-model.md#29-memory-quality` | CORE |
| §30 Handoff Contract | `core/operating-model.md#30-handoff-contract` | CORE |
| §31 Change Impact Analysis | `core/evaluation-and-evidence.md#31-change-impact-analysis` | EVALUATION |
| §32 Generator to Evaluator Loop | `core/evaluation-and-evidence.md#32-generator-to-evaluator-loop` | EVALUATION |
| §33 Evaluator Independence | `core/evaluation-and-evidence.md#33-evaluator-independence` | EVALUATION |
| §34 AI System Evaluations | `core/evaluation-and-evidence.md#34-ai-system-evaluations` | EVALUATION |
| §35 Decision Provenance | `core/evaluation-and-evidence.md#35-decision-provenance` | EVALUATION |
| §36 Evidence Quality | `core/evaluation-and-evidence.md#36-evidence-quality` | EVALUATION |
| §37 Supply-Chain Governance | `core/governance-and-audit.md#37-supply-chain-governance` | CORE |
| §38 Model Strategy | `core/operating-model.md#38-model-strategy` | CORE |
| §39 Cost and Context Management | `core/operating-model.md#39-cost-and-context-management` | CORE |
| §40 Context Architecture | `core/operating-model.md#40-context-architecture` | CORE |
| §41 Runtime Isolation | `core/governance-and-audit.md#41-runtime-isolation` | CORE |
| §42 Filesystem Boundary | `core/governance-and-audit.md#42-filesystem-boundary` | CORE |
| §43 Network Egress Boundary | `core/governance-and-audit.md#43-network-egress-boundary` | CORE |
| §44 Credential Boundary | `core/governance-and-audit.md#44-credential-boundary` | CORE |
| §45 Stop Conditions | `core/governance-and-audit.md#45-stop-conditions` | CORE |
| §46 Human Oversight | `core/governance-and-audit.md#46-human-oversight` | CORE |
| §47 AI Governance | `core/governance-and-audit.md#47-ai-governance` | CORE |
| §48 Self-Modification Boundary | `core/governance-and-audit.md#48-self-modification-boundary` | CORE |
| §49 Rollback and Recovery | `core/governance-and-audit.md#49-rollback-and-recovery` | CORE |
| §50 Git Safety | `core/governance-and-audit.md#50-git-safety` | CORE |
| §51 Current Execution Framework | `runtimes/opencode/implementation.md#51-current-execution-framework` | OPENCODE |
| §52 Verify the Installed Runtime | `runtimes/opencode/implementation.md#52-verify-the-installed-runtime` | OPENCODE |
| §53 Configuration | `runtimes/opencode/implementation.md#53-configuration` | OPENCODE |
| §54 Agents | `runtimes/opencode/implementation.md#54-agents` | OPENCODE |
| §55 Permissions | `runtimes/opencode/implementation.md#55-permissions` | OPENCODE |
| §56 Skills | `runtimes/opencode/implementation.md#56-skills` | OPENCODE |
| §57 Commands | `runtimes/opencode/implementation.md#57-commands` | OPENCODE |
| §58 Tool Integrations | `runtimes/opencode/implementation.md#58-tool-integrations` | OPENCODE |
| §59 Model Strategy | `runtimes/opencode/implementation.md#59-model-strategy` | OPENCODE |
| §60 Context Management | `runtimes/opencode/implementation.md#60-context-management` | OPENCODE |
| §61 Memory and Handoffs | `runtimes/opencode/implementation.md#61-memory-and-handoffs` | OPENCODE |
| §62 Validation | `runtimes/opencode/implementation.md#62-validation` | OPENCODE |
| §63 Future-Proofing | `runtimes/opencode/implementation.md#63-future-proofing` | OPENCODE |
| §64 Repository Audit Order | `core/operating-model.md#64-repository-audit-order` | CORE |
| §65 Legacy Firewall | `core/operating-model.md#65-legacy-firewall` | CORE |
| §66 Legacy Must Not Become Future Policy | `core/operating-model.md#66-legacy-must-not-become-future-policy` | CORE |
| §67 Gap Analysis | `core/operating-model.md#67-gap-analysis` | CORE |
| §68 Initial Setup Scope | `core/operating-model.md#68-initial-setup-scope` | CORE |
| §69 Project Instructions | `core/operating-model.md#69-project-instructions` | CORE |
| §70 Architectural Memory | `core/operating-model.md#70-architectural-memory` | CORE |
| §71 CI/CD Integration | `core/operating-model.md#71-cicd-integration` | CORE |
| §72 Tooling | `core/operating-model.md#72-tooling` | CORE |
| §73 Final Validation | `core/evaluation-and-evidence.md#73-final-validation` | EVALUATION |
| §74 Final Self-Critique | `core/evaluation-and-evidence.md#74-final-self-critique` | EVALUATION |
| §75 Final Operating Philosophy | `core/principles.md#75-final-operating-philosophy` | CORE |
| §76 Final Principle | `core/principles.md#76-final-principle` | CORE |

## Source Boundaries

| Information class | Authoritative source |
|---|---|
| AI-OS principles | `core/principles.md` |
| Operating model and role contract | `core/operating-model.md` |
| Evaluation and evidence method | `core/evaluation-and-evidence.md` |
| Governance and boundary principles | `core/governance-and-audit.md` |
| Source Taster project/domain policy | `AGENTS.md` |
| Detailed domain workflow | `.opencode/skill/domain-academic-references/SKILL.md` |
| OpenCode implementation | `runtimes/opencode/implementation.md` |
| Copilot implementation status | `runtimes/copilot/implementation.md` |
| Static checks | `evaluation/ai-system/check-governance.mjs` |
| LLM evaluation scenarios | `evaluation/ai-system/eval-scenarios.md` |
| Live state | `.opencode/memory/handoff.md` |
| ADRs and audit evidence | `docs/decisions/` and `docs/audits/` |

## Adding a Runtime

Create a runtime directory with a concise README and implementation document.
Reference the core anchors it implements, record evidence for every technical
claim, identify unsupported requirements, and extend the governance checker
only for controls that are statically verifiable. Do not copy the core into the
adapter.
