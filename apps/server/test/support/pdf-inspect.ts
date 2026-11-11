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
/** Paint operations independently decoded by pdf.js, including Artifact scope. */
export async function inspectPaint(bytes: Uint8Array) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = pdfjs.getDocument({ data: new Uint8Array(bytes), verbosity: 0 });
  const doc = await task.promise;
  const paints: {
    kind: "text" | "path";
    fill: string;
    stroke: string;
    artifact: boolean;
  }[] = [];
  try {
    for (let n = 1; n <= doc.numPages; n++) {
      const operators = await (await doc.getPage(n)).getOperatorList();
      let state = { fill: "#000000", stroke: "#000000" };
      const saved: (typeof state)[] = [];
      const marked: string[] = [];
      for (const [i, op] of operators.fnArray.entries()) {
        const args = operators.argsArray[i] as unknown[] | null;
        if (op === pdfjs.OPS.save) saved.push({ ...state });
        else if (op === pdfjs.OPS.restore) state = saved.pop() ?? state;
        else if (op === pdfjs.OPS.setFillRGBColor)
          state.fill = args?.[0] as string;
        else if (op === pdfjs.OPS.setStrokeRGBColor)
          state.stroke = args?.[0] as string;
        else if (
          op === pdfjs.OPS.beginMarkedContent ||
          op === pdfjs.OPS.beginMarkedContentProps
        )
          marked.push(args?.[0] as string);
        else if (op === pdfjs.OPS.endMarkedContent) marked.pop();
        else if (op === pdfjs.OPS.showText || op === pdfjs.OPS.constructPath)
          paints.push({
            kind: op === pdfjs.OPS.showText ? "text" : "path",
            ...state,
            artifact: marked.includes("Artifact"),
          });
      }
    }
    return paints;
  } finally {
    await task.destroy();
  }
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
            "str" in item ? item.str + (item.hasEOL ? "\n" : "") : "",
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
/**
 * Link annotations and how they attach to the structure tree, read from the
 * raw file. A visible link that is not an OBJR child of a Link element is
 * invisible to assistive technology.
 */
export function rawLinks(bytes: Uint8Array) {
  const text = Buffer.from(bytes).toString("latin1");
  // PDFKit writes /Contents before /Subtype, so match the whole object.
  const annotations = [
    ...text.matchAll(
      /\d+ 0 obj\n<<(?:(?!endobj)[\s\S])*?\/Subtype \/Link[\s\S]*?endobj/gu,
    ),
  ];
  return {
    annotations: annotations.length,
    withStructParent: annotations.filter((a) =>
      /\/StructParent \d+/u.test(a[0]),
    ).length,
    uris: annotations.flatMap((a) => {
      const action = /\/A (\d+) 0 R/u.exec(a[0])?.[1];
      const body = action
        ? new RegExp(`\\n${action} 0 obj\\n([\\s\\S]*?)endobj`, "u").exec(
            text,
          )?.[1]
        : undefined;
      return /\/URI \(([^)]*)\)/u.exec(body ?? "")?.[1] ?? [];
    }),
    /** Link annotations whose /Contents alternate description is empty or absent. */
    withoutContents: annotations.filter(
      (a) => !/\/Contents \((?!\))[^)]+\)/u.test(a[0]),
    ).length,
    objectReferences: (text.match(/\/Type \/OBJR/gu) ?? []).length,
    linkElements: (text.match(/\/S \/Link/gu) ?? []).length,
  };
}
function structIds(node: StructNode | null | undefined): string[] {
  if (!node) return [];
  return [
    ...(node.type === "content" && node.id ? [node.id] : []),
    ...(node.children ?? []).flatMap(structIds),
  ];
}
/**
 * Page text that is neither Artifact nor reachable from the structure tree
 * through its marked-content id. Such text is invisible to assistive
 * technology (e.g. a paragraph continued onto the next page).
 */
export function untaggedText(
  page: Awaited<ReturnType<typeof inspectPdf>>["pages"][number],
) {
  const reachable = new Set(structIds(page.tree));
  const open: { tag: string; id?: string }[] = [];
  const out: string[] = [];
  for (const item of page.items) {
    if ("type" in item && item.type === "beginMarkedContentProps") {
      const marked = item as { tag?: string; id?: string };
      open.push({ tag: marked.tag ?? "", id: marked.id });
    } else if ("type" in item && item.type === "beginMarkedContent")
      open.push({ tag: "" });
    else if ("type" in item && item.type === "endMarkedContent") open.pop();
    else if ("str" in item && item.str.trim()) {
      const covered = open.some(
        (m) =>
          m.tag === "Artifact" || (m.id !== undefined && reachable.has(m.id)),
      );
      if (!covered) out.push(item.str);
    }
  }
  return out;
}
/**
 * Text inside `Artifact` marked content on one page, i.e. page furniture that
 * assistive technology skips. Read from pdf.js' marked-content items.
 */
export function artifactText(
  page: Awaited<ReturnType<typeof inspectPdf>>["pages"][number],
) {
  const out: string[] = [];
  const open: string[] = [];
  for (const item of page.items) {
    if ("type" in item && item.type === "beginMarkedContentProps")
      open.push((item as { tag?: string }).tag ?? "");
    else if ("type" in item && item.type === "beginMarkedContent")
      open.push("");
    else if ("type" in item && item.type === "endMarkedContent") open.pop();
    else if ("str" in item && open.includes("Artifact")) out.push(item.str);
  }
  return out.join("");
}
