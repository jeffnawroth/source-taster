// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { bothPrograms } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";
test("Account tokens authorize real Checks, keep Guest content separate, expire, and obey server logout",async()=>{
 const both=await bothPrograms({accounts:true});
 try{
  const guest=await both.issue();
  const create=(token:string)=>fetch(both.apiUrl+"/v1/checks",{method:"POST",headers:{authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify({text:physicsReference})});
  const guestCheck=CheckResponse.parse(await (await create(guest.token)).json()).data;
  const account=await both.signIn();
  const response=await create(account.token);
  expect(response.status).toBe(201);
  const check=CheckResponse.parse(await response.json()).data;
  const headers={authorization:`Bearer ${account.token}`};
  expect((await fetch(`${both.apiUrl}/v1/checks/${guestCheck.id}`,{headers})).status).toBe(404);
  const stream=await fetch(`${both.apiUrl}/v1/checks/${check.id}/events`,{headers,signal:AbortSignal.timeout(15000)});
  for await(const _ of readSseFrames(stream.body!)){/* real worker/ordered stream */}
  const completed=CheckResponse.parse(await(await fetch(`${both.apiUrl}/v1/checks/${check.id}`,{headers})).json()).data;
  expect(completed.references[0]?.outcome).toMatchObject({kind:"verdict",verdict:"correct"});
  await both.advance(300000);
  expect((await fetch(`${both.apiUrl}/v1/checks/${check.id}`,{headers})).status).toBe(401);
  const renewed=await account.call("/v1/account-tokens",{});expect(renewed.status).toBe(200);
  const newToken=(await renewed.json() as {data:{accessToken:string}}).data.accessToken;
  expect((await account.call("/v1/sign-out",{everywhere:false})).status).toBe(200);
  expect((await fetch(`${both.apiUrl}/v1/checks/${check.id}`,{headers:{authorization:`Bearer ${newToken}`}})).status).toBe(403);
 }finally{await both.stop();}
});

test("logout drains old Account allows while preserving another current session and Account worker authority",async()=>{
 const both=await bothPrograms({accounts:true,startWorker:false});
 try{
  const first=await both.signIn();await both.advance(60000);const second=await both.signIn();
  expect(second.data).toEqual(first.data);
  const headers={authorization:`Bearer ${first.token}`,"content-type":"application/json"};
  const check=CheckResponse.parse(await(await fetch(both.apiUrl+"/v1/checks",{method:"POST",headers,body:JSON.stringify({text:physicsReference})})).json()).data;
  const held=both.trap("check:read","request");
  const oldRead=fetch(`${both.apiUrl}/v1/checks/${check.id}`,{headers});
  await held.arrived;
  expect((await first.call("/v1/sign-out",{everywhere:false})).status).toBe(200);
  held.release();expect((await oldRead).status).toBe(403);
  const otherHeaders={authorization:`Bearer ${second.token}`};
  expect((await fetch(`${both.apiUrl}/v1/checks/${check.id}`,{headers:otherHeaders})).status).toBe(200);
  await both.worker().ready;
  const stream=await fetch(`${both.apiUrl}/v1/checks/${check.id}/events`,{headers:otherHeaders,signal:AbortSignal.timeout(15000)});
  for await(const _ of readSseFrames(stream.body!)){}
  const result=CheckResponse.parse(await(await fetch(`${both.apiUrl}/v1/checks/${check.id}`,{headers:otherHeaders})).json()).data;
  expect(result.references[0]?.outcome).toMatchObject({kind:"verdict",verdict:"correct"});
  expect((await second.call("/v1/sign-out",{everywhere:true})).status).toBe(200);
  expect((await fetch(`${both.apiUrl}/v1/checks/${check.id}/events`,{headers:otherHeaders})).status).toBe(403);
 }finally{await both.stop();}
});
