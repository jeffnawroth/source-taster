---
name: writing-agent-instructions
description: Meta-skill for authoring or editing AGENTS.md, CLAUDE.md, SKILL.md files, or hook/config documentation — context load vs. cognitive load, an information-hierarchy discipline, a pruning test, and a negation-avoidance rule. Use when writing or editing instructions meant to be read by an AI agent, not a human alone.
---

# Writing Agent Instructions

Not this skill — for what the enforced boundaries actually *are* (the hook
mechanism, the permission model), see `boundaries-and-runtime`. This skill
owns how to *write about* them well; that one owns their content.

## Two different budgets

**Context load** (how much text) and **cognitive load** (how hard it is to
apply correctly) are not the same thing, and instructions optimized for one
can be worse on the other. A short instruction that's ambiguous under
pressure costs more than a longer one that's unambiguous. Optimize for
cognitive load first; trim context load only after that's settled.

## Information hierarchy

Three tiers, and each fact belongs in exactly one:

1. **Inline step** — needed to execute the very next action; put it directly
   in the instruction path.
2. **Inline reference** — needed occasionally, short enough to keep inline
   without derailing the main flow (a one-line rule, a threshold).
3. **Disclosed-on-demand reference** — detailed, situational, or long; link
   to it (a file path, a skill name) rather than inlining it. This is why
   this repository's skills point to `docs/ai-os/core/` instead of copying
   its content.

## The no-op pruning test

Before keeping a sentence in an instruction file, ask: if this sentence were
deleted, would the model's actual behavior change, or was it decorative
restating of what the model would already do by default? If deleting it
changes nothing, delete it — it was context cost with no cognitive-load
benefit.

## Negation-avoidance

A prohibition ("never do X") still puts X in the model's attention — it has
to represent X to know what's forbidden. Where there's a positive alternative,
state that directly instead of only the negative ("use `--cached`" rather than
just "don't scan the whole working tree"). Negation is sometimes
unavoidable — a hard boundary genuinely is "never do X" — but prefer the
positive framing whenever one exists.
