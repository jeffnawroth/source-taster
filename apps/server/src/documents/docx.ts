// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0011's owned adapter over JSZip/saxes. Every actually expanded byte in
// every member counts, including unused media. Never follow relationships.
import JSZip from "jszip";
import { SaxesParser } from "saxes";
import { Rejected } from "./rejected.ts";
type Budget = { left: number };

async function inflate(
  zip: JSZip,
  name: string,
  budget: Budget,
  visit: (bytes: Uint8Array) => void,
): Promise<boolean> {
  const file = zip.file(name);
  if (!file) return false;
  await new Promise<void>((resolve, reject) => {
    // JSZip's file-level incremental method is missing from its declarations.
    const stream = (
      file as unknown as {
        internalStream(type: "uint8array"): JSZip.JSZipStreamHelper<Uint8Array>;
      }
    ).internalStream("uint8array");
    stream
      .on("data", (chunk) => {
        budget.left -= chunk.byteLength;
        try {
          if (budget.left < 0) throw new Rejected("expansion-limit");
          visit(chunk);
        } catch (error) {
          stream.pause();
          reject(
            error instanceof Error ? error : new Error("Unreadable document"),
          );
        }
      })
      .on("error", reject)
      .on("end", resolve)
      .resume();
  });
  return true;
}

async function readXml(
  zip: JSZip,
  name: string,
  budget: Budget,
  visit: {
    open?: (name: string, attributes: Record<string, string>) => void;
    close?: (name: string) => void;
    text?: (text: string) => void;
  },
): Promise<boolean> {
  const parser = new SaxesParser({ xmlns: true });
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let failure: Error | undefined;
  parser.on("error", (error) => {
    failure ??= error;
  });
  // DOCX never needs a DTD. Reject it rather than accepting entity declarations.
  parser.on("doctype", () => {
    throw new Rejected("unreadable");
  });
  const word = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  parser.on("opentag", (tag) => {
    if (tag.uri !== word) return;
    visit.open?.(
      `w:${tag.local}`,
      Object.fromEntries(
        Object.values(tag.attributes)
          .filter((attribute) => attribute.uri === word)
          .map((attribute) => [`w:${attribute.local}`, attribute.value]),
      ),
    );
  });
  parser.on("closetag", (tag) => {
    if (tag.uri === word) visit.close?.(`w:${tag.local}`);
  });
  if (visit.text) parser.on("text", visit.text);
  const found = await inflate(zip, name, budget, (chunk) => {
    parser.write(decoder.decode(chunk, { stream: true }));
    if (failure) throw failure;
  });
  if (!found) return false;
  parser.write(decoder.decode()).close();
  if (failure) throw failure;
  return true;
}

export async function extractDocx(
  bytes: Uint8Array,
  expandedBytes: number,
): Promise<{ text: string; partialNoText: false }> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(bytes, { checkCRC32: false });
  } catch {
    throw new Rejected("unreadable");
  }
  const budget = { left: expandedBytes };
  const levels = new Map<
    string,
    { format: string; start: number; kind: string }
  >();
  const numbering = new Map<string, string>();
  let abstract = "",
    level = "",
    num = "";
  await readXml(zip, "word/numbering.xml", budget, {
    open(name, attributes) {
      const value = attributes["w:val"] ?? "";
      if (name === "w:abstractNum")
        abstract = attributes["w:abstractNumId"] ?? "";
      if (name === "w:lvl") {
        level = `${abstract}:${attributes["w:ilvl"] ?? "0"}`;
        levels.set(level, { format: "%1.", start: 1, kind: "decimal" });
      }
      if (name === "w:lvlText" && levels.has(level))
        levels.get(level)!.format = value;
      if (name === "w:start" && levels.has(level))
        levels.get(level)!.start = Number(value) || 1;
      if (name === "w:numFmt" && levels.has(level))
        levels.get(level)!.kind = value;
      if (name === "w:num") num = attributes["w:numId"] ?? "";
      if (name === "w:abstractNumId") numbering.set(num, value);
    },
  });
  const lines: string[] = [];
  const counters = new Map<string, number>();
  let paragraph: string[] | undefined;
  let inText = false,
    list = "",
    depth = "0",
    indent = 0;
  const found = await readXml(zip, "word/document.xml", budget, {
    open(name, attributes) {
      if (name === "w:p") {
        paragraph = [];
        list = "";
        depth = "0";
        indent = 0;
      } else if (name === "w:t") inText = true;
      else if (name === "w:tab") paragraph?.push("\t");
      else if (name === "w:br" || name === "w:cr") paragraph?.push("\n");
      else if (name === "w:numId") list = attributes["w:val"] ?? "";
      else if (name === "w:ilvl") depth = attributes["w:val"] ?? "0";
      else if (name === "w:ind")
        indent = Math.min(
          16,
          Math.max(
            0,
            Math.floor(
              Number(attributes["w:left"] ?? attributes["w:start"] ?? 0) / 720,
            ),
          ),
        );
    },
    close(name) {
      if (name === "w:t") inText = false;
      else if (name === "w:p" && paragraph) {
        const definition = levels.get(`${numbering.get(list)}:${depth}`);
        let prefix = "";
        if (definition) {
          const key = `${list}:${depth}`;
          const count = counters.get(key) ?? definition.start;
          counters.set(key, count + 1);
          prefix =
            definition.kind === "bullet"
              ? `${definition.format} `
              : `${definition.format.replace(/%\d/g, String(count))} `;
        }
        lines.push("\t".repeat(indent) + prefix + paragraph.join(""));
        paragraph = undefined;
      }
    },
    text(text) {
      if (inText) paragraph?.push(text);
    },
  });
  if (!found) throw new Rejected("unsupported");
  // Footnotes are read/validated but never mixed into bibliography input. This
  // also avoids treating a footnote-only Reference as a bibliography entry.
  await readXml(zip, "word/footnotes.xml", budget, {});
  for (const file of Object.values(zip.files))
    if (
      !file.dir &&
      ![
        "word/document.xml",
        "word/numbering.xml",
        "word/footnotes.xml",
      ].includes(file.name)
    )
      await inflate(zip, file.name, budget, () => {});
  const text = lines.join("\n");
  if (!text.trim()) throw new Rejected("no-text");
  return { text, partialNoText: false };
}
