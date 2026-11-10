# Components

This is the component spec decided in "Which components does the design system define, and how do they behave and look?" ([#195](https://github.com/jeffnawroth/source-taster/issues/195)), part of the map "Wayfinder: Brand and design system for Source Taster" ([#181](https://github.com/jeffnawroth/source-taster/issues/181)). This consolidated edition is part of the ADR-0027 review packet. Original source commits and accepted amendments are recorded in [sources.md](sources.md); the [styleguide](styleguide.md) resolves later surface choices.

**Sources:**
- The tokens: [`tokens.md`](tokens.md), from "Which design tokens does the design system define?" ([#193](https://github.com/jeffnawroth/source-taster/issues/193)). Its current form includes #195 and the explicit #206 reconciliation; historical source amendments are pinned in sources.md.
- The identity "Glass" from "Which visual identity direction does Source Taster take?" ([#191](https://github.com/jeffnawroth/source-taster/issues/191)), with the calm colour rule: no gradients, no colour fields, colour only where it carries meaning.
- The structure from "How are the web app and side panel structured?" ([#194](https://github.com/jeffnawroth/source-taster/issues/194)): branch `prototype/194-structure`, variant D. This ticket added the compact 360 px strip to that prototype (commit f6db1f5, dev bar row "Strip 360 (#195)").
- The voice from "How does Source Taster sound?" ([#192](https://github.com/jeffnawroth/source-taster/issues/192)): `docs/design/voice-and-tone.md` on `design/192-voice`. Labels and strings come from there; this spec quotes them only as examples.
- The foundation from [#188](https://github.com/jeffnawroth/source-taster/issues/188) and ADR-0002: React Aria Components (RAC) 1.x and Tailwind CSS 4.
- The UI baseline from [#187](https://github.com/jeffnawroth/source-taster/issues/187): `design/inventory/INVENTORY.md` on `inventory/187-ui-baseline`.
- ADR-0016 (results presentation and workflow) and GLOSSARY.md (Verdict, Status, Re-check, Manual override, Correction suggestion).

**Out of scope here:**
- website page composition, specified in [website-and-documentation.md](website-and-documentation.md);
- the private web app and Operator administration ("How are the private web app and Operator administration structured?", [#196](https://github.com/jeffnawroth/source-taster/issues/196)). Section 2 lists every primitive those surfaces need, so #196 composes rather than invents;
- email and PDF, specified in [email-and-pdf.md](email-and-pdf.md). They use roles and sRGB constants, never these components;
- copy. Labels below are examples from #192 and #194.

Component names are implementation vocabulary. They stay out of GLOSSARY.md.

## 1. Cross-cutting rules

### 1.1 Layers

1. **Primitives** live in `@source-taster/ui`. Each is copied from the React Aria Tailwind starter and restyled with the token roles. Only primitives a surface needs are copied; the catalogue in section 2 is the full list.
2. **Domain components** live in `@source-taster/ui` and are built only from primitives and roles. They carry Source Taster concepts: Verdict, Status, Reference, evidence.
3. **Surface-specific components** live in the app that uses them (web app, extension, website, private repo). They use only primitives and roles, never raw colours or a second component library.

Styling uses `tailwind-variants` for variant recipes, `tailwind-merge` for class overrides, and `tailwindcss-react-aria-components` for the `data-*` state variants (`hovered:`, `focus-visible:`, `pressed:`, `disabled:`, `invalid:`, `selected:`). Components never use `dark:` utilities; the mode lives in the roles.

### 1.2 Sharing with the private repository

No components cross into `source-taster-service`. Only `@source-taster/design-tokens` does (#189). Duplicating the primitive layer there does not meet #189's trigger for sharing components: the primitives are small, copied from the same starter, and styled from the same tokens.

The private surfaces need Table, the form primitives and AlertDialog beyond what the public app uses. They are specified here (section 2) so both copies start from one spec.

**Re-check:** after the first private implementation, compare the two primitive layers. If they drift, revisit #189's trigger.

### 1.3 Colour and glass

- **Colour only in the verdict glyph.** `verdict-*-mark` fills the glyph. The label beside it is `text`. Chips, cards, rows, headers and counters around a verdict stay neutral: no tints, no coloured borders, no glows. `feedback-*` is the only other colour, and only for form errors, destructive confirmations, quota warnings and toasts, never inside a results list.
- **Accent** marks the one primary action per view, the selected state, links and "Running".
- **Glass only on floating layers:** TopBar, the sticky SummaryStrip, Toast, the DetailPane header (variant `glass`), and CommandPalette (variant `glass-overlay`). Everything else is opaque `surface`. The fallback for no `backdrop-filter` or `prefers-reduced-transparency` is opaque `surface`.
- **Verdict never by colour alone** (FA-ERG-03). Every verdict shows its glyph shape plus its label. The one exception is the compact strip (3.2), which shows glyph + number and keeps the full label as accessible name and tooltip.
- **Forced colours:** glyphs become monochrome `CanvasText` shapes. Focus uses `Highlight`. Borders that carry state (dashed Status contour, selected outline) stay visible as system colours.

### 1.4 Type, sizes and targets

- Panel and web use the **same type steps**. Only view headings differ: `text-xl` in the panel, `text-2xl` on the web. The panel saves space through spacing, never through smaller text.
- Body and controls are `text-base`; meta and captions `text-xs`; chips and table cells `text-sm`. Evidence values (DOIs, page ranges, identifiers, source names) are mono at `0.94em`.
- **Control sizes:**
  - `md`, 36 px high: the default for buttons, fields, selects and segmented controls.
  - `sm`, 28 px high: chips, counters, tags and inline actions.
- **Hit targets** are at least 24 × 24 px everywhere (WCAG 2.5.8). Icon-only controls at `sm` keep a 28 px square.

### 1.5 States

Every interactive component defines these states with the same roles:

| State | Treatment |
|---|---|
| Hover | one step stronger surface or border (`surface-sunken`, `border-strong`); cards get `shadow-lifted` |
| Focus visible | 2 px `focus-ring` outline, 2 px offset, following the radius. Keyboard only (`focus-visible`) |
| Pressed | `duration-instant` scale to 0.98 on buttons; no colour flash |
| Selected | `accent` outline or fill, plus a non-colour cue (check, `aria-selected`/`aria-pressed`, weight) |
| Disabled | visibly weaker: `text-muted` on `surface-sunken`, no hover. The reason sits next to the control in `text-secondary` |
| Invalid | `feedback-danger` border and a FieldError below with icon and text; the field stays readable |
| Loading | the control keeps its width; a Spinner replaces or precedes the label; `aria-busy` |

Disabled controls that a user might wonder about stay focusable (`aria-disabled` rather than removed from the tab order) when their reason is the only way to learn why.

### 1.6 Long German text

German labels run long ("Existiert, mit Abweichungen", „Als neue Prüfung starten“). The rule per component is one of:

- **Wrap:** body text, reasons, dialog text, toast text, banners, field labels and descriptions, table cells. Never truncate meaning.
- **Truncate with full text available:** titles in FeedCard (two lines), HistoryEntry (one line), TopBar document name (one line). The full text is in the accessible name and a tooltip or the detail view.
- **Never truncate:** button labels, Verdict and Status labels, menu items. If a button label does not fit, the layout gives way (the button wraps to its own row) before the label does.

Each component below names its rule.

### 1.7 Icons, loading and empty states

- **Icons:** Lucide, stroke 1.75, at 16 px (inline, `sm` controls) and 20 px (`md` controls, headers). Decorative icons are `aria-hidden`; meaningful icons have text beside them.
- **Spinner** only for a running Check, a running Re-check and a loading button.
- **Skeleton** only while Structuring turns pasted text into Reference slots.
- **ProgressBar** for overall Check progress. It never takes verdict colours, so a full bar never contradicts "Not verifiable" (inventory problem 4).
- **Empty states:** one sentence and at most one action.

### 1.8 Overlays and motion

| Layer | Pattern | Modality |
|---|---|---|
| Detail, web | push drawer: `<aside aria-labelledby>` beside the feed, with a `glass` header | non-modal; Esc closes, focus returns to the card |
| Detail, 360 px | full view with a Back button | a view, not an overlay; Back restores scroll and focus |
| History ("Verlauf") | Sheet from the left | modal |
| Account ("Konto") | Popover on AccountChip | non-modal |
| ⌘K | CommandPalette, `glass-overlay` | modal |
| ⋯ | Menu | non-modal |
| Reset, delete, „Als neue Prüfung starten“ | AlertDialog | modal |
| Toasts | ToastRegion | non-modal landmark |

- A **scrim** (`scrim`, `blur(4px)`) appears only under modal overlays.
- Overlays enter with `@starting-style`, `ease-spring-soft` and `duration-slow` for sheets and the drawer, `duration-spring` for popovers and menus. They exit with `ease-exit` and `duration-fast`. Under reduced motion they appear without movement.
- Modal overlays trap focus, restore focus to their trigger, and close on Esc. Destructive dialogs put initial focus on the safe action.
- Streaming results never move focus or reorder anything.

### 1.9 Website and docs

Primitive styles are `tailwind-variants` recipes in `@source-taster/ui`: pure functions that return class strings, with no React. Astro renders **Button, Link, Badge, Banner and Kbd** statically at build time from the same recipes. React islands appear only where interaction needs them, such as docs search. The website layout is A with C’s documentation index under #198; [website-and-documentation.md](website-and-documentation.md) owns its composition. This section owns static primitive styling.

### 1.10 Maturity

ADR-0002's maturity rule allows stable RAC exports. As of RAC 1.22.1:

- Autocomplete, Disclosure, Toolbar, ToggleButtonGroup and SelectionIndicator are stable and may be used directly.
- **Toast is only exported as `UNSTABLE_Toast` / `UNSTABLE_ToastRegion`.** It is used anyway, behind a project-owned `Toast` wrapper, with the exact RAC version pinned. No other code imports the unstable names. The design-system ADR records this exception and its exit: drop the wrapper's shim when Toast is stable.

## 2. Primitives

Each entry gives the RAC primitive, anatomy, variants and sizes, roles, keyboard and ARIA beyond RAC's defaults, and the long-text rule. States follow 1.5 unless stated.

### 2.1 Actions

**Button** — RAC `Button`.
- Anatomy: optional leading icon, label, optional trailing icon. `radius-full`. Sizes `md` (default), `sm`.
- Variants:
  - `primary`: flat `accent` fill, `on-accent` text. **At most one per view.**
  - `secondary`: `surface` fill, `border-strong` border, `text`.
  - `ghost`: no fill or border; text or icon only; hover `surface-sunken`.
  - `danger`: flat `feedback-danger` fill with a `surface`-coloured label (the gated pair `feedback-danger` on `surface`, 4.5:1 in both modes, read the other way round). **Only inside a confirmation step** (AlertDialog). The trigger that opens the confirmation is `ghost` or `secondary`.
- Disabled: weaker and with its reason beside it (inventory problem 2: disabled primaries no longer look like enabled ones).
- Loading: keeps its width; Spinner before the label; label stays.
- Long text: never truncates; wraps to its own row in narrow layouts.

**IconButton** — RAC `Button` with an icon only.
- Square, `radius-full`, 36 px (`md`) or 28 px (`sm`). Variants `ghost` (default) and `secondary`.
- **Always** an accessible name and a Tooltip with the same text.

**ToggleButton** — RAC `ToggleButton`.
- Like Button `secondary`; selected adds `accent-tint` and an `accent-text` icon. `aria-pressed` comes from RAC.
- Used for "Alle Labels zeigen"-style view toggles when they live outside a menu.

**Link** — RAC `Link`.
- `accent-text`, underlined, `text-decoration-thickness: 1px`, offset 0.2em. Hover thickens the underline. Visited is not styled.
- External links get a 16 px Lucide `arrow-up-right` and "opens in a new tab" in the accessible name.
- Long text: wraps.

### 2.2 Input

All fields share one anatomy through **Form, Label, Description and FieldError**: Label above (`text-sm`, weight 500, `text`), control, Description below (`text-xs`, `text-secondary`), FieldError below that (`text-xs`, `feedback-danger`, Lucide `circle-alert`). Fields are `surface` with a `border-emphasis` boundary (3:1 gated), `radius-md`, height 36 px. Required fields say „Pflichtfeld“ in the label, not with a bare asterisk. Validation shows after blur or submit, never while typing the first character. Labels and errors wrap.

**TextField** — RAC `TextField` + `Input`.

**TextArea** — RAC `TextField` + `TextArea`. Grows with content up to a maximum, then scrolls. Used inside IntakeField.

**SearchField** — RAC `SearchField`. Lucide `search` leading, clear IconButton trailing, Esc clears.

**Select** — RAC `Select` + `Popover` + `ListBox`. Trigger looks like a field with a `chevron-down`. Options are `text-base` rows with a check on the selected one. Option labels wrap in the list; the trigger truncates with the full value as tooltip.

**ComboBox** — RAC `ComboBox`. For citation styles, where the list is long and searchable. Filtering is substring, case- and diacritic-insensitive.

**Checkbox / CheckboxGroup** — RAC `Checkbox`, `CheckboxGroup`. 20 px box, `radius-xs`, `border-emphasis`; checked fills `accent` with an `on-accent` check. Indeterminate shows a dash. The label is part of the hit target.

**RadioGroup** — RAC `RadioGroup` + `Radio`. 20 px circle; selected shows an `accent` ring and dot. Arrow keys move within the group. Used by ManualOverride.

**Switch** — RAC `Switch`. 36 × 20 px track; on is `accent`, off `surface-sunken` with `border-emphasis`. For settings that apply immediately, never for form choices that need Save.

**SegmentedControl** — RAC `ToggleButtonGroup` with `SelectionIndicator`. `surface-sunken` well, `radius-full`; the selected segment is `surface` with `shadow-raised` and moves with `ease-spring`. Single selection; arrow keys move. Segment labels never truncate; when they do not fit, the control becomes a Select.

**FileTrigger** — RAC `FileTrigger` around a Button. The native file input never shows, so its text is always translated (inventory problem 5).

**DropZone** — RAC `DropZone`. Dashed `border-emphasis`, `radius-lg`. Drop target active: `accent` dashed border and `accent-tint` wash. Its text says which file types are accepted. Keyboard users reach the same action through the FileTrigger inside it.

### 2.3 Overlays

**Popover** — RAC `Popover`. Opaque `surface`, `border`, `radius-lg`, `shadow-lifted`, with an optional arrow. Non-modal.

**Menu** — RAC `MenuTrigger` + `Menu` + `MenuItem` + `MenuSection` + `Separator`, inside Popover. Items 36 px, `radius-md`, optional icon and Kbd shortcut. Destructive items use `text` plus a confirmation step, never red text in the menu. Items never truncate; the menu widens up to 320 px, then wraps.

**Dialog** — RAC `ModalOverlay` + `Modal` + `Dialog`. Centred, `surface`, `radius-2xl`, max width 560 px; at 360 px it fills the width minus 16 px. Heading (`text-lg`), body, action row with the primary action last. Close IconButton top right.

**AlertDialog** — Dialog with `role="alertdialog"`. One sentence of consequence, then the actions: the safe action (secondary) and the confirming `danger` Button. Initial focus is on the safe action.

**Sheet** — RAC `ModalOverlay` + `Modal`, docked to the left or right edge, full height, `surface`, inner corner `radius-2xl`. Width 400 px on the web; full width minus 40 px at 360 px. Used by HistorySheet.

**Tooltip** — RAC `TooltipTrigger` + `Tooltip`. `text` on `surface` with `border` and `shadow-raised`, `text-xs`, max width 280 px, wraps. Appears on hover after 600 ms and immediately on keyboard focus. Never holds information that is not also reachable another way, except for the compact strip labels, which are also the accessible names.

**Toast** — the project wrapper around RAC `UNSTABLE_ToastRegion` + `UNSTABLE_Toast` (1.10).
- Anatomy: Lucide icon in its `feedback-*` colour, text, optional single action Button (`ghost`), close IconButton. `glass` material, `radius-lg`.
- **A toast with an action never auto-dismisses** (WCAG 2.2.1). A toast without an action closes after 5 s; the timer pauses on hover and on focus.
- At most three at a time; older ones collapse.
- The region is a landmark reachable with F6. Toasts announce politely; errors assertively.
- Text wraps.

### 2.4 Structure

**Disclosure** — RAC `Disclosure` + `DisclosurePanel`, and `DisclosureGroup` for sets. Trigger is a full-width row with a `chevron-right` that rotates 90°. Used for evidence details and "How the check works".

**Tabs** — RAC `Tabs`. Underline style: selected tab gets a 2 px `accent` bar and `text`; others `text-secondary`. Arrow keys move. When the tab labels do not fit, the list scrolls horizontally with edge fades; labels do not truncate.

**Table** — RAC `Table` with `Column`, `Row`, `Cell`, `ResizableTableContainer` where needed.
- Header `text-xs`, weight 600, `text-secondary`, sticky. Rows 40 px minimum, `border` between rows, hover `surface-sunken`. Numbers right-aligned and tabular.
- Sortable columns show the sort direction icon and `aria-sort`. Selection uses Checkbox in the first column.
- Cells wrap. Below 560 px a table either scrolls horizontally inside its container with a visible edge, or the surface gives a stacked list instead; the choice belongs to the screen.
- Public use: ComparisonTable's frame. Private use: Operator lists (#196).

**Separator** — RAC `Separator`. 1 px `border`.

### 2.5 Display

**Tag / TagGroup** — RAC `TagGroup` + `TagList` + `Tag`. `sm`, `radius-full`, `surface` + `border`. Removable tags have a × IconButton named "Remove ‹label›". Used for source chips in IntakeField and the active filter chip. Labels never truncate.

**Badge** — a non-interactive span. `sm`, `radius-full`, `surface-sunken`, `text-secondary`, `text-xs`. For counts and neutral markers. Domain badges (VerdictBadge, StatusBadge, ManualTag) build on it.

**ProgressBar** — RAC `ProgressBar`. 4 px (or 2 px at the strip's bottom edge), track `surface-sunken` with a `border` hairline, fill `accent`. Indeterminate stripes are not used; unknown progress uses Spinner. The visible label states progress in words (from #192).

**Meter** — RAC `Meter`. Like ProgressBar but for a level (Quota). The fill stays `accent` and switches to `feedback-warning` with an icon and text only when the quota warning applies.

**Spinner** — 16 or 20 px, `accent` arc on a `border` circle, `duration` 800 ms linear. `role="status"` with a label only when it stands alone; inside a Button the Button carries `aria-busy`. Under reduced motion it pulses opacity instead of turning.

**Skeleton** — `surface-sunken` blocks at the size of the coming content, with a slow opacity pulse (none under reduced motion). `aria-hidden`; the container says "Referenzen werden erkannt" once.

**Kbd** — `<kbd>`, `surface-sunken`, `border`, `radius-sm`, mono `text-2xs`. Shows ⌘ on Apple platforms and Ctrl elsewhere.

**Banner** — a block notice. `feedback-*-tint` fill, Lucide icon in `feedback-*`, `text` body, optional one action and close. `role="status"` for info and success, `role="alert"` for danger. Sits in the flow above the content it concerns, never fixed. Text wraps. This gives errors and notices a treatment distinct from the preview notice (inventory problem 4).

## 3. Domain components

### 3.1 Verdict and Status

**VerdictGlyph** — an inline SVG per Verdict, at 16, 20 or 24 px.
- Each of the six Verdicts has its own shape, filled with its `verdict-*-mark`, with an `on-verdict-mark` inner symbol. Shapes must stay pairwise distinct in greyscale at 16 px (tokens §7, glyph test).
- `aria-hidden` when a label is beside it, which is always except in the compact strip.
- Under `forced-colors` it renders monochrome in `CanvasText`.

**VerdictBadge** — Badge with VerdictGlyph and label.
- Neutral chip: `surface` + `border`, `radius-full`, sizes `sm` (glyph 16) and `md` (glyph 20). The glyph carries the colour; the label is `text`, weight 500.
- Label is the full glossary label from #192. It never truncates; in tight rows the badge wraps below the title.

**StatusBadge** — for the four Statuses: Running, Not checked, Cancelled, Technical error.
- Lucide icon + label in `text-muted`, inside a dashed `border-emphasis` contour, `radius-full`. On glass (the sticky strip) the label and icon use `text-on-glass-secondary`, because `text-muted` is not allowed on glass. Never a verdict colour or glyph.
- Running: `accent` icon (`loader-circle`) with a pulse; reduced motion keeps it still.
- Technical error: `triangle-alert`, never red.
- `aria-live` is not on the badge; progress announcements come from the feed (3.2).

**ManualTag** — Badge with Lucide `user-check` and the text for a Manual override (for example "Manuell"). Shown next to the effective Verdict. Its tooltip and the detail say the system Verdict, which stays available (ADR-0016).

### 3.2 Strip and feed

**VerdictCounter** — RAC `ToggleButton`, `sm`.
- Wide: glyph + label + number. Compact: glyph + number.
- The **accessible name is always the full label and the number**, for example „Existiert, mit Abweichungen: 2“; in compact form the same text is the Tooltip.
- Pressed means "filter to this Verdict" (`aria-pressed`). Pressed style: `accent` outline and `accent-tint`. A zero count is shown and disabled.
- Numbers are tabular.

**StatusCounter** — like VerdictCounter, with a StatusBadge-style dashed contour and the Status icon. Appears only when at least one Reference has that Status. Statuses are counted apart from Verdicts (ADR-0016).

**SummaryStrip** — RAC `Toolbar` holding the counters, the filter chip and the ⋯ Menu. Sticky under the TopBar with `glass` while scrolled.
- **Wide** (container ≥ 700 px, as decided in #194): the summary sentence, then six labelled VerdictCounters, then a separate Status group.
- **Compact** (container < 700 px; the 360 px panel): one row of six glyph + number counters, a StatusCounter when there are Statuses, and the ⋯ Menu, with a 2 px ProgressBar along the bottom edge. About 46 px high.
  - The summary sentence moves to the top of the feed: done „5 von 10 Referenzen stimmen.“; running „Prüfung läuft · 4 von 10 fertig“ with a Stop Button.
  - An active filter adds a Tag below the row with the glyph, the **full** label and ×.
  - „Alle Labels zeigen“ in the ⋯ Menu switches the strip to the wide layout, wrapped over several rows, until switched back.
- **Explicit exception to "glyph + label"**: only the compact strip, only below 700 px, may show glyph + number without the visible label. Name and tooltip carry the label. Every other place shows the label.
- Arrow keys move between counters (Toolbar); Tab leaves the strip.

**FeedCard** — one Reference in the results list.
- Anatomy, top to bottom: mono number and title (title clamps at two lines); meta „Autor · Jahr“ (`text-sm`, `text-secondary`) and VerdictBadge or StatusBadge; the reason (`text-sm`, two lines, then truncated); EvidenceTrack while running; ManualTag when a Manual override is set.
- `surface`, `border`, `radius-xl`. Hover `shadow-lifted`; selected (its detail is open) a 2 px `accent` outline.
- No verdict colour on the card itself.
- The full title and reason are in the detail; the accessible name is the title plus the Verdict or Status.

**Feed** — RAC `GridList` of FeedCards.
- One tab stop. ↑/↓ move between cards; Enter opens the detail; → moves into a card's own actions (for example Retry), ← back out.
- Streaming only appends or updates in place. Order and focus never change (ADR-0016).
- Progress is announced politely and in batches (for example every few finished References and at the end), never once per raw event.
- Filtered with no matches: the empty state names the filter and offers "Filter entfernen".

**EvidenceTrack** — the search steps for one Reference while it runs, and in the detail's EvidenceTrail.
- Fully neutral; shape carries the meaning: ✓ confirmed, ≠ deviates, × not found, a dashed circle for waiting, and an `accent` pulse for the running step.
- Icons in `text-secondary`, connectors in `border-strong`. Step names wrap.
- An `ol` with each step's state in text for screen readers.

### 3.3 Intake

**IntakeField** — the start of every Check.
- A growing TextArea (paste), source Tags (Text, File, Page selection; from #194), a FileTrigger and a DropZone that covers the field while a file is dragged over it.
- One primary Button to start. Its disabled state states why (for example no input).
- Paste and drop never start a Check on their own.

**RegionPicker** — Bibliography selection after detection.
- Detected regions listed in input order, each a Checkbox row with the region's first line (wraps, then clamps at three lines with "mehr").
- All selected initially; each can be deselected or moved (ADR-0011).
- Rejected entries appear in a separate Disclosure group „Nicht als Referenz erkannt“, each with an action to adopt it as a new slot. It is neither a Verdict nor a Status and uses no verdict glyph.

### 3.4 Shell

**TopBar** — `glass`, `z-topbar`. Logo, document name (one line, truncated with tooltip), the ⌘K trigger, AccountChip. In the 360 px panel the History trigger sits at the start and the ⌘K trigger becomes an IconButton.

**CommandPalette** — ⌘K / Ctrl+K. RAC `Autocomplete` with a SearchField and a `Menu` of commands and recent Checks, inside a modal `glass-overlay` Dialog, `radius-2xl`, max width 640 px. Items show icon, label, optional Kbd; Verdict items show VerdictGlyph + label. Esc closes and returns focus.

**AccountChip** — Button `ghost` with the avatar initial in a neutral `surface-sunken` circle (no gradient) and, on the web, the name. Opens **AccountPopover**: account name, QuotaMeter, links to Preferences and Account, sign-out. A Guest sees a sign-in action instead.

**QuotaMeter** — Meter with the remaining Quota in words („Noch 12 von 50 Prüfungen“). The quota warning switches it to `feedback-warning` with icon and text (1.7). Quota facts follow #192 (a technical Status uses no Quota; a previously debited slot is not debited again, while a previously unbilled slot can incur its first debit on a Verdict).

**HistorySheet** — Sheet from the left with a SearchField and a list of **HistoryEntry** rows: document name (one line, truncated), date, and the summary sentence in text („5 von 10 Referenzen stimmen.“). No glyph-only counts: the compact-strip exception does not extend here. Opening an entry loads it; "Als neue Prüfung starten" asks first (AlertDialog).

### 3.5 Detail

**DetailPane** (web, push drawer) and **DetailView** (360 px, full view) show the same content in the same order (ADR-0016):

1. **VerdictHeader** — VerdictGlyph (24) + label as heading, the plain-language reason, ManualTag if set. Opaque (no tint). The **Pager** (previous / next Reference IconButtons with „3 von 10“) sits at its end; it follows the active filter. In DetailPane the header is `glass` and sticky; in DetailView a Back Button precedes it.
2. **OriginalInput** — the immutable original Reference, mono, `surface-sunken`, wraps; labelled as the original.
3. **ComparisonTable** — Table of field, Reference value and Best match value side by side. A deviating row marks both values with ≠ and names them; an absent or unknown value is shown as such, never as agreement. Below 560 px each field becomes a stacked pair, still side by side in reading order.
4. **SourceList** — the Sources searched and Candidates found, each with its Data source in mono and a Link.
5. **EvidenceTrail** — the EvidenceTrack for this result inside a Disclosure, collapsed by default once finished.
6. **TrackedChange** and **CorrectionActions** — see 3.6.
7. **FieldEditor** — the editable fields as TextFields in a Form, with "Speichern und erneut prüfen" as the primary Button. Saving appends a Re-check result; the earlier result stays as history.
8. **ManualOverride** — a RadioGroup of the six Verdicts (glyph + label each), preset to the current Verdict, with a note field and Save. Confirming the same Verdict is a Manual override too. A Re-check resets it visibly.

Esc closes DetailPane and returns focus to the card; Back does the same for DetailView.

### 3.6 Correction

> **Pending client.** The Correction suggestion's look is settled; the apply-to-draft action is proposed for explicit acceptance in ADR-0027. It must not ship from this proposed packet alone. Copy and transient export selection remain the accepted ADR-0016 baseline.

**TrackedChange** — a preview of the Correction suggestion against the original, never an editor.
- Deletions: `correction-delete-text` with a neutral strike (`correction-delete-line`) on `correction-delete-bg`.
- Insertions: `text` on the neutral `correction-insert-bg` with a 2 px `correction-insert-line` underline. Never green.
- Screen readers get "gelöscht: …" / "eingefügt: …" through visually hidden text.
- Wraps like body text.

**CorrectionActions** — below TrackedChange:
- „In Felder übernehmen“ (secondary): copies proven structured suggestion values into an editable FieldEditor draft. It does not save, alter the immutable original or start a request. Bind it to the current result/revision and reject stale/unavailable suggestions; never parse formatted copy to invent field values. Discard leaves committed fields and results unchanged. The user then saves with „Speichern und erneut prüfen“. Nothing is re-checked before that (model "apply to fields, then save and re-check").
- „Kopieren“ (ghost) and „Für Export verwenden“ (ghost, toggles a transient export choice, ADR-0016).

The round-4 identity prototype's morph from the suggestion into the fields is dropped.

### 3.7 Notices and dialogs

**SessionNotices** — the always-relevant notices (preview, AI extraction, Guest limits) as one Banner stack above the feed, each dismissible for the session where the requirements allow it. They never sit above the intake on every screen (inventory problem 1).

**ExportDialog** — Dialog with format (SegmentedControl or Select), citation style (ComboBox), the list of selected Correction suggestions, and the download Button as primary. Changing the style changes rendering, not the Verdict.

**ReportDialog** — Dialog for a Reported wrong Verdict: what will be sent, the separate consent Checkbox for the copy of the Reference and result, an optional note, and the send Button. Send is disabled until consent is given, and says so.

## 4. How this answers the UI baseline

The inventory from #187 named five cross-cutting problems:

1. **No page-level structure** — the shell components (TopBar, SummaryStrip, Feed, DetailPane/DetailView) carry #194's structure; SessionNotices move above the feed.
2. **No visual hierarchy in actions** — one primary per view, a visible disabled state with its reason, danger only in confirmation (2.1).
3. **Density without a scan path** — FeedCard clamps title and reason; the detail orders Verdict and reason first and puts evidence in Disclosures.
4. **Status and error feedback blends in** — Banner, Toast and StatusBadge have distinct treatments; progress never uses verdict colours.
5. **Unstyled native controls and a separate visual language** — FileTrigger hides the native input; the website renders the same recipes (1.9).

## 5. Handed on

- **Design-system ADR** (end of the map): the layer rule (1.1), no shared components (1.2), the calm colour rule and glass list (1.3), the compact-strip exception (3.2), and the Toast `UNSTABLE_` exception with pinned version and wrapper (1.10).
- **Private surfaces:** #196 composes from section 2. After the first implementation, compare the two primitive layers (1.2).
- **Correction flow:** confirm 3.6 against the client implementation, then drop "pending client".
- **Website and docs:** compose the shared static recipes using the accepted #198 layout.
- **Copy:** every string here is an example; #192's catalogue owns the final text.
- **Drafted, not grilled:** the details below the grilled decisions were drafted for review, not decided: tooltip delay (600 ms), Spinner speed (800 ms), disabled zero counters, the Meter switching to `feedback-warning`, Checkbox, Radio and Switch sizes, the „Pflichtfeld“ convention, Sheet and Dialog widths, the Table breakpoint (560 px), and the batching of progress announcements.
- **Verification:** the glyph greyscale test, axe in E2E, rendered-pixel contrast on glass, 200 % zoom and 320 px reflow in the panel, and forced-colors checks run on the built components, not on this spec.

## 6. Consolidation precedence

The Account popover is an entry point. #196 puts substantive Account work on full pages (KA with KC’s Plan/Quota hierarchy), not an Account sheet. Email A/PDF C, website A with C’s question index, and brand A-store/B-social follow their later accepted specs.

No should/deferred feature is pulled into launch by appearing in this catalogue: CommandPalette is a design hook, not a new full-text application search service; persistent Theme choice remains ADR-0023 should. Use only existing routes/actions when wiring the launcher.

The “drafted, not grilled” timings, dimensions and announcement batching in section 5 are implementation defaults within the accepted rules. Validate them with the actual content, controls and assistive technology; they are not new business rules or separately granted exceptions. See [reconciliations.md](reconciliations.md).
