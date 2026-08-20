# Runtime-Agnostic AI-OS Acceptance Record

## Scope

This record covers the focused remediation after the final architecture audit.
It does not alter prior ADRs, audit evidence, the CORE, application code, or
the OpenCode permission configuration.

## Authority and Boundary Result

- `docs/ai-os/core/` remains the sole runtime-neutral AI-OS authority.
- `AGENTS.md` now contains Source Taster project and domain knowledge,
  project-specific constraints, commands, canonical sources, and runtime
  adapter entry points. Generic AI-OS governance and OpenCode rollback
  mechanics are absent.
- `docs/ai-os/runtimes/opencode/implementation.md` records OpenCode-specific
  controls and their actual enforcement status; it does not define the CORE.
- The OpenCode adapter confirms that approved-domain restrictions and
  credential handling are not technically enforced by checked-in configuration.
  They remain policy/instruction-level unless a runtime control is added and
  evidenced.

## Effective OpenCode Review

Resolved configuration evidence confirms the checked-in control-plane ask
rules, R-tier `edit`/`bash`/`task`/web denials, D/T inherited control-plane ask
rules, 12 discovered subagents, `subagent_depth: 2`, 150-step caps on the 12
project subagents, `external_directory: deny`, and a workspace-rooted checked-in
filesystem MCP.

The review also confirms the limits of that evidence:

- no checked-in read-deny protects `.env`, `.keystore`, or other sensitive files
  inside the workspace;
- user-level OpenCode configuration can contribute enabled MCP integrations and
  credential-bearing headers outside repository control;
- no checked-in domain allowlist or network sandbox exists;
- permissions are not OS sandboxing;
- headless role-agent dispatch does not provide behavioral permission evidence.

No user-level credential, MCP, or global configuration was changed. The owner
must review user-level integrations and rotate or revoke credentials if they are
unnecessary, overbroad, exposed, or no longer attributable.

## Interactive Verification Status

Static and resolved-configuration evidence is complete for the controls listed
above. The following remain interactive TUI checks after an OpenCode restart:

- ask prompts for `AGENTS.md`, `opencode.json`, and `.opencode/**` edits;
- R-tier denial behavior for edit, shell, delegation, and web tools;
- D/T inherited control-plane ask behavior;
- command and skill discovery, which the installed CLI cannot list directly.

## Section Preservation Matrix

The pre-migration source is `HEAD:.opencode/master-prompt.md`. “Abstracted”
means the original normative meaning is retained as a concise, runtime-neutral
formulation. “Runtime-specific” means the original OpenCode-specific section
was transferred to the OpenCode adapter. No material semantic loss was found in
the focused comparison.

