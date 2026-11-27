// SPDX-License-Identifier: AGPL-3.0-or-later
// Store-facing manifest text, one source for the store channel's `_locales`
// and for the listing texts in docs/implementation/259-store-submission.md
// (scripts/release.test.ts keeps both equal). Product vocabulary follows
// GLOSSARY.md; the development-preview wording follows `skeleton_notice`.
export const storeLocales = ["en", "de"] as const;
export type StoreLocale = (typeof storeLocales)[number];

/** Chrome rejects a manifest description over 132 characters. */
export const maxManifestDescription = 132;

export const storeListing: Record<
  StoreLocale,
  { name: string; description: string }
> = {
  en: {
    name: "Source Taster",
    description:
      "Development preview: checks whether references point to existing sources and shows a Verdict for each, with its evidence.",
  },
  de: {
    name: "Source Taster",
    description:
      "Entwicklungsvorschau: prüft, ob Referenzen auf existierende Quellen verweisen, und zeigt je Referenz einen Befund mit Belegen.",
  },
};

/** Message keys that Microsoft Partner Center reads to detect the languages of
 * a package (https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension). */
export const storeMessageKeys = {
  name: "extensionName",
  description: "extensionDescription",
} as const;
