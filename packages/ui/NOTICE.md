# UI ownership and upstream provenance

Original Source Taster UI components, behavior, examples and recipes retain
**AGPL-3.0-or-later**. They are outside the design-token dual-license exception.
Private programs implement their own components and never import this package.
The six Verdict glyphs are project-owned UI artwork under the UI licence.
Local font assets have their separate complete OFL-1.1 notices and pinned
provenance in [public/fonts](public/fonts/README.md). Web/extension builds carry
these notices. No logo or wordmark artwork is distributed here.

The primitive anatomy, RAC composition, render-prop/class merge pattern and
Tailwind variant approach are adapted from Adobe's official
[React Aria Tailwind starter](https://github.com/adobe/react-spectrum/tree/d1b6f73fe1841c6ff160926018f751650a19efa9/starters/tailwind/src),
snapshot **d1b6f73fe1841c6ff160926018f751650a19efa9** (retrieved 10 November 2026).
Copyright Adobe. All rights reserved. The upstream Apache-2.0 license is retained
in [notices/react-spectrum-LICENSE](notices/react-spectrum-LICENSE).

Adapted source families: Button, ToggleButton, Link, Field, TextField,
SearchField, Select, ComboBox, Checkbox/Group, RadioGroup, Switch,
ToggleButtonGroup, DropZone, Popover, Tooltip, Modal, Dialog, AlertDialog,
Sheet, Menu, Disclosure/Group, Tabs, Table, TagGroup, ProgressBar, Meter,
Separator, Toast and utils. The starter is a source foundation, not a dependency.

Changes: semantic token roles replace every palette/dark class; shared static
recipes; wrapped long labels and visible availability reasons; stable loading
width; safe destructive focus; bounded glass; CSS-native motion and accessibility
fallbacks. The starter's destructive autofocus was changed to the safe action.
Its Toast example's extra unstable queue/content exports and view-transition
code were omitted. Only the two ADR-0027 exports are imported by our shim; the
stable `react-stately/useToastState` queue is used directly.

Exact helper inventory: tailwind-variants 4.0.1 (MIT), tailwind-merge 3.7.0 (MIT),
tailwindcss-react-aria-components 2.2.0 (Apache-2.0, CSS build plugin),
lucide-react 1.66.0 (ISC and Feather-derived MIT), react-aria-components 1.22.1 and react-stately 3.51.0
(Apache-2.0). The repository dependency/license gates include their locked graphs.
Retain their applicable upstream notices in distribution. Test-only pngjs 7.0.0
(MIT), Playwright and axe do not enter the primitive or static-recipe runtime.

The complete, unmodified Lucide 1.66.0 license, including its Feather icon list
and Cole Bemis's MIT permission, is retained in
[notices/lucide-LICENSE](notices/lucide-LICENSE). It was copied from the exact
installed publisher package on 11 November 2026, SHA-256
`b495047bd93a9b06913511076f504daba17d5bbeb3e0650f3bb53a4220329c57`.
The ISC-only shorthand does not replace the MIT notice for Feather-derived icons.
Actual browser/extension distributions must retain both applicable grants;
retaining this source copy alone is not a release-notice qualification.

Design acceptance does not complete #207 or the release rights review. Nothing
here grants private component reuse, brand-distribution approval or font rights.
