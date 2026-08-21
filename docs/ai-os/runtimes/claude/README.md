# Claude Code AI-OS Adapter

This adapter applies the AI-OS CORE to Claude Code in this repository. The
normative rules are in `../../core/`; this directory does not redefine them —
it records how Claude Code implements the CORE and which controls are
technically enforced versus instruction-level. `AGENTS.md` remains the sole
source of Source Taster project/domain policy; this adapter implements it for
Claude Code sessions rather than restating it.

Claude Code 2.1.237–2.1.238 is the version range this adapter was evidenced
against (see `implementation.md`). As of Phase 7, the adapter is
**implemented**: `.claude/settings.json`, the `reviewer`/`security-reviewer`
subagents, and the ported skills described in `implementation.md` all exist
in this repository, verified per-capability in that document. Phase 8
(runtime acceptance tests) and Phase 9 (final review/commit) remain
pending; `implementation.md` states the current, per-capability
implementation status explicitly for every control it covers — this
README does not restate it.
