// SPDX-License-Identifier: AGPL-3.0-or-later
// The only importer of PDFKit (ADR-0017). The owned adapter retains semantic
// reading order while adapting the accepted record sheet to opaque paper.
import { readFileSync } from "node:fs";
import PDFDocument, { type StructElement } from "pdfkit";
import { opaque, values } from "@source-taster/design-tokens";
import type { Block, ReportModel, ReportVerdict, Section } from "./model.ts";
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
// #197 C, pinned at 267624a: 48 pt side margins and a 100 pt label
// column separated from its value by 15 pt. Keep these paper measurements
// here, rather than deriving them from the screen's spacing scale.
const PAGE = { top: 54, bottom: 54, left: 48, right: 48 } as const;
// Intentional medium mapping: PDFs always use white paper, independent of the
// application's appearance. All alpha roles come precomposited on that paper.
const paper = opaque.white;
const bodySize = 10.7;
const column = 115;
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
    color: string = paper.text,
  ) {
    const parts = runs(value, face);
    doc.x = x;
    doc.y = y;
    for (const [index, part] of parts.entries()) {
      doc
        .font(part.face)
        .fontSize(size)
        .fillColor(link ? paper["accent-text"] : color)
        .text(part.text, {
          width,
          continued: index < parts.length - 1,
          lineGap: 2,
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
  function separator(y = doc.y - 9) {
    doc.save();
    doc.markContent("Artifact", { type: "Layout" });
    doc
      .moveTo(PAGE.left, y)
      .lineTo(PAGE.left + width, y)
      .lineWidth(0.6)
      .stroke(paper.border);
    doc.endMarkedContent();
    doc.restore();
  }
  function heading(level: 1 | 2, value: string, overview = false) {
    ensureRoom(level === 1 ? 120 : 110);
    if (level === 2 && !overview) separator();
    tagged(root, `H${level}`, () =>
      write(
        value,
        "Bold",
        PAGE.left,
        doc.y,
        width,
        level === 1 ? 28 : overview ? 18 : 14,
      ),
    );
    doc.y += 7;
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
    verdict?: ReportVerdict,
  ) {
    ensureRoom(42);
    const top = doc.y;
    const pageBefore = pages;
    const paragraph = doc.struct("P");
    root.add(paragraph);
    tagged(paragraph, "Span", () =>
      write(
        label,
        "Bold",
        PAGE.left,
        top,
        100,
        9.2,
        undefined,
        paper["text-secondary"],
      ),
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
    doc.y += 9;
  }
  const paragraphStyle = (block: Extract<Block, { kind: "paragraph" }>) => {
    switch (block.appearance) {
      case "document":
        return { face: "Bold" as const, size: 13, color: paper.text };
      case "capture":
        return {
          face: "Mono" as const,
          size: 10,
          color: paper["text-secondary"],
        };
      case "snapshot":
        return { face: "Regular" as const, size: 11, color: paper.text };
      case "notice":
        return {
          face: "Regular" as const,
          size: 9.5,
          color: paper["text-muted"],
        };
      case "summary":
        return { face: "Bold" as const, size: 12, color: paper.text };
      case "manual":
        return { face: "Regular" as const, size: 9.8, color: paper.text };
      case "timestamp":
        return { face: "Mono" as const, size: 9.4, color: paper["text-muted"] };
      case "overview-note":
        return { face: "Regular" as const, size: 10.5, color: paper.text };
      default:
        return { face: "Regular" as const, size: bodySize, color: paper.text };
    }
  };
  function body(block: Block) {
    switch (block.kind) {
      case "paragraph": {
        const style = paragraphStyle(block);
        ensureRoom(block.keepWithNext ? 68 : 22);
        tagged(root, "P", () =>
          write(
            block.text,
            style.face,
            PAGE.left,
            doc.y,
            width,
            style.size,
            undefined,
            style.color,
          ),
        );
        break;
      }
      case "outcome": {
        ensureRoom(30);
        const top = doc.y;
        if (block.verdict) verdictMark(doc, block.verdict, PAGE.left, top, 15);
        tagged(root, "P", () =>
          write(
            block.text,
            "Bold",
            PAGE.left + (block.verdict ? 23 : 0),
            top,
            width - 23,
            11,
          ),
        );
        break;
      }
      case "metadata":
        ensureRoom(22);
        tagged(root, "P", () =>
          write(
            block.text,
            "Mono",
            PAGE.left,
            doc.y,
            width,
            9.3,
            undefined,
            paper["text-muted"],
          ),
        );
        break;
      case "labelled":
        field(block.label, block.text, block.face, undefined, block.verdict);
        return;
      case "counts": {
        const paired = block.items.some((item) => item.verdict);
        const columns = paired ? 2 : 1;
        const cellWidth = width / columns;
        ensureRoom(24 + Math.ceil(block.items.length / columns) * 27);
        if (!paired) {
          separator(doc.y);
          doc.y += 16;
        }
        if (block.label) {
          tagged(root, "P", () =>
            write(block.label, "Bold", PAGE.left, doc.y, width, 13),
          );
          doc.y += 7;
        }
        const start = doc.y;
        const list = doc.struct("L");
        root.add(list);
        for (const [index, item] of block.items.entries()) {
          const x = PAGE.left + (index % columns) * cellWidth;
          const top = paired ? start + Math.floor(index / columns) * 27 : doc.y;
          const entry = doc.struct("LI");
          list.add(entry);
          // The readable label carries meaning; the redundant vector is skipped.
          if (item.verdict) verdictMark(doc, item.verdict, x, top, 16);
          tagged(entry, "LBody", () =>
            write(
              item.text,
              "Regular",
              x + (paired ? 24 : 0),
              top - (paired ? 1 : 0),
              cellWidth - (paired ? 30 : 0),
              10.5,
              undefined,
              paired ? paper.text : paper["text-secondary"],
            ),
          );
          if (!paired) doc.y += 7;
          entry.end();
        }
        if (paired)
          doc.y = start + Math.ceil(block.items.length / columns) * 27 + 15;
        else doc.y += 7;
        list.end();
        return;
      }
      case "list":
        if (block.items.length) bulletList(block.items);
        break;
      case "link":
        ensureRoom(22);
        linkDescription = block.label;
        root.add(
          doc.struct("Link", { alt: block.label, lang: model.language }, () =>
            write(block.url, "Mono", PAGE.left, doc.y, width, 9.4, block.url),
          ),
        );
        break;
    }
    doc.x = PAGE.left;
    doc.y += 7;
  }
  function textHeight(
    value: string,
    face: Face,
    size: number,
    measureWidth: number,
  ) {
    return doc
      .font(face)
      .fontSize(size)
      .heightOfString(clean(value), { width: measureWidth, lineGap: 2 });
  }
  function recordHeight(value: Section) {
    let height = 60 + textHeight(value.heading, "Bold", 14, width);
    for (const block of value.blocks) {
      if (block.kind === "labelled")
        height +=
          Math.max(
            textHeight(block.label, "Bold", 9.2, 100),
            textHeight(
              block.text,
              block.face ?? "Regular",
              bodySize,
              width - column,
            ),
          ) + 9;
      else if (block.kind === "metadata" || block.kind === "link") height += 15;
      else if (block.kind === "paragraph") {
        if (block.appearance === "manual" || block.appearance === "timestamp")
          height += 21.5;
        else height += textHeight(block.text, "Regular", bodySize, width);
      } else if (block.kind === "list")
        height += block.items.reduce(
          (sum, item) =>
            sum + textHeight(item, "Regular", bodySize, width - 14) + 10,
          0,
        );
    }
    return height;
  }
  function section(value: Section, overview = false) {
    const height = overview ? 0 : recordHeight(value);
    // Keep a complete record together whenever it fits on one page. Oversize
    // production records retain normal flowing paragraphs across pages.
    if (
      !overview &&
      height < doc.page.height - 126 &&
      doc.y + height > doc.page.height - 64
    ) {
      doc.addPage();
      doc.y = 62;
    }
    const top = doc.y;
    const firstPage = pages;
    heading(2, value.heading, overview);
    for (const block of value.blocks) body(block);
    if (overview) doc.y += 8;
    else {
      if (pages === firstPage) doc.y = Math.max(doc.y, top + height - 8);
      doc.y += 16;
    }
  }
  // Real text, redundant with the footer; no brand artwork is embedded.
  doc.markContent("Artifact", { type: "Layout" });
  write("Source Taster", "Bold", PAGE.left, doc.y, width, 13);
  doc.endMarkedContent();
  doc.y = 108;
  heading(1, model.title);
  for (const block of model.front) body(block);
  doc.y += 18;
  section(model.overview, true);
  // The accepted record sheet keeps the overview separate from the records.
  if (model.references.length) {
    doc.addPage();
    doc.y = 62;
  }
  let unfinishedGroup = false;
  for (const value of model.references) {
    const outcome = value.blocks.find((block) => block.kind === "outcome");
    // #197 C begins unfinished Status records on their own page. Slot order
    // stays intact; a later Verdict is never regrouped or silently reordered.
    if (outcome && !outcome.verdict && !unfinishedGroup) {
      unfinishedGroup = true;
      if (doc.y > 70) {
        doc.addPage();
        doc.y = 62;
      }
    }
    section(value);
  }
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
      "Regular",
      PAGE.left,
      doc.page.height - 32,
      width,
      8.5,
      undefined,
      paper["text-muted"],
    );
    doc.endMarkedContent();
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return finished;
}
