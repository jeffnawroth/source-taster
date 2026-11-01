// SPDX-License-Identifier: AGPL-3.0-or-later
// Reads a finished PDF with an independent parser (pdf.js), never with the
// generator's own code, and reports the accessibility properties it can see.
export interface StructNode {
  role?: string;
  type?: string;
  alt?: string;
  lang?: string;
  children?: StructNode[];
  id?: string;
}
export async function inspectPdf(bytes: Uint8Array) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: false,
    isEvalSupported: false,
    verbosity: 0,
  });
  const doc = await task.promise;
  try {
    const metadata = await doc.getMetadata();
    const info = metadata.info as Record<string, unknown>;
    const pages = [];
    for (let number = 1; number <= doc.numPages; number++) {
      const page = await doc.getPage(number);
      const content = await page.getTextContent({
        includeMarkedContent: true,
      });
      const tree = (await page.getStructTree()) as StructNode | null;
      pages.push({
        text: content.items
          .map((item) =>
            "str" in item ? item.str + ((item as any).hasEOL ? "\n" : "") : "",
          )
          .join(""),
        items: content.items,
        tree,
      });
    }
    return {
      pageCount: doc.numPages,
      title: info.Title as string | undefined,
      language: info.Language as string | null | undefined,
      markInfo: (await doc.getMarkInfo()) as { Marked?: boolean } | null,
      viewerPreferences: (await doc.getViewerPreferences()) as Record<
        string,
        unknown
      > | null,
      pages,
      /** Concatenated page text, in content-stream order. */
      text: pages.map((page) => page.text).join("\n"),
    };
  } finally {
    await doc.destroy();
  }
}
/** Flat list of structure roles in document order, e.g. ["Document","H1","P"]. */
export function roles(node: StructNode | null | undefined): string[] {
  if (!node) return [];
  return [
    ...(node.role ? [node.role] : []),
    ...(node.children ?? []).flatMap(roles),
  ];
}
