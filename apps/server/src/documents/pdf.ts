// SPDX-License-Identifier: AGPL-3.0-or-later
// PDF.js is used only for text extraction, never rendering, scripting or OCR.

import { Rejected } from "./rejected.ts";
export async function extractPdf(
  bytes: Uint8Array,
  pages: number,
): Promise<{ text: string; partialNoText: boolean }> {
  const { getDocument, PasswordException } =
    await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({
    data: bytes,
    useSystemFonts: false,
    disableFontFace: true,
    useWorkerFetch: false,
    verbosity: 0,
  });
  try {
    const document = await task.promise;
    if (document.numPages > pages) throw new Rejected("page-limit");
    const textPages: string[] = [];
    let empty = 0;
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let line = "";
      let previousY: number | undefined;
      for (const item of content.items) {
        if (!("str" in item)) continue;
        const y = item.transform[5] as number;
        if (previousY !== undefined && Math.abs(y - previousY) > 2 && line) {
          lines.push(line.trimEnd());
          line = "";
        }
        line += item.str;
        if (item.hasEOL) {
          lines.push(line.trimEnd());
          line = "";
        }
        previousY = y;
      }
      if (line) lines.push(line.trimEnd());
      const text = lines.join("\n").trim();
      if (!text) empty++;
      else textPages.push(text);
      page.cleanup();
    }
    const text = textPages.join("\n\n");
    if (!text.trim()) throw new Rejected("no-text");
    return { text, partialNoText: empty > 0 };
  } catch (error) {
    if (error instanceof Rejected) throw error;
    if (error instanceof PasswordException) throw new Rejected("encrypted");
    throw new Rejected("unreadable");
  } finally {
    await task.destroy();
  }
}
