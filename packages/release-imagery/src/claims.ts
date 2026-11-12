// SPDX-License-Identifier: AGPL-3.0-or-later
// Every claim an image pictures or its copy states, tied to release evidence:
// an implementation record and the literal title of an automated test that
// exercises the behaviour on the real product. A claim without such a pair
// must not appear in any image.
import type { Locale } from "./specs.ts";

export interface Claim {
  id: string;
  text: Record<Locale, string>;
  /**
   * Reference to a release qualification that covers this behaviour, or null.
   * The behaviour is implemented and tested; none of it is qualified for release
   * (the product itself says so in its development-preview notice).
   */
  qualified: string | null;
  evidence: {
    /** Implementation record, relative to the repository root. */
    doc: string;
    /** Spec file, relative to the repository root. */
    spec: string;
    /** Literal (or literal prefix of a template) test title in `spec`. */
    title: string;
  };
}

const panel = "apps/extension/e2e/panel.spec.ts";
const workspace = "apps/web/e2e/workspace.spec.ts";
const detail = "apps/web/e2e/reference-detail.spec.ts";

export const claims: readonly Claim[] = [
  {
    id: "side-panel",
    text: {
      en: "The check workspace opens in the browser's side panel.",
      de: "Der Prüfbereich öffnet sich im Seitenbereich des Browsers.",
    },
    qualified: null,
    evidence: {
      doc: "docs/implementation/92-extension-skeleton.md",
      spec: panel,
      title:
        "the toolbar action opens the real native side panel with the shared Check workspace",
    },
  },
  {
    id: "verdict-per-reference",
    text: {
      en: "Each pasted reference receives its own verdict, in input order.",
      de: "Jede eingefügte Referenz erhält einen eigenen Befund, in Eingabereihenfolge.",
    },
    qualified: null,
    evidence: {
      doc: "docs/implementation/92-extension-skeleton.md",
      spec: panel,
      title:
        "native panel and web keep identical server outcomes for the synthetic witnesses",
    },
  },
  {
    id: "summary-counts",
    text: {
      en: "The summary counts verdicts separately from technical statuses and filters the list.",
      de: "Die Übersicht zählt Befunde getrennt von technischen Status und filtert die Liste.",
    },
    qualified: null,
    evidence: {
      doc: "docs/implementation/82-check-workspace.md",
      spec: workspace,
      title:
        "summary filters current Verdicts separately from technical Statuses",
    },
  },
  {
    id: "doi-conflict",
    text: {
      en: "A DOI conflict has its own count and filter.",
      de: "Ein DOI-Konflikt hat eine eigene Zahl und einen eigenen Filter.",
    },
    qualified: null,
    evidence: {
      doc: "docs/implementation/82-check-workspace.md",
      spec: workspace,
      title: "DOI conflict has its own current count and filter",
    },
  },
  {
    id: "best-match-comparison",
    text: {
      en: "The reference and the best match are compared side by side.",
      de: "Referenz und bester Treffer werden nebeneinander verglichen.",
    },
    qualified: null,
    evidence: {
      doc: "docs/implementation/82-check-workspace.md",
      spec: workspace,
      title: "compares Reference and server Best match side by side",
    },
  },
  {
    id: "detail-leads-with-verdict",
    text: {
      en: "The reference detail leads with the verdict and offers the evidence behind it.",
      de: "Die Detailansicht beginnt mit dem Befund und bietet die Belege dahinter.",
    },
    qualified: null,
    evidence: {
      doc: "docs/implementation/212-reference-detail.md",
      spec: detail,
      title:
        "detail leads with the effective Verdict in the documented section order",
    },
  },
  {
    id: "german-and-english",
    text: {
      en: "The panel runs in German and English.",
      de: "Der Seitenbereich läuft auf Deutsch und Englisch.",
    },
    qualified: null,
    evidence: {
      doc: "docs/implementation/92-extension-skeleton.md",
      spec: panel,
      title:
        "native panel and web keep identical server outcomes for the synthetic witnesses in",
    },
  },
];
