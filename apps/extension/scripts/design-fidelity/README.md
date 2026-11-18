# Native extension fidelity

This companion gate builds the unpacked Chromium extension with
`e2e/support/build.ts` and opens its toolbar action with
`e2e/support/chromium.ts`. It verifies a real `SIDE_PANEL` context. It never
opens `panel.html` as an ordinary tab or treats web360 as extension evidence.

The caller owns the standalone API, worker fixtures, and preview. Reserve the
browser exclusively before running; do not run alongside the app agent or
another browser suite. The harness itself runs every state sequentially and
starts no servers.

From the repository root, after browser ownership is released:

```sh
pnpm --filter @source-taster/extension fidelity --api http://127.0.0.1:5492 --web http://127.0.0.1:5493
```

The first diagnostic command can select just the empty intake:

```sh
pnpm --filter @source-taster/extension fidelity --only native-intake-light-en
```

Static verification (does not build an extension or launch a browser):

```sh
pnpm --filter @source-taster/extension typecheck
pnpm exec eslint apps/extension/scripts
pnpm --filter @source-taster/extension fidelity --list
node --test apps/extension/scripts/design-fidelity/native-page.test.ts
```

There are 76 states: 19 each in EN/DE and light/dark. They cover intake,
filled input, palette, empty palette query, input focus, command hover/focus,
counted, running, done, detail, menu, export, report, reset, edit list,
detail edit, manual judgment, and menu hover. The intake measurements also
require the native Text/File/Selection segment and Selection control.
Selection capture and file import behavior remain in their existing native
behavior suites; these 76 states compare the accepted design's interaction
matrix, not every possible import or account flow.

The oracle is extracted with `git show` from accepted #194 D,
`f6db1f512255bd404428212ade37abf5ea26f4a3`, using
`variant=D&calm=1&strip=a&still=1&w=360`. No predecessor repository is read.
CDP requests width 360 at the native panel height and scale factor 1. If the
target rejects or ignores metrics, the override is cleared and the oracle
uses the exact observed native width and height. Both initial and observed
dimensions, browser version, and native target identity are recorded.

Shared `measure`, `compareMeasurements`, and `pixelDiff` enforce the same
fixed 1% pixels / 16 channel difference, 1px geometry, and 0.5px computed
length policy as the web harness. Shared data projection aligns source
references with actual API responses. Counted holds the genuine outgoing
Check POST after a real Structuring response; it never supplies a fabricated
result. Running waits for eight completed witnesses and the real held ninth
DOI. Checks owned by the run are cancelled during cleanup.

Source alignment logs input, scroll position, API reference data, standalone
service availability/notice, and available command data. Selection is retained.
The source renderer and its `.v-D` CSS are preserved. Only the simulated review
host is removed and the original font files are embedded locally. There are
no masks, pixel resizes, tolerance overrides, or copied product pages.

Outputs are separate from the public web gate:

- `apps/extension/test-results/design-fidelity/results.json`: viewport,
  preferences, target, API provenance, measured geometry/styles, fixture
  alignment, pixel counts, and per-state failures.
- `<state>.prototype.png`, `<state>.built.png`, `<state>.diff.png`: native-size
  PNGs, with no scaling.
- `index.html`: unscaled source/native/diff comparison for each state.

The report is initialized as incomplete and updated after every state. A
partial `--only` run is always marked partial and never reports overall
acceptance. A driver failure fails its state; missing measurements cannot
pass. Native support and visual fidelity remain unverified until a real run
finishes; static checks are not measured acceptance.
