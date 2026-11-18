// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Language } from "./content.ts";

export const guideNavigation = {
  en: {
    "how-the-check-works": {
      question: "What do the verdicts mean?",
      sections: [
        "The current checking path",
        "Status and verdict",
        "Human judgment",
      ],
    },
    structuring: {
      question: "How do I structure references?",
      sections: [
        "Input and fields",
        "Structuring is separate from checking",
        "Scope and limits",
      ],
    },
    preferences: {
      question: "How do I change language and style?",
      sections: ["In the workspace", "Existing checks", "On this website"],
    },
    "errors-and-retry": {
      question: "What if my connection fails?",
      sections: ["Check your connection", "Reconnecting", "Trying again"],
    },
    availability: {
      question: "What is available today?",
      sections: [
        "Checking and extension",
        "Account and purchases",
        "History and storage",
      ],
    },
  },
  de: {
    "how-the-check-works": {
      question: "Was bedeuten die Befunde?",
      sections: [
        "Der aktuelle Prüfpfad",
        "Status und Befund",
        "Menschliche Beurteilung",
      ],
    },
    structuring: {
      question: "Wie strukturiere ich Referenzen?",
      sections: [
        "Eingabe und Felder",
        "Strukturieren ist keine Prüfung",
        "Umfang und Grenzen",
      ],
    },
    preferences: {
      question: "Wie ändere ich Sprache und Stil?",
      sections: [
        "Im Arbeitsbereich",
        "Bestehende Prüfungen",
        "Auf dieser Website",
      ],
    },
    "errors-and-retry": {
      question: "Was tun bei Verbindungsfehlern?",
      sections: [
        "Verbindung prüfen",
        "Verbindung wiederherstellen",
        "Erneut versuchen",
      ],
    },
    availability: {
      question: "Was ist bereits verfügbar?",
      sections: [
        "Prüfung und Erweiterung",
        "Account und Käufe",
        "Verlauf und Speicherung",
      ],
    },
  },
} satisfies Record<
  Language,
  Record<string, { question: string; sections: string[] }>
>;

export type GuideId = keyof typeof guideNavigation.en;
