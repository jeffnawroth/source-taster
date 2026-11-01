// SPDX-License-Identifier: AGPL-3.0-or-later
// The only importer of PDFKit (ADR-0017). Lays a ReportModel out as a tagged
// PDF with embedded local fonts. No engine switch exists: when an accessibility
// gate fails, the report fails.
import { readFileSync } from "node:fs";
import PDFDocument from "pdfkit";
import type { Block, ReportModel, Section } from "./model.ts";

export type ReportFailureCode = "unsupported-character" | "limit-exceeded";
export class ReportError extends Error {
  readonly code: ReportFailureCode;
  constructor(code: ReportFailureCode) {
    super(code);
    this.code = code;
  }
}
/** A report longer than this is refused rather than half-delivered. */
export const maxPages = 2500;
const PAGE = { top: 56, bottom: 64, left: 56, right: 56 } as const;
const fontFiles = {
  Regular: "NotoSans-Regular.ttf",
  Bold: "NotoSans-Bold.ttf",
  Italic: "NotoSans-Italic.ttf",
} as const;
// Loaded from the package, never from a network or the host's font set.
const fonts = new Map<string, Uint8Array>();
function font(name: keyof typeof fontFiles) {
  let data = fonts.get(name);
  if (!data) {
    data = readFileSync(new URL(`./fonts/${fontFiles[name]}`, import.meta.url));
    fonts.set(name, data);
  }
  return data;
}
// Zero-width and bidirectional formatting characters have no glyph and no
// reading value; control characters other than the line break are noise.
const removable = /[\p{Cc}--[\n]]|\p{Default_Ignorable_Code_Point}/gv;
export function clean(text: string) {
  return text
    .replace(/\r\n?/gu, "\n")
    .replace(/\t/gu, " ")
    .replace(removable, "");
}

export async function renderPdf(model: ReportModel): Promise<Uint8Array> {
  const doc = new PDFDocument({
    size: "A4",
    margins: PAGE,
    tagged: true,
    lang: model.language,
    displayTitle: true,
    bufferPages: true,
    pdfVersion: "1.7",
    info: {
      Creator: "Source Taster",
    },
  });
  const chunks: Uint8Array[] = [];
  const finished = new Promise<Uint8Array>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  let pages = 1;
  doc.on("pageAdded", () => {
    if (++pages > maxPages) throw new ReportError("limit-exceeded");
  });
  for (const [name] of Object.entries(fontFiles))
    doc.registerFont(name, font(name as keyof typeof fontFiles));

  // No placeholder boxes: every code point must exist in every embedded face.
  const faces = (["Regular", "Bold", "Italic"] as const).map((name) => {
    const face = doc.font(name)._font?.font;
    if (!face) throw new Error("font-unavailable");
    return face;
  });
  function text(value: string) {
    const out = clean(value);
    for (const char of out) {
      if (char === "\n") continue;
      const point = char.codePointAt(0)!;
      if (!faces.every((face) => face.hasGlyphForCodePoint(point)))
        throw new ReportError("unsupported-character");
    }
    return out;
  }

  // Viewers show this title (DisplayDocTitle) instead of the file name.
  doc.info.Title = text(model.metaTitle);
  const root = doc.struct("Document");
  doc.addStructure(root);
  const width = doc.page.width - PAGE.left - PAGE.right;
  const ensureRoom = (height: number) => {
    if (doc.y + height > doc.page.height - PAGE.bottom) doc.addPage();
  };

  function heading(level: 1 | 2, value: string) {
    // A heading is never the last line of a page.
    ensureRoom(level === 1 ? 120 : 110);
    doc
      .font("Bold")
      .fontSize(level === 1 ? 20 : 14)
      .fillColor("#000000")
      .text(text(value), {
        structParent: root,
        structType: `H${level}`,
        width,
      });
    doc.moveDown(0.4);
  }
  function body(block: Block) {
    doc.fontSize(10.5).fillColor("#000000");
    switch (block.kind) {
      case "paragraph":
        doc
          .font("Regular")
          .text(text(block.text), { structParent: root, width });
        break;
      case "labelled":
        doc.font("Bold").text(`${text(block.label)}: `, {
          structParent: root,
          structType: "P",
          continued: true,
          width,
        });
        doc.font("Regular").text(text(block.text), { continued: false, width });
        break;
      case "list": {
        if (!block.items.length) return;
        const list = doc.struct("L");
        root.add(list);
        doc.font("Regular").list(block.items.map(text), {
          structParent: list,
          bulletRadius: 1.6,
          bulletIndent: 6,
          textIndent: 14,
          width,
        });
        list.end();
        break;
      }
      case "link": {
        const paragraph = doc.struct("P");
        root.add(paragraph);
        doc.font("Bold").text(`${text(block.label)}: `, {
          structParent: paragraph,
          structType: "Span",
          continued: true,
          width,
        });
        doc.font("Regular").fillColor("#0b3d91").text(block.url, {
          structParent: paragraph,
          structType: "Link",
          link: block.url,
          underline: true,
          continued: false,
          width,
        });
        paragraph.end();
        break;
      }
    }
    doc.moveDown(0.5);
  }
  function section(value: Section) {
    heading(2, value.heading);
    for (const block of value.blocks) body(block);
    doc.moveDown(0.6);
  }

  heading(1, model.title);
  for (const block of model.front) body(block);
  section(model.overview);
  for (const value of model.references) section(value);
  root.end();

  // Page furniture is an Artifact: screen readers skip it.
  const range = doc.bufferedPageRange();
  for (let index = 0; index < range.count; index++) {
    doc.switchToPage(range.start + index);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.markContent("Artifact", { type: "Pagination" });
    doc
      .font("Regular")
      .fontSize(8.5)
      .fillColor("#444444")
      .text(
        text(`${model.footer} · ${model.pageLabel(index + 1, range.count)}`),
        PAGE.left,
        doc.page.height - 40,
        { width, align: "center", lineBreak: false },
      );
    doc.endMarkedContent();
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return finished;
}
