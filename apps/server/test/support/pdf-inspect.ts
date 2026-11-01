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
    await task.destroy();
  }
}
/** Flat list of structure roles in document order, e.g. ["Document","H1","P"]. */
export function roles(node: StructNode | null | undefined): string[] {
  if (!node) return [];
  return [
    // pdf.js wraps each page tree in its own "Root"; that is not PDF structure.
    ...(node.role && node.role !== "Root" ? [node.role] : []),
    ...(node.children ?? []).flatMap(roles),
  ];
}
/**
 * Catalog flags read from the raw file, independently of any PDF library.
 * PDFKit writes these objects uncompressed; a library that hides them would
 * make the accessibility claim unverifiable, so they must be readable here.
 */
export function rawCatalog(bytes: Uint8Array) {
  const text = Buffer.from(bytes).toString("latin1");
  const catalog = /\/Type \/Catalog[\s\S]*?endobj/u.exec(text)?.[0] ?? "";
  const reference = (key: string) => {
    const id = new RegExp(`/${key} (\\d+) 0 R`, "u").exec(catalog)?.[1];
    return id
      ? (new RegExp(`\\n${id} 0 obj\\n([\\s\\S]*?)endobj`, "u").exec(
          text,
        )?.[1] ?? "")
      : "";
  };
  return {
    language: /\/Lang \(([^)]*)\)/u.exec(catalog)?.[1],
    marked: /\/Marked true/u.test(reference("MarkInfo")),
    displayDocTitle: /\/DisplayDocTitle true/u.test(
      reference("ViewerPreferences"),
    ),
    hasStructTree: /\/StructTreeRoot \d+ 0 R/u.test(catalog),
  };
}
