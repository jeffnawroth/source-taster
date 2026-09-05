---
name: frontend-design
description: Ideation for a new UI surface — brainstorm, plan, and critique against generic AI-default visual choices before building. Scoped to Vue3/Vuetify (extension, web app) and Astro (landing page). Use when designing a genuinely new surface, not when auditing or fixing an existing one.
---

# Frontend Design (Ideation)

Not this skill — for auditing or fixing an *existing* surface, see the
user-level `improve-ui`, `baseline-ui`, and `fixing-accessibility` skills. For
extracting real design tokens from a live site, see `create-design-md`. This
skill is for *new* surfaces only, before anything exists to audit.

## Required first step: anchor to a real identity

`apps/landing/DESIGN.md` exists (created 2026-08-27 via `create-design-md`
in repository mode against `src/styles/global.css`'s real custom-property
system, validated with 0 lint errors and a passing `dtcg` export). The
extension and web app (Vuetify-based) have no `DESIGN.md` yet. Before
applying this skill to any surface, check whether one exists for that
specific surface. If it doesn't, **run `create-design-md` first** —
critiquing against "genericness" is meaningless without a real visual
identity to be generic *relative to*. Do not invent brand values, colors, or
tone to fill the gap; that's exactly the failure mode this skill exists to
avoid (see "What this skill is not," below).

## Workflow

1. **Brainstorm** — before writing any code, generate a few genuinely
   different directions for the surface. Don't converge on the first idea.
2. **Plan** — for the direction you pick, name specifics: actual colors (not
   "a blue accent" — a hex value, or which token from the surface's
   `DESIGN.md`), actual typefaces, a rough layout sketch (even ASCII-level is
   enough to critique against).
3. **Critique for genericness** — before building, check the plan against the
   three visual defaults that AI-generated interfaces converge on when no
   real identity anchors the choice:
   - cream background + serif headings + terracotta/burnt-orange accent
   - near-black background + a single neon accent color
   - broadsheet-style hairline rules + extreme minimalism as a substitute for
     actual design decisions
   If the plan matches one of these by default rather than by a deliberate
   choice grounded in the surface's `DESIGN.md`, revise it.
4. **Build.**
5. **Critique again** — the same three-pattern check, now against the built
   result, since implementation often drifts back toward the defaults even
   when the plan didn't have them.

## What this skill is not

This is ideation, not extraction and not audit. It does not replace the
evidence discipline in `create-design-md` (which forbids inventing tokens
without observed evidence) — it consumes that discipline's output as its
starting anchor, it doesn't substitute for it.
