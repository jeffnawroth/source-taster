# Website-local typography

These are website-local copies, independent of the shared UI assets owned by
#211. Reconcile duplication when integrating that ticket; no font payload enters
the design-token package.

Atkinson source: google/fonts at commit
`5bb28733cec313b63fbd415b574b5ae35c8aa8b8` (retrieved 11 November 2026):

- `ofl/atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext[wght].ttf`

Plex Mono is the **unmodified upstream WOFF2**, not a local format conversion:
IBM/plex at `48e8676114c04f29033b4b53da4ec579f8846297`,
`packages/plex-mono/fonts/complete/woff2/IBMPlexMono-Regular.woff2`.
Its `packages/plex-mono/LICENSE.txt` is byte-identical to the retained Plex OFL
notice (SHA-256 `7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da`).

Both include their upstream SIL Open Font License 1.1 notice alongside the font.
Atkinson retains its variable weight axis, with no Reserved Font Name declared
in its OFL notice. Its WOFF2 conversion preserves the full upstream character
coverage (no subset):
FontTools 4.60.1, Brotli 1.2.1, `TTFont(source); font.flavor = "woff2";
font.save(destination)`. This is an asset preparation step, not a runtime/build
dependency. Fonts are served locally; no external font request is made.

SHA-256 of the delivered fonts:

- AtkinsonHyperlegibleNext.woff2: `f3e29ef3fbad6f5f6afbfab829d9ed7aad8148c545bf421f4fa05bdd15e65789`
- IBMPlexMono-Regular.woff2: `ba204497f16b6d334cee9d1e963a831b73e3a56e1d6300a8489d18df7214b350`
