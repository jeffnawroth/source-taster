# Citation renderer assets

Source Taster uses citeproc-js 2.4.63, copyright 2009–2019 Frank Bennett,
under its **AGPL-3.0-or-later** option. The installed package's LICENSE grants
AGPL version 3 or later; its npm metadata (`AGPL-1.0`) is inaccurate. The CPAL
option is not selected. The renderer remains in the AGPL server, outside the
transport contract and browser bundles (ADR-0011).

The eleven unmodified CSL styles are from the Citation Style Language project,
commit `d2cc4207b65000f5c2bdc0c44d7a26ed18ab6606`:
https://github.com/citation-style-language/styles/tree/d2cc4207b65000f5c2bdc0c44d7a26ed18ab6606

The three unmodified CSL locale files are from commit
`8bef426f89f38c0789223c50e53ec2197bc50bb3`:
https://github.com/citation-style-language/locales/tree/8bef426f89f38c0789223c50e53ec2197bc50bb3

These separately licensed assets are **CC BY-SA 3.0**. Author and contributor
attribution is retained in each style's `<info>` block and the locale files.
License: https://creativecommons.org/licenses/by-sa/3.0/
Legal code: https://creativecommons.org/licenses/by-sa/3.0/legalcode

`manifest.json` records the exact upstream URLs and SHA-256 of every asset.
The server verifies each hash on loading; it never fetches styles or locales
at runtime. A renderer/style/locale change changes the returned renderer
version and needs the measured-configuration qualification of ADR-0011.

For standalone suggestions only, the owned adapter omits CSL citation-number
nodes in memory and disables cross-entry disambiguation and repeated-author substitution.
One batch engine produces independent entries, removing numbering and
cross-entry changes without changing the pinned originals. Full RTF
bibliographies retain style numbering and disambiguation.
