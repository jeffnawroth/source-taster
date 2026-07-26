# The Source Taster — Brand Style Guide

## Logo

Alle Logos haben weißen Hintergrund + Primary (`#5B2D8E`) Icon/Text.

| Variant       | File                                                               |
| ------------- | ------------------------------------------------------------------ |
| Full logo     | `apps/landing/public/logo.svg` / `apps/docs/public/logo.svg`       |
| Icon (SVG)    | `apps/landing/public/favicon.svg` / `apps/docs/public/favicon.svg` |
| Icon (PNG)    | `apps/extension/extension/assets/icon128.png`                      |
| Source bucket | `web-assets/` — enthält alle Varianten inkl. PNG-Größen            |

## Color Palette (ROADMAP)

| Token               | Light     | Dark (—lighten-1) |
| ------------------- | --------- | ----------------- |
| **Primary** `--p`   | `#5B2D8E` | `#7B4DB8`         |
| Primary darken-1    | `#3D1A6B` | `#5B2D8E`         |
| Primary lighten-1   | `#7B4DB8` | `#9B6BC8`         |
| **Secondary** `--t` | `#1A7A7A` | `#5CC0C0`         |
| Secondary darken-1  | `#0F5A5A` | `#1A7A7A`         |
| Secondary lighten-1 | `#3FA8A8` | `#7DD8D8`         |
| **Accent** `--a`    | `#D4A030` | `#E8C870`         |
| Accent darken-1     | `#B07A1F` | `#D4A030`         |
| Accent lighten-1    | `#E0B85C` | `#F0D080`         |
| **Success** `--g`   | `#2d7a31` | `#70c875`         |
| Success darken-1    | —         | `#2d7a31`         |
| Success lighten-1   | `#70c875` | —                 |
| **On-primary**      | `#FFFFFF` | `#FFFFFF`         |
| **On-secondary**    | `#FFFFFF` | `#FFFFFF`         |
| **On-accent**       | `#1a1408` | `#1a1408`         |
| **On-success**      | `#FFFFFF` | `#FFFFFF`         |

Applies to: Landing (`global.css`), Docs (VitePress theme), Extension (Vuetify theme).

## Typography

| Property         | Value                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| **Font family**  | `'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` |
| **Weights used** | 400 (regular), 600 (semibold), 700 (bold)                                                                 |
| **Load method**  | Google Fonts via `<link>` in `<head>` (Landing, Docs), `@fontsource/noto-sans` via ViteFonts (Extension)  |

## Design Tokens

| Token               | Value                             |
| ------------------- | --------------------------------- |
| **Spacing unit**    | `4px` × (1, 2, 3, 4, 5, 6, 8, 10) |
| **Radius sm**       | `6px`                             |
| **Radius**          | `8px`                             |
| **Radius lg**       | `12px`                            |
| **Shadow card**     | `0 2px 16px rgba(0,0,0,0.06)`     |
| **Shadow dropdown** | `0 4px 24px rgba(0,0,0,0.10)`     |
| **Shadow modal**    | `0 8px 40px rgba(0,0,0,0.12)`     |
| **Breakpoint sm**   | `560px`                           |
| **Breakpoint md**   | `768px`                           |
| **Breakpoint lg**   | `900px`                           |
| **Breakpoint xl**   | `1000px`                          |
| **Breakpoint xxl**  | `1100px`                          |

### Gradient

```css
background: linear-gradient(135deg, #5b2d8e, #1a7a7a);
background-size: 200% 200%;
animation: gradientShift 4s ease infinite;
```

Used for primary buttons and hero backgrounds.

## Channel Configuration

| Channel                       | Logo                               | Font                                  | Color source             |
| ----------------------------- | ---------------------------------- | ------------------------------------- | ------------------------ |
| Landing (`apps/landing/`)     | `public/logo.svg`                  | Google Fonts, `--font` CSS var        | `global.css` CSS vars    |
| Docs (`apps/docs/`)           | `public/logo.svg`                  | Google Fonts, `theme/style.css`       | VitePress theme defaults |
| Extension (`apps/extension/`) | Tray icon from `extension/assets/` | `@fontsource/noto-sans` via ViteFonts | `src/plugins/vuetify.ts` |

## Store Assets

| Asset            | Dimensions | Format | Content                                                |
| ---------------- | ---------- | ------ | ------------------------------------------------------ |
| Screenshot 1     | 1280×800   | PNG    | Side panel — empty state                               |
| Screenshot 2     | 1280×800   | PNG    | Reference extraction result                            |
| Screenshot 3     | 1280×800   | PNG    | Match detail with score breakdown                      |
| Screenshot 4     | 1280×800   | PNG    | Batch verification                                     |
| Screenshot 5     | 1280×800   | PNG    | PDF import                                             |
| Promotional tile | 440×280    | PNG    | Logo + "93% match rate · 100% hallucination detection" |
