// SPDX-License-Identifier: AGPL-3.0-or-later
// The only importer of PDFKit (ADR-0017). The owned adapter retains semantic
// reading order while adapting the accepted record sheet to opaque paper.
import { readFileSync } from "node:fs";
import PDFDocument, { type StructElement } from "pdfkit";
import { opaque, values } from "@source-taster/design-tokens";
import type { Block, ReportModel, Section } from "./model.ts";
import { verdictMark } from "./verdict-mark.ts";

export type ReportFailureCode = "unsupported-character" | "limit-exceeded";
export class ReportError extends Error {
  readonly code: ReportFailureCode;
  constructor(code: ReportFailureCode) {
    super(code);
    this.code = code;
  }
}
export const maxPages = 2500;
const PAGE = { top: 56, bottom: 64, left: 56, right: 56 } as const;
// Intentional medium mapping: PDFs always use white paper, independent of the
// application's appearance. All alpha roles come precomposited on that paper.
const paper = opaque.white;
const bodySize = 10.7;
const column = 148;
const fontFiles = {
  Regular: "Atkinson-Regular.ttf",
  Bold: "Atkinson-Bold.ttf",
  Italic: "Atkinson-Italic.ttf",
  Mono: "PlexMono-Regular.ttf",
  NotoRegular: "NotoSans-Regular.ttf",
  NotoBold: "NotoSans-Bold.ttf",
  NotoItalic: "NotoSans-Italic.ttf",
} as const;
type Face = keyof typeof fontFiles;
const fonts = new Map<string, Uint8Array>();
function font(name: Face) {
  let data = fonts.get(name);
  if (!data) {
    data = readFileSync(new URL(`./fonts/${fontFiles[name]}`, import.meta.url));
    fonts.set(name, data);
  }
  return data;
}
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
    info: { Creator: "Source Taster" },
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
  for (const name of Object.keys(fontFiles) as Face[])
    doc.registerFont(name, font(name));
  const faces = new Map(
    (Object.keys(fontFiles) as Face[]).map((name) => {
      const face = doc.font(name)._font?.font;
      if (!face) throw new Error("font-unavailable");
      return [name, face];
    }),
  );
  const graphemes = new Intl.Segmenter(model.language, {
    granularity: "grapheme",
  });
  // Keep a combining sequence in one face. A font is selected only when it
  // maps every code point; an impossible sequence fails the complete job.
  function runs(value: string, face: Face) {
    const fallback: Face =
      face === "Bold"
        ? "NotoBold"
        : face === "Italic"
          ? "NotoItalic"
          : "NotoRegular";
    const out: { text: string; face: Face }[] = [];
    for (const { segment } of graphemes.segment(clean(value))) {
      const covers = (name: Face) =>
        [...segment].every(
          (c) =>
            c === "\n" ||
            faces.get(name)!.hasGlyphForCodePoint(c.codePointAt(0)!),
        );
      const selected = covers(face) ? face : covers(fallback) ? fallback : null;
      if (!selected) throw new ReportError("unsupported-character");
      const last = out.at(-1);
      if (last?.face === selected) last.text += segment;
      else out.push({ text: segment, face: selected });
    }
    return out;
  }
  // Every wrapped run shares the enclosing structure closure, including when
  // PDFKit adds pages. No visible text is attached as a finished content ref.
  function write(
    value: string,
    face: Face,
    x: number,
    y: number,
    width: number,
    size = bodySize,
    link?: string,
  ) {
    const parts = runs(value, face);
    doc.x = x;
    doc.y = y;
    for (const [index, part] of parts.entries()) {
      doc
        .font(part.face)
        .fontSize(size)
        .fillColor(link ? paper["accent-text"] : paper.text)
        .text(part.text, {
          width,
          continued: index < parts.length - 1,
          lineGap: 2.5,
          ...(link ? { link, underline: true } : {}),
        });
    }
  }
  doc.info.Title = runs(model.metaTitle, "Regular")
    .map((r) => r.text)
    .join("");
  const root = doc.struct("Document", { lang: model.language });
  doc.addStructure(root);
  const width = doc.page.width - PAGE.left - PAGE.right;
  const ensureRoom = (height: number) => {
    if (doc.y + height > doc.page.height - PAGE.bottom) doc.addPage();
    doc.x = PAGE.left;
  };
  function tagged(parent: StructElement, type: string, draw: () => void) {
    parent.add(doc.struct(type, { lang: model.language }, draw));
  }
  let linkDescription = "";
  const pdfkitLink = doc.link.bind(doc);
  doc.link = (x, y, w, h, url, options) =>
    pdfkitLink(x, y, w, h, url, {
      ...options,
      ...(options?.structParent
        ? { Contents: new String(linkDescription) }
        : {}),
    });
  function separator() {
    doc.save();
    doc.markContent("Artifact", { type: "Layout" });
    doc
      .moveTo(PAGE.left, doc.y)
      .lineTo(PAGE.left + width, doc.y)
      .lineWidth(0.6)
      .stroke(paper["border-strong"]);
    doc.endMarkedContent();
    doc.restore();
    doc.y += 12;
  }
  function heading(level: 1 | 2, value: string) {
    ensureRoom(level === 1 ? 120 : 110);
    if (level === 2) separator();
    tagged(root, `H${level}`, () =>
      write(value, "Bold", PAGE.left, doc.y, width, level === 1 ? 24 : 14),
    );
    doc.y += 8;
  }
  function bulletList(items: string[]) {
    const list = doc.struct("L");
    root.add(list);
    for (const item of items) {
      ensureRoom(22);
      const top = doc.y;
      const entry = doc.struct("LI");
      list.add(entry);
      tagged(entry, "Lbl", () => {
        doc.circle(PAGE.left + 2, top + 6, 1.6).fill(paper.text);
      });
      tagged(entry, "LBody", () =>
        write(item, "Regular", PAGE.left + 14, top, width - 14),
      );
      doc.y += 3;
      doc.x = PAGE.left;
      entry.end();
    }
    list.end();
  }
  function field(
    label: string,
    value: string,
    face: Face = "Regular",
    link?: string,
    verdict?: import("./model.ts").ReportVerdict,
  ) {
    ensureRoom(42);
    const top = doc.y;
    const pageBefore = pages;
    const paragraph = doc.struct("P");
    root.add(paragraph);
    tagged(paragraph, "Span", () =>
      write(`${label}:`, "Bold", PAGE.left, top, column - 16),
    );
    const labelBottom = doc.y;
    const x = PAGE.left + column;
    if (verdict) verdictMark(doc, verdict, x, top - 1);
    const indent = verdict ? 22 : 0;
    const size =
      face === "Mono" ? bodySize * Number(values["font-mono-scale"]) : bodySize;
    if (link) {
      linkDescription = label;
      paragraph.add(
        doc.struct("Link", { alt: label, lang: model.language }, () =>
          write(value, face, x, top, width - column, size, link),
        ),
      );
    } else
      tagged(paragraph, "Span", () =>
        write(value, face, x + indent, top, width - column - indent, size),
      );
    // If the content crossed a page, the label's old page coordinate must not
    // create a spurious blank region on the continuation page.
    if (pages === pageBefore) doc.y = Math.max(doc.y, labelBottom);
    paragraph.end();
    doc.x = PAGE.left;
  }
  function body(block: Block) {
    switch (block.kind) {
      case "paragraph":
        ensureRoom(22);
        tagged(root, "P", () =>
          write(block.text, "Regular", PAGE.left, doc.y, width),
        );
        break;
      case "labelled":
        field(block.label, block.text, block.face, undefined, block.verdict);
        break;
      case "counts": {
        ensureRoom(24 + block.items.length * 21);
        tagged(root, "P", () =>
          write(block.label, "Bold", PAGE.left, doc.y, width),
        );
        doc.y += 5;
        const list = doc.struct("L");
        root.add(list);
        for (const item of block.items) {
          ensureRoom(21);
          const top = doc.y;
          const entry = doc.struct("LI");
          list.add(entry);
          // The readable label carries meaning; the redundant vector is skipped.
          if (item.verdict) verdictMark(doc, item.verdict, PAGE.left, top - 1);
          tagged(entry, "LBody", () =>
            write(item.text, "Regular", PAGE.left + 22, top, width - 22),
          );
          doc.y += 5;
          entry.end();
        }
        list.end();
        break;
      }
      case "list":
        if (block.items.length) bulletList(block.items);
        break;
      case "link":
        field(block.label, block.url, "Mono", block.url);
        break;
    }
    doc.x = PAGE.left;
    doc.y += 6;
  }
  function section(value: Section) {
    heading(2, value.heading);
    for (const block of value.blocks) body(block);
    doc.y += 8;
  }
  // Real text, redundant with the footer; no brand artwork is embedded.
  doc.markContent("Artifact", { type: "Layout" });
  write("Source Taster", "Bold", PAGE.left, doc.y, width, 11);
  doc.endMarkedContent();
  doc.y += 12;
  heading(1, model.title);
  for (const block of model.front) body(block);
  section(model.overview);
  for (const value of model.references) section(value);
  root.end();
  const range = doc.bufferedPageRange();
  for (let index = 0; index < range.count; index++) {
    doc.switchToPage(range.start + index);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.markContent("Artifact", { type: "Pagination" });
    // White paper is the physical medium; do not paint an application canvas.
    write(
      `${model.footer} · ${model.pageLabel(index + 1, range.count)}`,
      "Mono",
      PAGE.left,
      doc.page.height - 40,
      width,
      8,
    );
    doc.endMarkedContent();
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return finished;
}
