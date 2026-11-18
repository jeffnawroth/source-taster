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

## Accepted prototype typography (17 November 2026)

The website uses the unmodified static Regular and Bold TTFs embedded by the accepted #198 prototype. They come from `googlefonts/atkinson-hyperlegible-next` at `7925f50f649b3813257faf2f4c0b381011f434f1`, paths `fonts/ttf/AtkinsonHyperlegibleNext-Regular.ttf` and `fonts/ttf/AtkinsonHyperlegibleNext-Bold.ttf`. The variable Google Fonts distribution above has different metrics and is retained only as historical provenance; it is no longer referenced by website CSS. The upstream OFL notice remains alongside the fonts.

- Regular: SHA-256 `88ed5c31a71584c7772963b02d04bef1eb7e3d2e9c8b9cb204339b1f82cf432c`
- Bold: SHA-256 `994414047df66bb4998d01c1cb1eeb4a2ddc4622d1aa56bbb8adbeca7645b041`
