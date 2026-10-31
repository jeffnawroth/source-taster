// SPDX-License-Identifier: AGPL-3.0-or-later
// Public HTTP seam; synthetic documents are regression witnesses, not gate data.
import { expect, inject, it } from "vitest";
import { upload, docx } from "./support/documents.ts";
const api = inject("apiUrl");
const first = "Doe, J. (2020). Signal maps. Example Press.";
const second = "Roe, A. (2021). Careful systems. Example Press.";
const text = `Chapter 1\nRunning text (2018) must not be checked.\nReferences\n${first}\nChapter 2\nMore running text (2019).\nLiteraturverzeichnis\n${second}\nAppendix\nOutside (2022).`;
it("detects all chapter bibliographies, excludes running text and keeps document-relative provenance", async () => {
  const response = await upload(api, await docx(text.split("\n")), "chapters.docx");
  expect(response.status).toBe(200);
  const { data, quota } = await response.json();
  expect(data.selection).toEqual({
    version: "bibliography-rules/1",
    regions: [{ start: 62, end: 105 }, { start: 163, end: 210 }],
  });
  expect(data.document.text).toBe(text);
  expect(data.structuring.references.map((r: {originalText: string}) => r.originalText)).toEqual([first, second]);
  expect(data.structuring.references[0].span).toEqual({start:62,end:105});
  expect(data.structuring.references[0].fieldSources.title).toEqual({raw:"Signal maps",span:{start:78,end:89}});
  expect(quota).toBeNull();
});
async function structure(input: unknown) {
  return fetch(`${api}/v2/structurings`, {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)});
}
it("leaves an undetected upload unselected, supports manual regions and detects pasted full documents without changing lists", async () => {
  const original = `Running text (2019).\n${first}`;
  const uploaded = await upload(api, await docx(original.split("\n")), "unheaded.docx");
  const { data } = await uploaded.json();
  expect(data.selection.regions).toEqual([]);
  expect(data.structuring.references).toEqual([]);
  const manual = await structure({text:original, document:true, regions:[{start:21,end:64}]});
  expect(manual.status).toBe(200);
  expect((await manual.json()).data.structuring.references[0]).toMatchObject({originalText:first,span:{start:21,end:64}});
  const pasted = await structure({text});
  expect(pasted.status).toBe(200);
  const full = (await pasted.json()).data;
  expect(full.document.text).toBe(text);
  expect(full.structuring.references.map((r: {originalText:string}) => r.originalText)).toEqual([first,second]);
  const list = await structure({text:first});
  const listed = (await list.json()).data;
  expect(listed.document).toBeNull();
  expect(listed.structuring.references).toHaveLength(1);
});
async function post(path: string, body: unknown) {
  return fetch(`${api}/v2/checks${path}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
}
async function snapshot(id:string) {return (await (await fetch(`${api}/v2/checks/${id}`)).json()).data;}
it("moves selections by difference: retained corrections/results, dropped tombstones and new cut slots", async () => {
  const original = `References\n${first}\n${second}\nPoe, P. (2022). Third source. Example Press.`;
  const created = await post("", {document:{text:original, regions:[{start:11,end:102}]}});
  expect(created.status).toBe(201);
  let check = (await created.json()).data;
  await expect.poll(async () => (await snapshot(check.id)).state).toBe("ended");
  check = await snapshot(check.id);
  expect(check.references).toHaveLength(2);
  const saved = await post(`/${check.id}/references/1/revisions`, {expectedRevision:1,fields:{title:"User correction"},recheck:false});
  check = (await saved.json()).data;
  const retained = check.references[0];
  const preview = await post(`/${check.id}/selection/preview`, {expectedEventSeq:check.lastEventSeq,regions:[{start:11,end:54},{start:61,end:original.length}]});
  expect(preview.status).toBe(200);
  const changes = (await preview.json()).data;
  expect(changes).toMatchObject({removed:[2],unchanged:[1],added:2,total:3,additionalQuota:2});
  expect((await snapshot(check.id)).references).toEqual(check.references);
  const applied = await post(`/${check.id}/selection`, {expectedEventSeq:check.lastEventSeq,regions:changes.regions});
  expect(applied.status).toBe(200);
  const next = (await applied.json()).data;
  expect(next.id).toBe(check.id);
  expect(next.references.map((r:{slot:number})=>r.slot)).toEqual([1,3,4]);
  expect(next.references[0]).toEqual(retained);
  expect(next.references[1].originalText).toBe(second.slice(6));
  expect(next.references[1].revisions[0].reference.structuring.path).toBe("parser");
  expect(next.document.text).toBe(original);
  expect((await post(`/${check.id}/selection`, {expectedEventSeq:check.lastEventSeq,regions:[]})).status).toBe(409);
});
