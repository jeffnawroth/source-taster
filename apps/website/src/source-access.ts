// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Language } from "./metadata.ts";
export const sourceAccess = {
  en: {
    title: "Search licenses and source",
    description:
      "Licenses, notices and source downloads for the local documentation search.",
    summary:
      "Modified Pagefind 1.6.0 browser search. Includes MIT-covered Pagefind and fflate-derived code and permissively licensed Rust crates; no GPL-covered component is linked. This preview awaits concrete legal review.",
    source: "Download Corresponding Source and build scripts",
    notice: "Copyright and third-party notices",
    rust: "Rust standard library copyright report",
    manifest: "Exact distributed object and source hashes",
  },
  de: {
    title: "Suchlizenzen und Quellcode",
    description:
      "Lizenzen, Hinweise und Quellcode zum Herunterladen für die lokale Dokumentationssuche.",
    summary:
      "Modifizierte Browsersuche mit Pagefind 1.6.0. Enthält Pagefind und von fflate abgeleiteten Code unter der MIT-Lizenz sowie permissiv lizenzierte Rust-Crates; keine GPL-Komponente ist eingebunden. Die konkrete rechtliche Prüfung dieser Vorschau steht noch aus.",
    source: "Korrespondierenden Quellcode und Build-Skripte herunterladen",
    notice: "Urheberrechts- und Drittlizenzhinweise",
    rust: "Urheberrechtsbericht der Rust-Standardbibliothek",
    manifest: "Exakte Prüfsummen der ausgelieferten Dateien und Quellen",
  },
} satisfies Record<Language, Record<string, string>>;
