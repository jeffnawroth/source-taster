// SPDX-License-Identifier: AGPL-3.0-or-later
// Release copy and accessible descriptions, German and English. The voice
// follows docs/design/voice-and-tone.md: calm, evidence first, no hype words,
// formal German, labels as in GLOSSARY.md. Every sentence states only what a
// claim in claims.ts backs.
import { readFileSync } from "node:fs";
import type { ImageSpec, Locale, Story } from "./specs.ts";

type Text = Record<Locale, string>;
interface Entry {
  headline: Text;
  caption: Text;
}

export const copy: Record<Story | "social", Entry> = {
  workspace: {
    headline: {
      en: "Paste references. Check them.",
      de: "Referenzen einfügen und prüfen",
    },
    caption: {
      en: "Paste your reference list into the side panel. Each reference is checked on its own.",
      de: "Fügen Sie Ihre Literaturliste in den Seitenbereich ein. Jede Referenz wird einzeln geprüft.",
    },
  },
  overview: {
    headline: {
      en: "One verdict per reference",
      de: "Ein Befund pro Referenz",
    },
    caption: {
      en: "The summary counts verdicts apart from technical statuses, so a failed lookup is not read as a finding.",
      de: "Die Übersicht zählt Befunde getrennt von technischen Status. Ein Ausfall gilt nicht als Befund.",
    },
  },
  evidence: {
    headline: {
      en: "The evidence behind it",
      de: "Die Belege dahinter",
    },
    caption: {
      en: "The detail ends with the explanation and source evidence: the sources asked and the candidates they returned.",
      de: "Die Detailansicht endet mit Erklärung und Quellenbelegen: den befragten Quellen und den Kandidaten, die sie lieferten.",
    },
  },
  social: {
    headline: {
      en: "Check references against sources",
      de: "Referenzen mit Quellen abgleichen",
    },
    caption: {
      en: "Source Taster compares each reference with public sources and shows the evidence. The decision stays with you.",
      de: "Source Taster gleicht jede Referenz mit öffentlichen Quellen ab und zeigt die Belege. Entscheiden Sie selbst.",
    },
  },
};

const storyClaims: Record<Story, string[]> = {
  workspace: ["side-panel", "verdict-per-reference", "german-and-english"],
  overview: ["verdict-per-reference", "summary-counts", "doi-conflict"],
  evidence: ["best-match-comparison", "source-evidence-disclosure"],
};

/** Claim ids an image pictures or states. The language-neutral promo tiles state none. */
export function imageClaims(spec: ImageSpec): string[] {
  if (spec.role === "social")
    return ["verdict-per-reference", "detail-leads-with-verdict"];
  if (spec.story) return storyClaims[spec.story];
  return [];
}

const storyAlt: Record<Story, Text> = {
  workspace: {
    en: "A capture of the Source Taster side panel with three pasted references in the input field and the Check reference button below.",
    de: "Eine Aufnahme des Source-Taster-Seitenbereichs mit drei eingefügten Referenzen im Eingabefeld und der Schaltfläche Referenz prüfen darunter.",
  },
  overview: {
    en: "The Source Taster summary with one count for each verdict, above a list of three references. They carry the verdicts Correct, Exists, with deviations and DOI conflict, each with a symbol and a label.",
    de: "Die Source-Taster-Übersicht mit je einer Zahl pro Befund über einer Liste aus drei Referenzen. Sie tragen die Befunde Korrekt, Existiert, mit Abweichungen und DOI-Konflikt, jeweils mit Symbol und Beschriftung.",
  },
  evidence: {
    en: "The detail of one reference, scrolled to its end. The last rows of the comparison with the best match are followed by the opened disclosure Explanation and source evidence: the scoring rules version, a DOI lookup that found the DOI, and a candidate retrieved from Crossref with its score.",
    de: "Die Detailansicht einer Referenz, bis zu ihrem Ende gescrollt. Auf die letzten Zeilen des Vergleichs mit dem besten Treffer folgt die geöffnete Einblendung Erklärung und Quellenbelege: die Version der Bewertungsregeln, eine DOI-Abfrage, die die DOI gefunden hat, und ein von Crossref abgerufener Kandidat mit seiner Bewertung.",
  },
};

/** Accessible description per language; the promo tiles show the mark only. */
export function imageAlt(spec: ImageSpec): Text {
  if (spec.role === "promo-small" || spec.role === "promo-marquee")
    return {
      en: "The Source Taster mark, two overlapping drops, next to the product name on a plain light background.",
      de: "Das Source-Taster-Zeichen, zwei sich überlagernde Tropfen, neben dem Produktnamen auf schlichtem hellem Grund.",
    };
  if (spec.role === "social")
    return {
      en: `Source Taster. ${copy.social.headline.en}. ${copy.social.caption.en}`,
      de: `Source Taster. ${copy.social.headline.de}. ${copy.social.caption.de}`,
    };
  const story = spec.story as Story;
  return storyAlt[story];
}

/** The product's own development-preview notice, verbatim from its catalogue. */
export function productNotice(locale: Locale): string {
  const messages = JSON.parse(
    readFileSync(
      new URL(`../../i18n/messages/${locale}.json`, import.meta.url),
      "utf8",
    ),
  ) as Record<string, string>;
  return messages.skeleton_notice as string;
}

export type DevPreviewNotice =
  | { carried: true; locale: Locale; text: string }
  | { carried: false; reason: string };

/**
 * The notice every image that pictures or states product behaviour carries.
 * The panel scrolls past it in two of the three stories, so the composition
 * sets the product's own text beside the capture instead of cropping or
 * editing the capture. The promo tiles state no behaviour and show the mark
 * and name only, so they record why they carry none.
 */
export function devPreviewNotice(spec: ImageSpec): DevPreviewNotice {
  if (spec.role === "promo-small" || spec.role === "promo-marquee")
    return {
      carried: false,
      reason:
        "mark and name only: the tile pictures and states no product behaviour, the Chrome Web Store advises against text in promo tiles, and the four-sentence notice cannot be read at 440×280",
    };
  const locale = spec.locale as Locale;
  return { carried: true, locale, text: productNotice(locale) };
}