| Section | Current canonical location | Result |
|---|---|---|
| §1 | `core/principles.md#1-primary-mission` | Abstracted |
| §2 | `core/principles.md#2-existing-state-is-not-desired-state` | Preserved |
| §3 | `core/principles.md#3-target-state-first-reasoning` | Abstracted |
| §4 | `core/principles.md#4-product-understanding` | Preserved |
| §5 | `core/principles.md#5-domain-understanding` | Preserved |
| §6 | `core/principles.md#6-domain-vocabulary` | Abstracted |
| §7 | `core/principles.md#7-domain-best-practice` | Preserved |
| §8 | `core/principles.md#8-industry-standard-first` | Abstracted |
| §9 | `core/principles.md#9-ux-is-not-dictated-by-legacy-constraints` | Abstracted |
| §10 | `core/principles.md#10-architecture-independence` | Preserved |
| §11 | `core/principles.md#11-continuous-improvement` | Abstracted |
| §12 | `core/operating-model.md#12-improvement-threshold` | Preserved |
| §13 | `core/operating-model.md#13-do-not-over-refactor` | Abstracted |
| §14 | `core/operating-model.md#14-terminology-quality-gate` | Abstracted |
| §15 | `core/operating-model.md#15-software-engineering-operating-model` | Abstracted |
| §16 | `core/operating-model.md#16-product-operating-model` | Preserved |
| §17 | `core/operating-model.md#17-growth-operating-model` | Preserved |
| §18 | `core/operating-model.md#18-qa` | Abstracted |
| §19 | `core/governance-and-audit.md#19-security` | Abstracted |
| §20 | `core/governance-and-audit.md#20-prompt-injection-and-untrusted-content` | Preserved |
| §21 | `core/operating-model.md#21-role-architecture` | Abstracted |
| §22 | `core/operating-model.md#22-role-contract` | Preserved |
| §23 | `core/operating-model.md#23-identity-does-not-equal-authority` | Preserved |
| §24 | `core/operating-model.md#24-agent-to-agent-trust` | Preserved |
| §25 | `core/operating-model.md#25-delegation` | Abstracted |
| §26 | `core/operating-model.md#26-task-decomposition` | Preserved |
| §27 | `core/operating-model.md#27-long-running-work` | Preserved |
| §28 | `core/operating-model.md#28-project-memory` | Abstracted |
| §29 | `core/operating-model.md#29-memory-quality` | Preserved |
| §30 | `core/operating-model.md#30-handoff-contract` | Preserved |
| §31 | `core/evaluation-and-evidence.md#31-change-impact-analysis` | Preserved |
| §32 | `core/evaluation-and-evidence.md#32-generator-to-evaluator-loop` | Preserved |
| §33 | `core/evaluation-and-evidence.md#33-evaluator-independence` | Preserved |
| §34 | `core/evaluation-and-evidence.md#34-ai-system-evaluations` | Abstracted |
| §35 | `core/evaluation-and-evidence.md#35-decision-provenance` | Preserved |
| §36 | `core/evaluation-and-evidence.md#36-evidence-quality` | Preserved |
| §37 | `core/governance-and-audit.md#37-supply-chain-governance` | Preserved |
| §38 | `core/operating-model.md#38-model-strategy` | Preserved |
| §39 | `core/operating-model.md#39-cost-and-context-management` | Abstracted |
| §40 | `core/operating-model.md#40-context-architecture` | Abstracted |
| §41 | `core/governance-and-audit.md#41-runtime-isolation` | Preserved |
| §42 | `core/governance-and-audit.md#42-filesystem-boundary` | Preserved |
| §43 | `core/governance-and-audit.md#43-network-egress-boundary` | Preserved |
| §44 | `core/governance-and-audit.md#44-credential-boundary` | Preserved |
| §45 | `core/governance-and-audit.md#45-stop-conditions` | Preserved |
| §46 | `core/governance-and-audit.md#46-human-oversight` | Preserved |
| §47 | `core/governance-and-audit.md#47-ai-governance` | Preserved |
| §48 | `core/governance-and-audit.md#48-self-modification-boundary` | Preserved |
| §49 | `core/governance-and-audit.md#49-rollback-and-recovery` | Preserved |
| §50 | `core/governance-and-audit.md#50-git-safety` | Abstracted |
| §51 | `runtimes/opencode/implementation.md#51-current-execution-framework` | Runtime-specific |
| §52 | `runtimes/opencode/implementation.md#52-verify-the-installed-runtime` | Runtime-specific |
| §53 | `runtimes/opencode/implementation.md#53-configuration` | Runtime-specific |
| §54 | `runtimes/opencode/implementation.md#54-agents` | Runtime-specific |
| §55 | `runtimes/opencode/implementation.md#55-permissions` | Runtime-specific |
| §56 | `runtimes/opencode/implementation.md#56-skills` | Runtime-specific |
| §57 | `runtimes/opencode/implementation.md#57-commands` | Runtime-specific |
| §58 | `runtimes/opencode/implementation.md#58-tool-integrations` | Runtime-specific |
| §59 | `runtimes/opencode/implementation.md#59-model-strategy` | Runtime-specific |
| §60 | `runtimes/opencode/implementation.md#60-context-management` | Runtime-specific |
| §61 | `runtimes/opencode/implementation.md#61-memory-and-handoffs` | Runtime-specific |
| §62 | `runtimes/opencode/implementation.md#62-validation` | Runtime-specific |
| §63 | `runtimes/opencode/implementation.md#63-future-proofing` | Runtime-specific |
| §64 | `core/operating-model.md#64-repository-audit-order` | Abstracted |
| §65 | `core/operating-model.md#65-legacy-firewall` | Preserved |
| §66 | `core/operating-model.md#66-legacy-must-not-become-future-policy` | Preserved |
| §67 | `core/operating-model.md#67-gap-analysis` | Preserved |
| §68 | `core/operating-model.md#68-initial-setup-scope` | Preserved |
| §69 | `core/operating-model.md#69-project-instructions` | Abstracted |
| §70 | `core/operating-model.md#70-architectural-memory` | Preserved |
| §71 | `core/operating-model.md#71-cicd-integration` | Preserved |
| §72 | `core/operating-model.md#72-tooling` | Preserved |
| §73 | `core/evaluation-and-evidence.md#73-final-validation` | Abstracted |
| §74 | `core/evaluation-and-evidence.md#74-final-self-critique` | Abstracted |
| §75 | `core/principles.md#75-final-operating-philosophy` | Preserved |
| §76 | `core/principles.md#76-final-principle` | Abstracted |

## Acceptance Result

PASS WITH FINDINGS. The canonical architecture and focused remediation are
accepted. The outstanding items are user-owned credential/MCP review and the
interactive OpenCode TUI verification listed above; they are not represented as
technical enforcement in this repository.
