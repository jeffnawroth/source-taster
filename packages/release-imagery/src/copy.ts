// SPDX-License-Identifier: AGPL-3.0-or-later
// Release copy and accessible descriptions, German and English. The voice
// follows docs/design/voice-and-tone.md: calm, evidence first, no hype words,
// formal German, labels as in GLOSSARY.md. Every sentence states only what a
// claim in claims.ts backs.
import type { ImageSpec, Locale, Story } from "./specs.ts";

type Text = Record<Locale, string>;
interface Entry {
  headline: Text;
  caption: Text;
}

export const copy: Record<Story | "social", Entry> = {
  workspace: {
    headline: {
      en: "Paste References. Check them.",
      de: "Referenzen einfügen und prüfen",
    },
    caption: {
      en: "Paste your reference list into the side panel. Each Reference is checked on its own.",
      de: "Fügen Sie Ihre Literaturliste in den Seitenbereich ein. Jede Referenz wird einzeln geprüft.",
    },
  },
  overview: {
    headline: {
      en: "One Verdict per Reference",
      de: "Ein Befund pro Referenz",
    },
    caption: {
      en: "The summary counts Verdicts apart from technical Statuses, so a failed lookup is not read as a finding.",
      de: "Die Übersicht zählt Befunde getrennt von technischen Status. Ein Ausfall gilt nicht als Befund.",
    },
  },
  evidence: {
    headline: {
      en: "The evidence behind it",
      de: "Die Belege dahinter",
    },
    caption: {
      en: "The detail starts with the Verdict, compares Reference and Best match, and marks a suggested correction.",
      de: "Die Detailansicht beginnt mit dem Befund, vergleicht Referenz und besten Treffer und markiert den Korrekturvorschlag.",
    },
  },
  social: {
    headline: {
      en: "Check References against sources",
      de: "Referenzen mit Quellen abgleichen",
    },
    caption: {
      en: "Source Taster compares each Reference with public sources and shows the evidence. The decision stays with you.",
      de: "Source Taster gleicht jede Referenz mit öffentlichen Quellen ab und zeigt die Belege. Entscheiden Sie selbst.",
    },
  },
};

const storyClaims: Record<Story, string[]> = {
  workspace: ["side-panel", "verdict-per-reference", "german-and-english"],
  overview: ["verdict-per-reference", "summary-counts", "doi-conflict"],
  evidence: [
    "detail-leads-with-verdict",
    "best-match-comparison",
    "suggestion-marked",
  ],
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
    en: "The Source Taster side panel next to a browser page, with three pasted References in the input field and the Check reference button below.",
    de: "Der Source-Taster-Seitenbereich neben einer Browserseite, mit drei eingefügten Referenzen im Eingabefeld und der Schaltfläche Referenz prüfen darunter.",
  },
  overview: {
    en: "The Source Taster summary with one count for each Verdict, above a list of three References. They carry the Verdicts Correct, Exists, with deviations and DOI conflict, each with a symbol and a label.",
    de: "Die Source-Taster-Übersicht mit je einer Zahl pro Befund über einer Liste aus drei Referenzen. Sie tragen die Befunde Korrekt, Existiert, mit Abweichungen und DOI-Konflikt, jeweils mit Symbol und Beschriftung.",
  },
  evidence: {
    en: "The detail of one Reference. It starts with the Verdict Exists, with deviations, compares the Reference with the Best match field by field, and shows a Correction suggestion with the changed words marked.",
    de: "Die Detailansicht einer Referenz. Sie beginnt mit dem Befund Existiert, mit Abweichungen, vergleicht die Referenz Feld für Feld mit dem besten Treffer und zeigt einen Korrekturvorschlag mit markierten Änderungen.",
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
