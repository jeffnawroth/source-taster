# @source-taster/ui

Owned, open-product UI. License: AGPL-3.0-or-later; upstream adaptation and exact
source provenance: [NOTICE.md](NOTICE.md). ADR-0027 permits sharing only the
value-only design-token package with private programs, never these components.

## Styled primitives

```tsx
import { Button, TextField, Form } from "@source-taster/ui/primitives";

<Form onSubmit={save}>
  <TextField
    label="Document title"
    name="title"
    isRequired
    requiredLabel="required"
  />
  <Button type="submit" variant="primary">
    Save
  </Button>
</Form>;
```

Import in the consuming Tailwind CSS 4 stylesheet, in this order:

```css
@import "tailwindcss";
@import "@source-taster/design-tokens/theme.css";
@import "@source-taster/ui/primitives.css";
```

The last import registers the RAC state-variant plugin, scans the owned recipe
and primitive sources and supplies behavior/fallback CSS. Font loading belongs
to each surface; this package includes no font files. Both appearances come
from the token roles, with System default and explicit `data-theme` overrides.
The examples' query parameter is test-local and writes no preference storage.

The pre-existing root and domain entries retain their current API for #211/#212.
This slice adds the complete primitive foundation without migrating product
views or changing services, consent, billing or authorization. New compositions
use `/primitives`; migrating the existing root's unstyled re-exports belongs with
those consumers, so existing compositional TextField imports are not broken.

Available families:

- Actions: Button, IconButton, ToggleButton, Link, FileTrigger.
- Fields: Form, Label, Description, FieldError, Input, TextField, TextArea,
  SearchField, Select, ComboBox, ListBoxItem, DropZone.
- Selection: Checkbox/CheckboxGroup, Radio/RadioGroup, Switch,
  SegmentedControl, Tag/TagGroup.
- Overlays: Modal, Dialog, DialogContent/Heading, AlertDialog, Sheet, Popover,
  MenuTrigger, DialogTrigger, Tooltip/TooltipTrigger, Toast/ToastRegion.
- Navigation/table: Menu/Item/Section, Disclosure/Trigger/Panel/Group,
  Tabs/List/Tab/Panel, Toolbar, Table/Header/Body/Column/Row/Cell/ColumnResizer.
- Display: Badge, Banner, Kbd, ProgressBar, Meter, Spinner, Skeleton, Separator.

Button defaults to secondary. Reserve one primary per view; danger belongs inside
confirmation. `isPending` preserves the label and reserved spinner slot, exposes
`aria-busy` and blocks duplicate activation through RAC. `isDisabled` requires an
adjacent `disabledReason` on actions and fields. Group/collection disabled state
must have a visible Description or adjacent reason; do not hide the only reason
in a tooltip. All supplied copy is localized by the caller, including required,
clear, close, remove and external-new-tab labels. Rich ListBoxItem children need
an explicit `textValue`. IconButton requires `label` and supplies its matching
Tooltip. A Link with `target="_blank"` requires `newTabLabel`.

TextField supports `multiline`; standalone Input/TextArea are compositional
building blocks and must remain inside a labelled RAC field. Native validation
is revealed after blur/submit. Long labels, descriptions and errors wrap.
ComboBox uses substring filtering with case/diacritic-insensitive comparison;
use `defaultItems` for built-in filtering (controlled `items` means the caller
supplies its filtered collection, following RAC). SegmentedControl measures its
translated labels and switches to Select when they cannot fit; `compact` can
force that layout. The selected key survives the switch.

Wrap modal dialogs in DialogTrigger + Modal (or Sheet); DialogContent supplies a
named close control. AlertDialog always starts on the safe action and keeps the
danger action last. Popover is non-modal. Nested selects/menus retain their own
Esc handling; focused icon tooltips cannot consume a modal's close command.
Tables wrap cell contents in a bounded, visibly bordered horizontal scroll
container; compose a selection Checkbox column with `slot="selection"` when
needed, and use `numeric` on numeric Cells. Surfaces own a stacked comparison
layout if preferred below 560px.

GlassSurface accepts only topbar, summary-strip, detail-header or command-palette
layers. Toast owns its glass directly; `Modal material="command-palette"` puts
the glass-overlay directly above the scrim. Ordinary popovers, dialogs and
working surfaces stay opaque. Both materials fall back to surface without blur,
under reduced transparency or forced colors. Reduced motion skips translations
and transitions; Spinner uses opacity, Skeleton stays still.

Spinner is for running checks/re-checks or pending buttons; Skeleton is only for
Structuring and is aria-hidden inside one labelled busy/status container.
ProgressBar is determinate; unknown progress uses Spinner. Kbd's explicit
`modifier="apple" | "other"` keeps server/static output deterministic; the surface
chooses the appropriate platform label.

## React-free static recipes

```astro
---
import { buttonRecipe, linkRecipe, badgeRecipe, bannerRecipe, kbdRecipe }
  from "@source-taster/ui/recipes";
---
<a href="/docs/" class={buttonRecipe({ variant: "secondary" })}>Documentation</a>
```

These five pure tailwind-variants recipes return class strings. Their entry point
imports no React, RAC, icons, component barrel, hydration or client directive.
Use semantic HTML, accessible names and appropriate status/alert roles in static
templates. Variant classes are scanned by `primitives.css`. Merge consumer class
overrides with tailwind-merge as the React wrappers do. This is an open website
entry, not a private-component sharing contract.

## Toast upgrade contract

Create one `createToastQueue()` controller per application root and render one
`ToastRegion` with localized region/close labels. `controller.add` accepts title,
optional description/tone and at most one action. Actions have no timeout;
other messages expire after five seconds, paused on hover/focus. Three are shown;
older messages remain queued. F6 enters the region and returns to the prior
connected focus target. No module-global queue leaks between roots or SSR requests.

Only `src/primitives/toast.tsx` imports `UNSTABLE_Toast` and
`UNSTABLE_ToastRegion`; no other unstable RAC export is admitted. The stable
react-stately queue has the same exact version RAC already requires. The wrapper
owns status/alert content so it does not import unstable ToastContent. On **every
RAC upgrade**, run the static contract and browser suites, including keyboard,
focus, live-region, queue/timer and action persistence. The contract deliberately
fails when stable Toast/ToastRegion exports appear: replace the two aliases with
stable exports, remove the shim/exit assertion, and rerun those checks. Do not
widen the exception to make an upgrade pass.

## Reproduce evidence

```sh
pnpm --filter @source-taster/ui examples
# http://127.0.0.1:5199/?lang=de&theme=dark (en/de × light/dark)
pnpm --filter @source-taster/ui build:examples
pnpm --filter @source-taster/ui test
pnpm --filter @source-taster/ui exec playwright install chromium firefox webkit
pnpm --filter @source-taster/ui test:e2e
```

Examples import actual exported primitives and only synthetic public content;
there is no service, production route, prototype runtime or private fixture.
The static test rejects client dependencies at module resolution and inspects
the bundled recipe graph. Browser checks cover interaction/state/focus, axe,
320px reflow and doubled CSS layout, reduced settings/forced colors and actual
painted text/boundary contrast. These are implementation evidence, not human
screen-reader, real Safari, native platform or release certification.
