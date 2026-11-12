// SPDX-License-Identifier: AGPL-3.0-or-later
// #214: the web app's own HTML head carries the same brand icon links, mask
// icon and manifest as the website. The list is the brand package's single
// source, so the two heads cannot drift apart.
import type { HtmlTagDescriptor, Plugin } from "vite";
import { headLinks, webManifest } from "../../packages/brand/src/web-head.ts";

/** Injects the brand links into the app's index.html `<head>`. */
export function brandHead(): Plugin {
  return {
    name: "brand-head",
    transformIndexHtml: (): HtmlTagDescriptor[] =>
      headLinks.map((attrs) => ({
        tag: "link",
        attrs: { ...attrs },
        injectTo: "head",
      })),
  };
}

const escape = (path: string) => path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const brandFiles = [
  ...headLinks.map(({ href }) => href),
  ...webManifest().icons.map(({ src }) => src),
];

/**
 * Dev-server paths the website build answers: the documentation site and each
 * linked brand file (production serves them from the website mounted behind
 * the app). A query string does not change which file is meant.
 */
export const websitePaths = new RegExp(
  `^(?:/(?:docs|de|en|pagefind|_astro)(?:/|$)|(?:${brandFiles.map(escape).join("|")})(?:\\?|$))`,
);
