// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Language } from "./metadata.ts";
export const sourceAccess = {
  en: {
    title: "Search licenses and source",
    description:
      "Licenses, notices and source downloads for the local documentation search.",
    summary:
      "Modified Pagefind 1.5.2 browser search. Includes GPL-covered pagefind_microjson 0.1.4 and MIT-covered Pagefind and fflate-derived code. This preview awaits concrete legal review.",
    source: "Download Corresponding Source and build scripts",
    gpl: "GNU GPL version 3",
    notice: "Copyright and third-party notices",
    rust: "Rust standard library copyright report",
    manifest: "Exact distributed object and source hashes",
  },
  de: {
    title: "Suchlizenzen und Quellcode",
    description:
      "Lizenzen, Hinweise und Quellcode zum Herunterladen für die lokale Dokumentationssuche.",
    summary:
      "Modifizierte Browsersuche mit Pagefind 1.5.2. Enthält pagefind_microjson 0.1.4 unter der GPL sowie Pagefind und von fflate abgeleiteten Code unter der MIT-Lizenz. Die konkrete rechtliche Prüfung dieser Vorschau steht noch aus.",
    source: "Korrespondierenden Quellcode und Build-Skripte herunterladen",
    gpl: "GNU GPL Version 3",
    notice: "Urheberrechts- und Drittlizenzhinweise",
    rust: "Urheberrechtsbericht der Rust-Standardbibliothek",
    manifest: "Exakte Prüfsummen der ausgelieferten Dateien und Quellen",
  },
} satisfies Record<Language, Record<string, string>>;
