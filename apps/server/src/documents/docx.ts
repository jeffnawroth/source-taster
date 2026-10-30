// SPDX-License-Identifier: AGPL-3.0-or-later
// The owned DOCX adapter of ADR-0011 over JSZip 3 and saxes 6. Parts are
// inflated as streams and every expanded byte counts against one budget, so a
// compression bomb stops at the ceiling instead of after full expansion.
import JSZip from "jszip";
import { SaxesParser } from "saxes";
import { Rejected } from "./rejected.ts";

type Budget = { left: number };

async function inflate(
  zip: JSZip,
  name: string,
  budget: Budget,
  onText: (chunk: string) => void,
): Promise<boolean> {
  const file = zip.file(name);
  if (!file) return false;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  await new Promise<void>((resolve, reject) => {
    const stream = file.internalStream("uint8array");
    stream
      .on("data", (chunk: Uint8Array) => {
        budget.left -= chunk.byteLength;
        if (budget.left < 0) {
          stream.pause();
          reject(new Rejected("expansion-limit"));
          return;
        }
        try {
          onText(decoder.decode(chunk, { stream: true }));
        } catch (error) {
          stream.pause();
          reject(error);
        }
      })
      .on("error", reject)
      .on("end", () => {
        try {
          onText(decoder.decode());
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .resume();
  });
  return true;
}

/** Streams one XML part through saxes; `visit` sees qualified tag names. */
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
  const parser = new SaxesParser();
  let failure: Error | undefined;
  parser.on("error", (error) => {
    failure ??= error;
  });
  if (visit.open)
    parser.on("opentag", (tag) =>
      visit.open!(tag.name, tag.attributes as Record<string, string>),
    );
  if (visit.close) parser.on("closetag", (tag) => visit.close!(tag.name));
  if (visit.text) parser.on("text", visit.text);
  const found = await inflate(zip, name, budget, (chunk) => {
    if (chunk) parser.write(chunk);
    if (failure) throw failure;
  });
  if (!found) return false;
  parser.close();
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
  const budget: Budget = { left: expandedBytes };
  const lines: string[] = [];
  let paragraph: string[] | undefined;
  let inText = false;
  const found = await readXml(zip, "word/document.xml", budget, {
    open(name) {
      if (name === "w:p") paragraph = [];
      else if (name === "w:t") inText = true;
      else if (name === "w:tab") paragraph?.push("\t");
      else if (name === "w:br" || name === "w:cr") paragraph?.push("\n");
    },
    close(name) {
      if (name === "w:t") inText = false;
      else if (name === "w:p" && paragraph) {
        lines.push(paragraph.join(""));
        paragraph = undefined;
      }
    },
    text(text) {
      if (inText) paragraph?.push(text);
    },
  });
  if (!found) throw new Rejected("unsupported");
  const text = lines.join("\n");
  if (!text.trim()) throw new Rejected("no-text");
  return { text, partialNoText: false };
}
