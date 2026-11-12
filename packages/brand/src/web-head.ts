// SPDX-License-Identifier: AGPL-3.0-or-later
// The web head and manifest for every page that shows the brand icons (#214).
// One source feeds the website's Astro head, the web app's HTML head and the
// committed `manifest.webmanifest`, so the three cannot drift apart. Colours
// are the design tokens' light `bg` and `accent` roles, never repeated here.

import { colors } from "@source-taster/design-tokens";

export interface HeadLink {
  rel: string;
  href: string;
  sizes?: string;
  type?: string;
  /** Safari pinned-tab tint (`rel="mask-icon"` only). */
  color?: string;
}

/** `sizes` names only sizes the file actually holds (HTML `rel=icon`). */
export const headLinks: readonly HeadLink[] = [
  {
    rel: "icon",
    href: "/favicon.ico",
    sizes: "16x16 32x32 48x48",
    type: "image/x-icon",
  },
  { rel: "icon", href: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
  ...[16, 32, 48, 96].map((size) => ({
    rel: "icon",
    href: `/favicon-${size}.png`,
    sizes: `${size}x${size}`,
    type: "image/png",
  })),
  {
    rel: "apple-touch-icon",
    href: "/apple-touch-icon.png",
    sizes: "180x180",
    type: "image/png",
  },
  // Archived Safari pinned-tab facility; the link colour tints the mask.
  {
    rel: "mask-icon",
    href: "/safari-pinned-tab.svg",
    color: colors.light.accent.color,
  },
  { rel: "manifest", href: "/manifest.webmanifest" },
];

const manifestIcons = (prefix: string, purpose: "any" | "maskable") =>
  [192, 512].map((size) => ({
    src: `/${prefix}-${size}.png`,
    sizes: `${size}x${size}`,
    type: "image/png",
    purpose,
  }));

/**
 * `display: "browser"` and no service worker: the manifest supplies the name,
 * icons and colours only and selects no installable-app behaviour. The colour
 * is the calm light background, not the accent (no colour fields).
 */
export function webManifest() {
  return {
    name: "Source Taster",
    display: "browser",
    theme_color: colors.light.bg.color,
    background_color: colors.light.bg.color,
    icons: [
      ...manifestIcons("web-app-any", "any"),
      ...manifestIcons("web-app-maskable", "maskable"),
    ],
  };
}
