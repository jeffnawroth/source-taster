# Website-local typography

These are website-local copies, independent of the shared UI assets owned by
#211. Reconcile duplication when integrating that ticket; no font payload enters
the design-token package.

Source: google/fonts at commit
`5bb28733cec313b63fbd415b574b5ae35c8aa8b8` (retrieved 11 November 2026):

- `ofl/atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext[wght].ttf`
- `ofl/ibmplexmono/IBMPlexMono-Regular.ttf`

Both include their upstream SIL Open Font License 1.1 notice alongside the font.
Atkinson retains its variable weight axis; Plex Mono uses the upstream regular
cut. WOFF2 conversion preserves the full upstream character coverage (no subset):
FontTools 4.60.1, Brotli 1.2.1, `TTFont(source); font.flavor = "woff2";
font.save(destination)`. This is an asset preparation step, not a runtime/build
dependency. Fonts are served locally; no external font request is made.

SHA-256 of the delivered fonts:

- AtkinsonHyperlegibleNext.woff2: `f3e29ef3fbad6f5f6afbfab829d9ed7aad8148c545bf421f4fa05bdd15e65789`
- IBMPlexMono-Regular.woff2: `6867d7f8bcefc881f91b70fc36689e2bcf6186da59562ac595b22f565c3b2636`
