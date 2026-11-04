// SPDX-License-Identifier: AGPL-3.0-or-later
import { afterAll, beforeAll, expect, it } from "vitest";
import { ProblemDetails } from "@source-taster/contract-verification";
import { DocumentStructuringResponse } from "@source-taster/contract-verification/document";
import { startTestService } from "./support/service.ts";
import { docx, expandingDocx, pdf, upload } from "./support/documents.ts";
let service: Awaited<ReturnType<typeof startTestService>>;
beforeAll(async () => {
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_AUX_PORT ?? 3602),
    50,
    {
      SOURCE_TASTER_DOCUMENT_LIMITS: JSON.stringify({
        inputBytes: 1_048_576,
        pages: 2,
        expandedBytes: 4096,
      }),
      SOURCE_TASTER_REFERENCE_LIMIT: "2",
    },
  );
});
afterAll(async () => {
  await service?.stop();
});
it.each([
  [
    "PDF pages",
    () => pdf([[], [], ["Doe, J. (2020). Test."]]),
    "document-page-limit",
  ],
  ["XML expansion", () => expandingDocx(4097), "document-expansion-limit"],
  [
    "unused ZIP member expansion",
    () => docx(["Doe, J. (2020). Test."], { padding: 4097 }),
    "document-expansion-limit",
  ],
] as const)(
  "bounds %s and returns a distinct error",
  async (_name, bytes, code) => {
    const response = await upload(service.apiUrl, await bytes(), "bounded.bin");
    expect(response.status).toBe(422);
    expect(ProblemDetails.parse(await response.json()).code).toBe(code);
  },
);
it("counts recognized References after extraction and rejects rather than truncates", async () => {
  const response = await upload(
    service.apiUrl,
    await docx([
      "Doe, J. (2020). First.",
      "Roe, J. (2021). Second.",
      "Poe, J. (2022). Third.",
    ]),
    "references.docx",
  );
  // #90: the extracted document and its selection stay movable; nothing is truncated.
  expect(response.status).toBe(200);
  const over = DocumentStructuringResponse.parse(await response.json()).data;
  expect(over.referenceLimitExceeded).toBe(true);
  expect(over.structuring).toMatchObject({ references: [], referenceLimit: 2 });
  expect(over.selection.regions).toEqual([
    { start: 0, end: over.document.text.length },
  ]);
  const next = await upload(
    service.apiUrl,
    await docx(["Doe, J. (2020). Recovery."]),
    "next.docx",
  );
  expect(next.status).toBe(200);
  expect(
    DocumentStructuringResponse.parse(await next.json()).data.structuring
      .references,
  ).toHaveLength(1);
});
it("advertises and enforces an Operator-changed upload limit", async () => {
  const settings = await fetch(`${service.apiUrl}/v2/document-settings`);
  expect(settings.status).toBe(200);
  expect(await settings.json()).toEqual({
    data: { inputBytes: 1_048_576 },
    quota: null,
  });
  const bytes = new Uint8Array(1_048_577);
  bytes.set(pdf([["Doe, J. (2020). Test."]]));
  const response = await upload(service.apiUrl, bytes, "configured.pdf");
  expect(response.status).toBe(413);
  expect(ProblemDetails.parse(await response.json())).toMatchObject({
    code: "document-size-limit",
    limit: 1_048_576,
  });
});

it("fails closed when no restricted extraction image is configured", async () => {
  await service.restart({ SOURCE_TASTER_DOCUMENT_IMAGE: "" });
  const response = await upload(
    service.apiUrl,
    pdf([["Doe, J. (2020). Test."]]),
    "test.pdf",
  );
  expect(response.status).toBe(503);
  expect(ProblemDetails.parse(await response.json()).code).toBe(
    "document-unavailable",
  );
});
