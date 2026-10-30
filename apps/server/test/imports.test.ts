// SPDX-License-Identifier: AGPL-3.0-or-later
// Published HTTP/SSE/download contracts; synthetic records, disposable PostgreSQL.
import { beforeAll, afterAll, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
import { startTestService } from "./support/service.ts";
let service: Awaited<ReturnType<typeof startTestService>>;
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
const headers = { "content-type": "application/json" };
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(3182, 0, fixtures.env);
});
afterAll(async () => { await service?.stop(); await fixtures?.stop(); });
function post(path: string, body: unknown) {
  return fetch(`${service.apiUrl}/v2/${path}`, { method: "POST", headers, body: JSON.stringify(body) });
}
const bib = '% Library comment\r\n@book{Müller,\r\n title = {Über {Research}},\r\n author={Müller, Anna and {Research Group}},\r\n year = 2020,\r\n isbn={9780306406157},\r\n customfield = {Keep ALL of this!}\r\n}\r\n\r\n';
it("imports BibTeX fields and exposes unsupported data without consuming Quota, then downloads the exact original record", async () => {
  const library = { format: "bibtex", text: bib };
  const response = await post("imports", library);
  expect(response.status).toBe(200);
  const preview = await response.json();
  expect(preview.data).toMatchObject({ quotaConsumed: 0, rejected: [], references: [{ originalText: bib, csl: { type: "book", title: "Über Research", author: [{family:"Müller",given:"Anna"},{literal:"Research Group"}], issued:{literal:"2020"}, ISBN:"9780306406157" }, imported: { unsupported: [{name:"customfield",value:"Keep ALL of this!"}] } }] });
  const check = CheckResponse.parse(await (await post("checks", { library })).json()).data;
  const output = await post(`checks/${check.id}/export`, { format: "import-original", mode: "original" });
  expect(output.status).toBe(200);
  expect(output.headers.get("content-disposition")).toContain('.bib"');
  expect(await output.text()).toBe(bib);
  await post(`checks/${check.id}/cancel`, {});
});
it("rejects malformed BibTeX records independently and routes accepted CSL types outside coverage", async () => {
  const text = '@book{broken, title={Unclosed\n@patent{Valid, title={Synthetic patent}, year={2024}, holder={Synthetic Holder}}\n@article{Another,title={Another record},year={2023}}\n';
  const response = await post("imports", {format:"bibtex",text});
  expect(response.status).toBe(200);
  const result = (await response.json()).data;
  expect(result.references.map((r: {csl:{type:string}})=>r.csl.type)).toEqual(["patent","article-journal"]);
  expect(result.rejected).toEqual([{originalText:'@book{broken, title={Unclosed\n',span:{start:0,end:30},reason:"malformed-record"}]);
  const check = CheckResponse.parse(await (await post("checks",{library:{format:"bibtex",text:'@patent{Valid,title={Synthetic patent},year={2024}}'}})).json()).data;
  const stream = await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`);
  for await (const frame of readSseFrames(stream.body!)) void frame;
  const final = CheckResponse.parse(await (await fetch(`${service.apiUrl}/v2/checks/${check.id}`)).json()).data;
  expect(final.references[0]!.outcome).toMatchObject({kind:"verdict",verdict:"not-verifiable",route:"outside-coverage"});
});
it("imports RIS dialect continuations and full dates, preserves name particles and unknown tags, and round trips CRLF exactly", async () => {
  const text = '\uFEFFTY  - BOOK\r\nAU  - van Beethoven, Ludwig\r\nTI  - A synthetic title\r\n      with continuation\r\nPY  - 2020\r\nDA  - 2020/03/14\r\nSN  - 9780306406157\r\nZZ  - Unsupported\r\ncontinuation without indent\r\nER  - \r\n\r\nTY  - JOUR\r\nTI  - Missing end marker\r\nTY  - STAT\r\nTI  - Synthetic law\r\nER  - \r\n';
  const library = {format:"ris",text};
  const response = await post("imports", library);
  expect(response.status).toBe(200);
  const result = (await response.json()).data;
  expect(result.references).toHaveLength(2);
  expect(result.rejected).toHaveLength(1);
  expect(result.references[0]).toMatchObject({csl:{type:"book",title:"A synthetic title with continuation",author:[{family:"Beethoven","non-dropping-particle":"van",given:"Ludwig"}],issued:{literal:"2020-03-14"},ISBN:"9780306406157"},imported:{unsupported:[{name:"ZZ",value:"Unsupported continuation without indent"}]}});
  expect(result.references[1].csl.type).toBe("legislation");
  const check = CheckResponse.parse(await (await post("checks",{library})).json()).data;
  const output = await post(`checks/${check.id}/export`,{format:"import-original",mode:"original"});
  expect(output.status).toBe(200);
  expect(output.headers.get("content-type")).toBe("application/x-research-info-systems; charset=utf-8");
  expect(await output.text()).toBe(result.references.map((r:{originalText:string})=>r.originalText).join(""));
  expect((await post(`checks/${check.id}/export`,{format:"ris",mode:"original"})).status).toBe(400);
  await post(`checks/${check.id}/cancel`,{});
});
it("patches only applied corrections in imported BibTeX and RIS, preserving comments, unsupported fields and other whitespace", async () => {
  for (const [format,text,oldDate,newDate] of [
    ["bibtex",'% exact header\n@article{KeepKey,\n title = {Measured measurement}, % keep comment\n author = {Aspelmeyer, M.},\n year = {2008},\n journal={Nature Physics}, volume={5}, pages={12}, doi={10.1038/nphys1170},\n customfield = {Keep me} % trailing comment\n}\n', 'year = {2008}', 'year = {2009}'],
    ["ris",'TY  - JOUR\r\nTI  - Measured measurement\r\nAU  - Aspelmeyer, M.\r\nPY  - 2008\r\nJO  - Nature Physics\r\nVL  - 5\r\nSP  - 12\r\nDO  - 10.1038/nphys1170\r\nZZ  - Keep me\r\nER  - \r\n', 'PY  - 2008', 'PY  - 2009-01'],
  ] as const) {
    const check = CheckResponse.parse(await (await post("checks",{library:{format,text}})).json()).data;
    const stream=await fetch(`${service.apiUrl}/v2/checks/${check.id}/events`);
    for await(const frame of readSseFrames(stream.body!)) void frame;
    const preview = (await (await post(`checks/${check.id}/bibliography`,{style:"apa",includeBibliography:false})).json()).data;
    expect(preview.entries[0].resultToken).toMatch(/^[a-f0-9]{64}$/u);
    const corrected=await post(`checks/${check.id}/export`,{format:"import-original",mode:"selected-corrections",corrections:[{slot:1,resultToken:preview.entries[0].resultToken}]});
    expect(corrected.status).toBe(200);
    const output=await corrected.text();
    expect(output).toContain(newDate);
    expect(output).not.toContain(oldDate);
    expect(output).toContain(format==="bibtex"?'customfield = {Keep me} % trailing comment':'ZZ  - Keep me\r\n');
    expect(output).toContain(format==="bibtex"?'% exact header\n@article{KeepKey,':'TY  - JOUR\r\n');
    expect(output).toContain(format==="bibtex"?'pages={12}':'SP  - 12\r\n');
    const original=await post(`checks/${check.id}/export`,{format:"import-original",mode:"original"});
    expect(await original.text()).toBe(text);
  }
});
