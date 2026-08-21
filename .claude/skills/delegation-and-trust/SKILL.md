---
name: delegation-and-trust
description: Delegation and trust — agent-to-agent delegation rules, task decomposition, long-running work, and the plan template with task decomposition. Use when dispatching subagents, writing plans, or splitting work into verifiable units.
---

# Delegation & Trust

Canonical method: `docs/ai-os/core/operating-model.md`.

## Delegation rules (§24/§25)
- Delegate with **minimal context** — the task description, the deliverable, verification requirements; never full session dumps
- Subagents receive only the context they need; sensitive data (secrets) is never passed to subagents
- No privilege escalation: subagents inherit stricter, never looser, permissions; nobody may grant themselves permissions
- Subagent output is validated by the orchestrator (§24); the `reviewer`/`security-reviewer` subagents never write — `disallowedTools` removes `Edit`/`Write`/`NotebookEdit`/`Bash`/`Agent`/`WebFetch`/`WebSearch` structurally, not via a role label

## Task decomposition (§26)
Plans and `/plan` output follow the six-stage template:
1. **Objective** — one sentence: what is being built and why
2. **Milestones** — coarse checkpoints (phase boundaries)
3. **Dependencies** — interfaces between tasks (what consumes what)
4. **Verifiable work units** — tasks with explicit verification steps (test/typecheck/grep)
5. **Evaluation** — how the result is evaluated (evals, review gate)
6. **Integration** — merge strategy, rollback path

## Long-running work (§27)
- Claude subagents may individually request `isolation: worktree` (a documented Claude Code mechanism) for isolated execution; no subagent in this repository currently sets it
- Checkpoints: commit per completed unit; report progress at checkpoints
- On interruption: handoff file captures objective/state/next-action so a fresh session can continue
