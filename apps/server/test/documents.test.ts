// SPDX-License-Identifier: AGPL-3.0-or-later
// PDF/DOCX upload through the published v2 contract (#89, ADR-0011/0015).
import {
  ProblemDetails,
  StructuringResponse,
} from "@source-taster/contract-verification";
import { DocumentStructuringResponse } from "@source-taster/contract-verification/document";
import { expect, inject, it } from "vitest";
import { docx, pdf, upload } from "./support/documents.ts";

const api = inject("apiUrl");
const entries = [
  "Doe, J. (2020). Signal maps. Journal of Testing, 12(3), 45–67.",
  "Roe, A., & Poe, B. (2019). Careful systems. Example Press.",
];

async function pasted(text: string) {
  const response = await fetch(`${api}/v1/structurings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return StructuringResponse.parse(await response.json()).data;
}

it("structures the text of an uploaded DOCX like pasted text", async () => {
  const response = await upload(api, await docx(entries), "thesis.docx");
  expect(response.status).toBe(200);
  const { data } = DocumentStructuringResponse.parse(await response.json());
  expect(data.document).toEqual({
    format: "docx",
    text: entries.join("\n"),
    notice: null,
  });
  expect(data.structuring).toEqual(await pasted(entries.join("\n")));
  expect(data.structuring.references).toHaveLength(2);
});

it("structures a text PDF and identifies pages without text without inventing References", async () => {
  const lines = [
    "Doe, J. (2020). Signal maps. Journal of Testing, 12(3), 45-67.",
  ];
  const response = await upload(
    api,
    pdf([lines, []]),
    "renamed.bin",
    "text/plain",
  );
  expect(response.status).toBe(200);
  const { data } = DocumentStructuringResponse.parse(await response.json());
  expect(data.document).toEqual({
    format: "pdf",
    text: lines[0],
    notice: "partial-no-text",
  });
  expect(data.structuring).toEqual(await pasted(lines[0]!));
});

it("keeps Word list numbering and indentation in extracted Reference text", async () => {
  const response = await upload(
    api,
    await docx([], { numbered: { format: "[%1]", paragraphs: entries } }),
    "references.docx",
  );
  expect(response.status).toBe(200);
  const { data } = DocumentStructuringResponse.parse(await response.json());
  expect(data.document.text).toBe(
    entries.map((entry, index) => `[${index + 1}] ${entry}`).join("\n"),
  );
  expect(data.structuring.references).toHaveLength(2);
});

it("accepts a 20 MB PDF and rejects a 21 MB file with the stated limit", async () => {
  const bytes = new Uint8Array(20 * 1024 * 1024);
  bytes.set(pdf([["Doe, J. (2020). Signal maps."]]));
  const accepted = await upload(api, bytes, "large.pdf");
  expect(accepted.status).toBe(200);
  const oversized = await upload(
    api,
    new Uint8Array(21 * 1024 * 1024),
    "large.docx",
  );
  expect(oversized.status).toBe(413);
  const problem = ProblemDetails.parse(await oversized.json());
  expect(problem.title).toContain("20 MB");
  expect(problem).toMatchObject({
    code: "document-size-limit",
    limit: 20_971_520,
  });
});

it.each([
  ["image-only PDF", () => pdf([[]]), "document-no-text", 422],
  [
    "encrypted PDF",
    () => pdf([["Hidden"]], { encrypted: true }),
    "document-encrypted",
    422,
  ],
  [
    "broken PDF",
    () => new TextEncoder().encode("%PDF-1.4\nbroken"),
    "document-unreadable",
    422,
  ],
  [
    "renamed executable",
    () => new TextEncoder().encode("not a document"),
    "document-unsupported",
    415,
  ],
] as const)(
  "returns a distinct safe problem for %s",
  async (_name, bytes, code, status) => {
    const response = await upload(
      api,
      bytes(),
      "private-name.pdf",
      "application/pdf",
    );
    expect(response.status).toBe(status);
    const problem = ProblemDetails.parse(await response.json());
    expect(problem.code).toBe(code);
    expect(JSON.stringify(problem)).not.toContain("private-name");
  },
);

it("ignores footnote References instead of treating them as bibliography input", async () => {
  const response = await upload(
    api,
    // The footnote anchor paragraph is running text, so the list needs its heading (#90).
    await docx(["References", ...entries], {
      footnotes: ["Secret, S. (1999). Footnote source."],
    }),
    "footnotes.docx",
  );
  expect(response.status).toBe(200);
  const { data, quota } = DocumentStructuringResponse.parse(
    await response.json(),
  );
  expect(data.document.text).not.toContain("Footnote source");
  expect(data.structuring.references).toHaveLength(2);
  expect(data.structuring.quotaConsumed).toBe(0);
  expect(quota).toBeNull();
});

it("accepts a DOCX at the full 20 MB input limit", async () => {
  const base = await docx(entries, { storedPadding: 1 });
  const file = await docx(entries, {
    storedPadding: 20_971_520 - base.byteLength + 1,
  });
  expect(file.byteLength).toBe(20_971_520);
  const response = await upload(api, file, "large.docx");
  expect(response.status).toBe(200);
  expect(
    DocumentStructuringResponse.parse(await response.json()).data.document.text,
  ).toBe(entries.join("\n"));
});

it("bounds chunked upload reads without trusting Content-Length", async () => {
  const response = await fetch(`${api}/v2/document-structurings`, {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=chunked" },
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            '--chunked\r\nContent-Disposition: form-data; name="file"; filename="large.pdf"\r\n\r\n',
          ),
        );
        for (let index = 0; index < 22; index++)
          controller.enqueue(new Uint8Array(1024 * 1024));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit);
  expect(response.status).toBe(413);
  expect(ProblemDetails.parse(await response.json()).code).toBe(
    "document-size-limit",
  );
});

it("rejects ambiguous multipart fields without logging a filename", async () => {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(pdf([[]]))]), "first.pdf");
  form.append("file", new Blob([new Uint8Array(pdf([[]]))]), "second.pdf");
  const response = await fetch(`${api}/v2/document-structurings`, {
    method: "POST",
    body: form,
  });
  expect(response.status).toBe(400);
  expect(ProblemDetails.parse(await response.json()).code).toBe(
    "invalid-request",
  );
});

it("publishes the current document upload limit for both clients", async () => {
  const response = await fetch(`${api}/v2/document-settings`);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    data: { inputBytes: 20_971_520 },
    quota: null,
  });
});
