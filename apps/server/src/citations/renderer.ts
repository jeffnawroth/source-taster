// SPDX-License-Identifier: AGPL-3.0-or-later
// The only citeproc-js boundary. No renderer or CSL asset enters a client/contract.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  clipboardHtml,
  rtfParagraph,
  type BibliographyLayout,
} from "./formatting.ts";
import manifest from "./assets/manifest.json" with { type: "json" };
import type { Csl } from "@source-taster/core";
import type { CitationStyle } from "@source-taster/contract-verification/bibliography";
type RenderItem = Omit<Csl, "issued"> & {
  id: string;
  number?: string;
  issued?: { literal: string } | { "date-parts": number[][] };
};
interface BibliographyOptions extends BibliographyLayout {
  entry_ids: string[][];
  bibstart: string;
  bibend: string;
  bibliography_errors: unknown[];
}
interface Engine {
  setOutputFormat(format: "text" | "rtf" | "html"): void;
  updateItems(ids: string[]): void;
  makeBibliography(): [BibliographyOptions, string[]] | false;
}
// citeproc has no maintained declarations. Keep this small, owned, typed port.
const CSL = createRequire(import.meta.url)("citeproc") as {
  Engine: new (
    sys: {
      retrieveItem(id: string): RenderItem;
      retrieveLocale(locale: string): string;
    },
    style: string,
    locale: string,
    forceLocale: boolean,
  ) => Engine;
};
const assets = new Map(
  Object.entries(manifest.files).map(([file, pin]) => {
    const bytes = readFileSync(new URL(`./assets/${file}`, import.meta.url));
    if (createHash("sha256").update(bytes).digest("hex") !== pin.sha256)
      throw new Error("citation-asset-integrity");
    return [file, bytes.toString("utf8")];
  }),
);
export const rendererVersion = `citeproc-${manifest.citeproc}:styles-${manifest.stylesCommit}:locales-${manifest.localesCommit}:adapter-2`;
export function rtfDocument(body: string) {
  return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs24 ${body}}`;
}
export function escapeRtf(text: string) {
  return text.replace(/[\\{}\n\r\t\u0080-\uffff]/g, (char) => {
    if (char === "\n") return "\\line ";
    if (char === "\r") return "";
    if (char === "\t") return "\\tab ";
    const code = char.charCodeAt(0);
    return code > 127
      ? `\\uc1\\u${code > 32767 ? code - 65536 : code}?`
      : `\\${char}`;
  });
}
export function render(items: Csl[], style: CitationStyle, single = false) {
  if (!items.length)
    return {
      text: "",
      rtfBody: "",
      html: "",
      entries: [] as { text: string; rtfBody: string; html: string }[],
    };
  const pin = manifest.styles[style];
  let xml = assets.get(pin.file)!;
  // Standalone entries share one engine without cross-entry changes.
  if (single)
    xml = xml
      .replace(
        /<text\b[^>]*\bvariable="(?:citation-number|year-suffix)"[^>]*\/>/gu,
        "",
      )
      .replace(/disambiguate-add-(?:year-suffix|givenname|names)="true"/gu, "")
      .replace(/subsequent-author-substitute(?:-rule)?="[^"]*"/gu, "");
  const records = new Map(
    items.map((item, index) => {
      const iso = item.issued?.literal.match(
        /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/u,
      );
      const issued = iso
        ? { "date-parts": [iso.slice(1).filter(Boolean).map(Number)] }
        : item.issued;
      // citeproc's CSL styles use `number` for an article locator. Keep the
      // canonical article-number separate from page ranges in stored fields.
      return [
        String(index),
        { ...item, number: item["article-number"], issued, id: String(index) },
      ] as const;
    }),
  );
  const engine = new CSL.Engine(
    {
      retrieveItem: (id) => records.get(id)!,
      retrieveLocale: (locale) =>
        assets.get(`locales-${locale}.xml`) ?? assets.get("locales-en-US.xml")!,
    },
    xml,
    pin.locale,
    true,
  );
  function output(format: "text" | "rtf" | "html") {
    engine.setOutputFormat(format);
    engine.updateItems([...records.keys()]);
    const result = engine.makeBibliography();
    if (!result || result[0].bibliography_errors.length)
      throw new Error("citation-rendering-failed");
    const [layout, values] = result;
    return values.map((entry, index) => ({
      id: layout.entry_ids[index]![0]!,
      value:
        format === "rtf"
          ? rtfParagraph(entry.trim(), layout)
          : format === "html"
            ? clipboardHtml(entry.trim(), layout)
            : entry.trim(),
    }));
  }
  const text = output("text"),
    rtf = output("rtf"),
    html = output("html");
  const entries = [...records.keys()].map((id) => ({
    text: text.find((entry) => entry.id === id)!.value,
    rtfBody: rtf.find((entry) => entry.id === id)!.value,
    html: html.find((entry) => entry.id === id)!.value,
  }));
  return {
    text: text.map((entry) => entry.value).join("\n"),
    rtfBody: rtf.map((entry) => entry.value).join("\n"),
    html: html.map((entry) => entry.value).join("\n"),
    entries,
  };
}
