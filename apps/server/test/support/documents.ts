// SPDX-License-Identifier: AGPL-3.0-or-later
// Synthetic upload documents, built in memory. No customer documents.
import JSZip from "jszip";

const escape = (text: string) =>
  text.replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);

export interface DocxOptions {
  footnotes?: string[];
  /** Paragraphs numbered with the Word list format, e.g. "[%1]". */
  numbered?: { format: string; paragraphs: string[] };
  /** Extra stored (uncompressed-size-honest) part to inflate the archive. */
  padding?: number;
}

/** A minimal WordprocessingML package with one paragraph per entry. */
export async function docx(
  paragraphs: string[],
  options: DocxOptions = {},
): Promise<Uint8Array> {
  const zip = new JSZip();
  const run = (text: string) =>
    `<w:r><w:t xml:space="preserve">${escape(text)}</w:t></w:r>`;
  const body = [
    ...paragraphs.map((text) => `<w:p>${run(text)}</w:p>`),
    ...(options.numbered?.paragraphs ?? []).map(
      (text) =>
        `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>${run(text)}</w:p>`,
    ),
    ...(options.footnotes ?? []).map(
      (_, index) =>
        `<w:p>${run("Claim")}<w:r><w:footnoteReference w:id="${index + 1}"/></w:r></w:p>`,
    ),
  ].join("");
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`,
  );
  if (options.numbered)
    zip.file(
      "word/numbering.xml",
      `<?xml version="1.0" encoding="UTF-8"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="${escape(options.numbered.format)}"/></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`,
    );
  if (options.footnotes)
    zip.file(
      "word/footnotes.xml",
      `<?xml version="1.0" encoding="UTF-8"?><w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:footnote w:type="separator" w:id="-1"><w:p><w:r><w:separator/></w:r></w:p></w:footnote>${options.footnotes
        .map(
          (text, index) =>
            `<w:footnote w:id="${index + 1}"><w:p>${run(text)}</w:p></w:footnote>`,
        )
        .join("")}</w:footnotes>`,
    );
  if (options.padding)
    zip.file("word/media/padding.bin", new Uint8Array(options.padding));
  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
  });
}

/** A DOCX whose document part expands to `bytes` of whitespace-padded XML. */
export async function expandingDocx(bytes: number): Promise<Uint8Array> {
  const zip = new JSZip();
  const head = `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>`;
  const tail = `</w:body></w:document>`;
  zip.file(
    "word/document.xml",
    head + " ".repeat(Math.max(0, bytes - head.length - tail.length)) + tail,
  );
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

/**
 * A small, valid PDF 1.4 with one page per entry of `pages`. Each page shows
 * its lines in Helvetica; an empty page array entry is a page without text.
 */
export function pdf(pages: string[][]): Uint8Array {
  const objects: string[] = [];
  const add = (body: string) => objects.push(body);
  const catalog = add("");
  const pageTree = add("");
  const font = add(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  );
  const kids: number[] = [];
  for (const lines of pages) {
    const content = lines.length
      ? `BT /F1 10 Tf 12 TL 40 780 Td ${lines
          .map((line) => `(${line.replace(/[\\()]/g, (c) => `\\${c}`)}) Tj T*`)
          .join(" ")} ET`
      : "0 0 1 rg 10 10 50 50 re f";
    const stream = add(
      `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    );
    kids.push(
      add(
        `<< /Type /Page /Parent ${pageTree} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${stream} 0 R >>`,
      ),
    );
  }
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pageTree} 0 R >>`;
  objects[pageTree - 1] =
    `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(out, "latin1"));
}

export function upload(
  api: string,
  bytes: Uint8Array,
  name: string,
  type = "application/octet-stream",
) {
  const form = new FormData();
  form.set("file", new Blob([bytes], { type }), name);
  return fetch(`${api}/v2/document-structurings`, {
    method: "POST",
    body: form,
  });
}
