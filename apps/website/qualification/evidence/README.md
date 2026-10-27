# Qualification evidence

`historical/cb04e23/` preserves the earlier macOS and Linux evidence byte-for-byte.
It belongs to the earlier recipe, including the then-closed native license gate.
It is historical evidence, not a passing receipt for subsequent changes.

`macos-arm64/` contains the consolidated implementation's current evidence.
Its `evidence-index.json` identifies the exact recipe, implementation commit and
retained file hashes.

Current evidence is regenerated from the consolidated implementation's actual
fetch/build/verify, website delivery, offline advisory/license scans and controls.
Each target requires its own current receipt. Linux results from older runs do
not qualify the consolidated recipe; the handoff records its new CI run as
pending until that run completes. No human legal/publication approval is supplied.
