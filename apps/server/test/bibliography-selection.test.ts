// SPDX-License-Identifier: AGPL-3.0-or-later
// Public HTTP seam; synthetic documents are regression witnesses, not gate data.
import { expect, inject, it } from "vitest";
import {
  CheckResponse,
  SelectionPreviewResponse,
} from "@source-taster/contract-verification/v2";
import {
  DocumentStructuringResponse,
  TextStructuringResponse,
} from "@source-taster/contract-verification/document";
import { upload, docx } from "./support/documents.ts";
const api = inject("apiUrl");
const first = "Doe, J. (2020). Signal maps. Example Press.";
const second = "Roe, A. (2021). Careful systems. Example Press.";
const text = `Chapter 1\nRunning text (2018) must not be checked.\nReferences\n${first}\nChapter 2\nMore running text (2019).\nLiteraturverzeichnis\n${second}\nAppendix\nOutside (2022).`;
it("detects all chapter bibliographies, excludes running text and keeps document-relative provenance", async () => {
  const response = await upload(
    api,
    await docx(text.split("\n")),
    "chapters.docx",
  );
  expect(response.status).toBe(200);
  const { data, quota } = DocumentStructuringResponse.parse(
    await response.json(),
  );
  expect(data.selection).toEqual({
    version: "bibliography-rules/1",
    regions: [
      { start: 62, end: 105 },
      { start: 163, end: 210 },
    ],
  });
  expect(data.document.text).toBe(text);
  expect(
    data.structuring.references.map(
      (r: { originalText: string }) => r.originalText,
    ),
  ).toEqual([first, second]);
  expect(data.structuring.references[0]!.span).toEqual({ start: 62, end: 105 });
  expect(data.structuring.references[0]!.fieldSources.title).toEqual({
    raw: "Signal maps",
    span: { start: 78, end: 89 },
  });
  expect(quota).toBeNull();
});
async function structure(input: unknown) {
  return fetch(`${api}/v2/structurings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}
it("leaves an undetected upload unselected, supports manual regions and detects pasted full documents without changing lists", async () => {
  const original = `Running text (2019).\n${first}`;
  const uploaded = await upload(
    api,
    await docx(original.split("\n")),
    "unheaded.docx",
  );
  const { data } = DocumentStructuringResponse.parse(await uploaded.json());
  expect(data.selection.regions).toEqual([]);
  expect(data.structuring.references).toEqual([]);
  const manual = await structure({
    text: original,
    document: true,
    regions: [{ start: 21, end: 64 }],
  });
  expect(manual.status).toBe(200);
  expect(
    TextStructuringResponse.parse(await manual.json()).data.structuring
      .references[0],
  ).toMatchObject({
    originalText: first,
    span: { start: 21, end: 64 },
  });
  const pasted = await structure({ text });
  expect(pasted.status).toBe(200);
  const full = TextStructuringResponse.parse(await pasted.json()).data;
  expect(full.document?.text).toBe(text);
  expect(
    full.structuring.references.map(
      (r: { originalText: string }) => r.originalText,
    ),
  ).toEqual([first, second]);
  const list = await structure({ text: first });
  const listed = TextStructuringResponse.parse(await list.json()).data;
  expect(listed.document).toBeNull();
  expect(listed.structuring.references).toHaveLength(1);
});
async function post(path: string, body: unknown) {
  return fetch(`${api}/v2/checks${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function snapshot(id: string) {
  return CheckResponse.parse(
    await (await fetch(`${api}/v2/checks/${id}`)).json(),
  ).data;
}
it("moves selections by difference: retained corrections/results, dropped tombstones and new cut slots", async () => {
  const original = `References\n${first}\n${second}\nPoe, P. (2022). Third source. Example Press.`;
  const created = await post("", {
    document: { text: original, regions: [{ start: 11, end: 102 }] },
  });
  expect(created.status).toBe(201);
  let check = CheckResponse.parse(await created.json()).data;
  await expect.poll(async () => (await snapshot(check.id)).state).toBe("ended");
  check = await snapshot(check.id);
  expect(check.references).toHaveLength(2);
  const saved = await post(`/${check.id}/references/1/revisions`, {
    expectedRevision: 1,
    fields: { title: "User correction" },
    recheck: false,
  });
  check = CheckResponse.parse(await saved.json()).data;
  const retained = check.references[0];
  const preview = await post(`/${check.id}/selection/preview`, {
    expectedEventSeq: check.lastEventSeq,
    regions: [
      { start: 11, end: 54 },
      { start: 61, end: original.length },
    ],
  });
  expect(preview.status).toBe(200);
  const changes = SelectionPreviewResponse.parse(await preview.json()).data;
  expect(changes).toMatchObject({
    removed: [2],
    unchanged: [1],
    added: 2,
    total: 3,
    additionalQuota: 2,
  });
  expect(
    changes.addedReferences.map(
      (r: { originalText: string }) => r.originalText,
    ),
  ).toEqual([second.slice(6), "Poe, P. (2022). Third source. Example Press."]);
  expect((await snapshot(check.id)).references).toEqual(check.references);
  const applied = await post(`/${check.id}/selection`, {
    expectedEventSeq: check.lastEventSeq,
    regions: changes.regions,
  });
  expect(applied.status).toBe(200);
  const next = CheckResponse.parse(await applied.json()).data;
  expect(next.id).toBe(check.id);
  expect(next.references.map((r: { slot: number }) => r.slot)).toEqual([
    1, 3, 4,
  ]);
  expect(next.references[0]).toEqual(retained);
  expect(next.references[1]!.originalText).toBe(second.slice(6));
  expect(next.references[1]!.revisions[0]!.reference.structuring.path).toBe(
    "parser",
  );
  expect(next.document?.text).toBe(original);
  expect(
    (
      await post(`/${check.id}/selection`, {
        expectedEventSeq: check.lastEventSeq,
        regions: [],
      })
    ).status,
  ).toBe(409);
});

it("checks recognized References from a manual selection without turning rejected headings into slots", async () => {
  const original = `Unrecognized heading\n\n${first}\n\nNot a Reference`;
  const regions = [{ start: 0, end: original.length }];
  const structured = await structure({
    text: original,
    document: true,
    regions,
  });
  const preview = TextStructuringResponse.parse(await structured.json()).data
    .structuring;
  expect(preview.references).toHaveLength(1);
  expect(preview.rejected).toHaveLength(2);
  const created = await post("", { document: { text: original, regions } });
  expect(created.status).toBe(201);
  const check = CheckResponse.parse(await created.json()).data;
  expect(
    check.references.map((r: { originalText: string }) => r.originalText),
  ).toEqual([first]);
});

it.each([
  { regions: [{ start: 0, end: first.length + 1 }] },
  { regions: [{ start: 10, end: 5 }] },
  {
    regions: [
      { start: 0, end: 20 },
      { start: 10, end: 30 },
    ],
  },
])(
  "rejects invalid document regions before Structuring or creating a Check: %j",
  async ({ regions }) => {
    expect(
      (await structure({ text: first, document: true, regions })).status,
    ).toBe(400);
    expect(
      (await post("", { document: { text: first, regions } })).status,
    ).toBe(400);
  },
);

it("allows deselecting every region without creating any new work", async () => {
  const created = await post("", {
    document: { text: first, regions: [{ start: 0, end: first.length }] },
  });
  expect(created.status).toBe(201);
  const initial = CheckResponse.parse(await created.json()).data;
  await expect
    .poll(async () => (await snapshot(initial.id)).state)
    .toBe("ended");
  const check = await snapshot(initial.id);
  const request = { expectedEventSeq: check.lastEventSeq, regions: [] };
  const preview = await post(`/${check.id}/selection/preview`, request);
  expect(
    SelectionPreviewResponse.parse(await preview.json()).data,
  ).toMatchObject({
    removed: [1],
    unchanged: [],
    added: 0,
    addedReferences: [],
    total: 0,
    additionalQuota: 0,
  });
  const applied = await post(`/${check.id}/selection`, request);
  expect(applied.status).toBe(200);
  const next = CheckResponse.parse(await applied.json()).data;
  expect(next.references).toEqual([]);
  expect(next.document?.selection.regions).toEqual([]);
  expect(next.state).toBe("ended");
});
