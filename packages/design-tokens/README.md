# @source-taster/design-tokens

The value-only interface accepted in ADR-0027 and implemented by #208. It ships
committed outputs and has no runtime dependencies. No registry publication is
configured. Source: `src/tokens.ts`; normative specification:
[`docs/design/tokens.md`](../../docs/design/tokens.md).

```css
@import "tailwindcss";
@import "@source-taster/design-tokens/theme.css";
```

Import the token stylesheet after Tailwind's defaults. Use semantic utilities
such as `bg-surface`, `text-text-muted`, `border-border-strong`, `font-sans`,
`text-base`, `rounded-xl` and `shadow-glass`. Replaced colour/font/text/radius/
shadow/easing namespaces are reset. Primitives have no utilities. Mode-sensitive
aliases use `@theme inline`; components use semantic roles without `dark:`.
Other values are available as `var(--st-duration-fast)`, `var(--st-z-overlay)`,
`var(--st-focus-width)` etc. The stylesheet contains values, not component rules.

Light is the root default. System dark mode applies unless the root explicitly
has `data-theme="light"`; `data-theme="dark"` also overrides a light system.
Removing the attribute restores System. This package reads/writes no preference
or storage. Reduced motion sets all duration/stagger variables to zero; consumers
own final-state rendering and skipped transitions. Consumers also own glass
fallbacks, forced-colour focus, font loading, labels and accessible behaviour.

```ts
import { colors, opaque, correctionLayers } from "@source-taster/design-tokens";
import type { Role, Mode, Backdrop } from "@source-taster/design-tokens";

colors.dark["border"]; // { color: "#ffffff", alpha: 0.085 }
opaque.white.border; // "#e6e7ea"
opaque["light-canvas"].border; // "#dde1e8"
correctionLayers.white.insert; // background + line over that background
```

`colors` contains the six-digit sRGB source colour plus its unquantized alpha in
both modes. It is not an already opaque mail/PDF colour. `opaque` flattens every
**light-mode** role directly onto each named medium backdrop: white paper/message
surface (`#ffffff`) or light mail canvas (`#f5f8fd`). `correctionLayers` additionally
flattens the neutral correction background onto that backdrop, then its line over
that background. Use these nested results when rendering tracked changes; direct
`opaque.*["correction-insert-line"]` assumes the named bare backdrop instead.
No 8-digit hex, CSS variables, dark-mode surfaces, glass effects or runtime colour
math are required in email/PDF. Use a constant only on its stated backdrop.
`values` also exports mode-independent typography/spacing/shape/motion values.

Run from this package:

```sh
pnpm tokens:generate # intentionally explicit; builds never overwrite drift
pnpm check           # gamut + 158 WCAG pairs + byte comparison of every output
pnpm test            # baseline, negative gates, Tailwind and packed import tests
```

Culori 4.0.2 is development-only. The accepted primitive table already contains
the reviewed chroma reductions; new out-of-sRGB values fail, rather than being
silently remapped. Feedback tints use the accepted build-time OKLCH mix/rounding.
All shadow colours are gamut-checked too. Contrast uses unrounded sRGB channels
and actual alpha source-over layers. The numerical 158-pair gate is design
regression evidence; rendered glass, glyphs, assistive technology and medium
qualification remain with their implementation issues.

Role rename/removal is a breaking contract change. Coordinate consumers and
record migration instructions before removing a name; value changes require
contrast/regression review too. After #207 permits private consumption, all public
Git subdirectory dependencies (tokens **and contracts**) must be bumped together
to one full reviewed 40-character public commit SHA. No private consumer pin is
created here. Verify that the private update tooling actually updates every pin;
Dependabot support is not assumed. Independent private components do not import
`@source-taster/ui` or `@source-taster/i18n`.

Only the values/CSS/constants have the narrow dual licence; see [NOTICE.md](NOTICE.md).
