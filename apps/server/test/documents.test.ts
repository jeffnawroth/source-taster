// SPDX-License-Identifier: AGPL-3.0-or-later
// PDF/DOCX upload through the published v2 contract (#89, ADR-0011/0015).
import { StructuringResponse } from "@source-taster/contract-verification";
import { DocumentStructuringResponse } from "@source-taster/contract-verification/document";
import { expect, inject, it } from "vitest";
import { docx, upload } from "./support/documents.ts";

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
