// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Language } from "./content.ts";

export const guideNavigation = {
  en: {
    "how-the-check-works": {
      question: "What does a verdict tell me?",
      sections: [
        "The local DOI preview",
        "Status, verdict and human decision",
        "Limits of this development version",
      ],
    },
    structuring: {
      question: "How can I structure a bibliography?",
      sections: [
        "From references to fields",
        "Original text and uncertain fields",
        "Supported input and limits",
      ],
    },
    preferences: {
      question: "How do I choose language and citation style?",
      sections: [
        "Preferences in the web workspace",
        "Existing checks stay unchanged",
        "Language on this website",
      ],
    },
    "errors-and-retry": {
      question: "What can I do after a connection error?",
      sections: [
        "Check the local connection",
        "Progress and reconnection",
        "Retrying and support",
      ],
    },
    availability: {
      question: "What is available now?",
      sections: [
        "Development paths and release limits",
        "Accounts and paid features",
        "History and retention",
      ],
    },
  },
  de: {
    "how-the-check-works": {
      question: "Was sagt ein Befund aus?",
      sections: [
        "Die lokale DOI-Vorschau",
        "Status, Befund und menschliche Entscheidung",
        "Grenzen dieser Entwicklungsversion",
      ],
    },
    structuring: {
      question: "Wie strukturiere ich ein Literaturverzeichnis?",
      sections: [
        "Von Referenzen zu Feldern",
        "Originaltext und unsichere Felder",
        "Unterstützte Eingaben und Grenzen",
      ],
    },
    preferences: {
      question: "Wie wähle ich Sprache und Zitierstil?",
      sections: [
        "Einstellungen im Web-Arbeitsbereich",
        "Bestehende Prüfungen bleiben unverändert",
        "Sprache auf dieser Website",
      ],
    },
    "errors-and-retry": {
      question: "Was kann ich bei einem Verbindungsfehler tun?",
      sections: [
        "Lokale Verbindung prüfen",
        "Fortschritt und erneute Verbindung",
        "Erneuter Versuch und Support",
      ],
    },
    availability: {
      question: "Was ist jetzt verfügbar?",
      sections: [
        "Entwicklungsfunktionen und Veröffentlichungsgrenzen",
        "Konten und kostenpflichtige Funktionen",
        "Verlauf und Aufbewahrung",
      ],
    },
  },
} satisfies Record<
  Language,
  Record<string, { question: string; sections: string[] }>
>;

export type GuideId = keyof typeof guideNavigation.en;
