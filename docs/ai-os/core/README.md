# AI-OS Core

This directory is the portable, runtime-neutral AI Operating System. It does
not depend on a particular AI product, configuration format, agent syntax, or
model provider.

Read the documents by concern:

- `principles.md` establishes the mission and target-state philosophy.
- `operating-model.md` defines quality, roles, coordination, memory, and
  repository-integration practices.
- `evaluation-and-evidence.md` defines impact analysis, independent evaluation,
  evidence, and final validation.
- `governance-and-audit.md` defines security, boundaries, oversight,
  recoverability, and control-plane governance.

The canonical section map is in `../ARCHITECTURE.md`. Runtime adapters implement
these requirements and must state what they can enforce technically.
