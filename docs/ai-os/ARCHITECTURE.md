# AI-OS Architecture

## Purpose

The AI operating model is separated into a runtime-neutral core, Source Taster
project policy, and runtime adapters. This keeps a runtime's configuration
syntax from becoming a product or governance principle, and lets a runtime be
added or dropped without rewriting the philosophy.

## Authority Model

1. `docs/ai-os/core/` is the sole normative source for AI-OS principles.
2. `AGENTS.md` is the sole source for Source Taster project policy,
   terminology, constraints, and operational commitments.
3. A runtime adapter describes how one runtime implements the core. It cannot
   redefine the core.
4. **Runtime configuration is the authoritative evidence of an enforced
   control.** Adapter prose records meaning and evidence status; it never
   replaces the configuration. Where the two disagree, the configuration is
   right and the prose is a bug.
5. Skills, agents, and commands are derived delivery artifacts. They may cite
   canonical sections but do not define competing policy.
6. ADRs, audits, and memory are historical or operational records, not
   normative sources.

## Adapter Contract

An adapter states, for each core requirement it touches:

- the canonical core anchor;
- the implementation mechanism;
- whether it is **runtime-enforced**, **instruction-level**, or **unsupported**;
- the permission, filesystem, network, credential, and delegation boundaries;
- human approval gates, evaluation evidence, and known limitations.

An adapter may strengthen a core requirement with technical enforcement. It must
not weaken, reinterpret, or silently omit one.

## Where things live

| Information class | Authoritative source |
|---|---|
| Mission and target-state philosophy (§1–§11, §75–§76) | `core/principles.md` |
| Quality, roles, delegation, memory, repository integration (§12–§30, §38–§40, §64–§72) | `core/operating-model.md` |
| Impact analysis, independent evaluation, evidence, final validation (§31–§36, §73–§74) | `core/evaluation-and-evidence.md` |
| Security, boundaries, oversight, recovery (§19–§20, §37, §41–§50) | `core/governance-and-audit.md` |
| Source Taster project/domain policy | `AGENTS.md` |
| Detailed domain workflow | `.claude/skills/domain-academic-references/SKILL.md` |
| Per-runtime mechanism and evidence | `runtimes/<runtime>/implementation.md` |
| Enforced Bash boundary (Claude Code) | `.claude/hooks/guard-bash.mjs` + its tests |
| Deterministic governance checks | `evaluation/check-governance.mjs` |
| Behavioral evaluation scenarios | `evaluation/eval-scenarios.md` |
| Architecture decisions | `docs/decisions/` |

Section numbers (`§N`) are stable citation anchors inside the four core
documents. They are *not* an index to maintain separately: this document
deliberately no longer carries a section-by-section map, because a duplicated
table of every heading was pure maintenance cost and the governance checker
policing its shape made ordinary edits expensive. Find a section by searching
the core document for `§N`.

## Skills are shared, not duplicated

Skills live in **one** place: `.claude/skills/`. Claude Code reads it natively;
OpenCode scans `.claude/skills/` natively as well (verified with
`opencode debug skill`). The previous parallel `.opencode/skill/` copy caused a
real defect — OpenCode resolved name collisions arbitrarily, so OpenCode
sessions received a mix of copies, some describing the *other* runtime's
mechanism. Skill bodies therefore stay runtime-neutral about mechanism and
defer to the adapter documents for it.

## Adding a Runtime

Add `runtimes/<name>/implementation.md`. Reference the core anchors it
implements, record evidence for every technical claim, name the requirements it
cannot support, and extend the governance checker only for controls that are
statically verifiable. Do not copy the core into the adapter, and do not create
a parallel skill directory.
