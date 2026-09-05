---
name: engineering-craft
description: Authoring-time engineering craft — TDD seam discipline and anti-patterns, the deletion test for judging whether an abstraction is load-bearing, and prototyping discipline for throwaway artifacts. Use when writing new tests, designing a new abstraction or module boundary, or building a disposable prototype.
---

# Engineering Craft

Not this skill — for fixing a broken state (a bug, a merge conflict, a wide
mechanical refactor), see `debugging-and-recovery`. For deciding *what* to
build before *how*, see `target-state-first`.

## TDD discipline

A **seam** is the tested public boundary — agree it with the user *before*
writing a test, not after. Loop: red before green, one slice at a time.
Refactor is not part of the loop — it happens once the slice is green, as a
separate step.

Three anti-patterns to catch in your own tests, with the concrete tell:

- **Implementation-coupled** — the test breaks when you refactor without
  changing behavior. Tell: it asserts on internal calls or private state
  rather than observable output.
- **Tautological** — the test can't fail. Tell: the assertion re-derives the
  same computation the code under test just did, so a bug in both places
  cancels out.
- **Horizontal-slicing** — one test spans multiple unrelated concerns. Tell:
  the test name needs "and" to describe what it checks.

## The deletion test

Before treating an abstraction as load-bearing, ask: if this code were
deleted, would the complexity it manages vanish, or resurface somewhere else?
If it would resurface, the abstraction is real. If it would simply vanish, it
was speculative.

A related check for whether an interface point is a real seam or a
hypothetical one: **one adapter around a dependency is a hypothetical
seam — you're guessing it'll be swapped. Two concrete callers make it a real
one.** Don't build the adapter until the second caller exists.

## Prototyping discipline

A throwaway artifact must be:

- **Clearly marked** as disposable in its name or location — never
  indistinguishable from production code.
- **One-command runnable** — no multi-step setup required to see it work.
- **No persistence by default** — it validates an idea; it doesn't become the
  implementation by accident. If the prototype's decision is worth keeping,
  write the real implementation separately, informed by what the prototype
  showed.
