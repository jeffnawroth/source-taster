# OpenCode AI-OS Bootstrap

Use the following sources in authority order:

1. `AGENTS.md` — Source Taster product, domain, terminology, constraints,
   dangerous areas, and human gates.
2. `docs/ai-os/core/` — the runtime-neutral AI Operating System.
3. `docs/ai-os/runtimes/opencode/implementation.md` — OpenCode-specific
   mechanism and evidence status.
4. `.claude/skills/` — shared specialist knowledge. OpenCode scans this
   directory natively; there is deliberately **no** `.opencode/skill/` tree,
   because two trees with the same skill `name:` collide and resolve
   arbitrarily.
5. `.opencode/agent/` and `.opencode/command/` — the read-only review roles and
   the repeatable workflows.

The authority model and adapter contract are in `docs/ai-os/ARCHITECTURE.md`.

This bootstrap is a discovery aid, not a second copy of the AI-OS. Preserve the
governance boundaries, do not self-elevate permissions, and keep every runtime
claim within its documented evidence.
