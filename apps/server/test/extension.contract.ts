// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { expect, test } from "vitest";
import {
  ExtensionSignInChallengeResponse,
  ExtensionSignInConfirmResponse,
  AccountTokenResponse,
} from "@source-taster/contract-service";
import { CheckResponse } from "@source-taster/contract-verification";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { bothPrograms } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";
const origin = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
async function extension(
  b: Awaited<ReturnType<typeof bothPrograms>>,
  email = "real@example.invalid",
) {
  const request = (path: string, body?: unknown, credential?: string) =>
    fetch(b.serviceUrl + "/v1/extension" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        origin,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(credential ? { authorization: `Bearer ${credential}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  const challenge = await request("/sign-in/challenges", {
    email,
    language: "en",
  });
  expect(challenge.status).toBe(200);
  const pending = ExtensionSignInChallengeResponse.parse(
    await challenge.json(),
  ).data;
  const code = (await b.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
  const confirmed = await request("/sign-in/confirm", {
    challengeId: pending.challengeId,
    transactionCredential: pending.transactionCredential,
    code,
  });
  expect(confirmed.status).toBe(200);
  const signed = ExtensionSignInConfirmResponse.parse(
    await confirmed.json(),
  ).data;
  const call = (path: string, body?: unknown) =>
    request(path, body, signed.sessionCredential);
  const token = AccountTokenResponse.parse(
    await (await call("/account-tokens", {})).json(),
  ).data.accessToken;
  return { ...signed, token, call };
}
test("real mail extension and cookie clients share Owner and Checks but sign-out here drains only its session", async () => {
  const b = await bothPrograms({
    accounts: true,
    extensionOrigins: [origin],
    startWorker: false,
  });
  try {
    const web = await b.signIn("real@example.invalid");
    const ext = await extension(b);
    expect(ext.session).toEqual(web.data);
    const headers = {
      authorization: `Bearer ${ext.token}`,
      "content-type": "application/json",
    };
    const create = await fetch(b.apiUrl + "/v1/checks", {
      method: "POST",
      headers,
      body: JSON.stringify({ text: physicsReference }),
    });
    expect(create.status).toBe(201);
    const check = CheckResponse.parse(await create.json()).data;
    const read = (token: string, suffix = "") =>
      fetch(`${b.apiUrl}/v1/checks/${check.id}${suffix}`, {
        headers: { authorization: `Bearer ${token}` },
      });
    expect((await read(web.token)).status).toBe(200);
    const quota=async(token:string)=>(await fetch(b.apiUrl+"/v2/quota",{headers:{authorization:`Bearer ${token}`}})).json();
    expect(await quota(web.token)).toEqual(await quota(ext.token));
    const download=(token:string)=>fetch(`${b.apiUrl}/v2/checks/${check.id}/export`,{method:"POST",headers:{authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify({format:"csl-json",mode:"original"})});
    expect((await download(ext.token)).status).toBe(200);
    const guest = await b.issue();
    expect((await read(guest.token)).status).toBe(404);
    const held = b.trap("check:read", "request");
    const stale = read(ext.token);
    await held.arrived;
    expect((await ext.call("/sign-out", { everywhere: false })).status).toBe(
      200,
    );
    held.release();
    expect((await stale).status).toBe(403);
    expect((await download(ext.token)).status).toBe(403);
    expect((await read(web.token)).status).toBe(200);
    await b.worker().ready;
    const stream = await read(web.token, "/events");
    for await (const _ of readSseFrames(stream.body!)) {
      /* actual signed authority + real worker */
    }
    expect(
      CheckResponse.parse(await (await read(web.token)).json()).data
        .references[0]?.outcome,
    ).toMatchObject({ kind: "verdict", verdict: "correct" });
    await b.advance(60000);
    const ext2 = await extension(b);
    expect((await web.call("/v1/sign-out", { everywhere: false })).status).toBe(
      200,
    );
    expect((await read(web.token)).status).toBe(403);
    expect((await read(ext2.token)).status).toBe(200);
    expect((await ext2.call("/sign-out", { everywhere: true })).status).toBe(
      200,
    );
    for (const suffix of ["", "/events"])
      expect((await read(ext2.token, suffix)).status).toBe(403);
    expect((await ext2.call("/account-tokens", {})).status).toBe(401);
    expect((await download(ext2.token)).status).toBe(403);
  } finally {
    await b.stop();
  }
});

test("a real restored private dump cannot revive revoked sessions, consumed proofs, or stale JWT authority", async () => {
  const b = await bothPrograms({ accounts: true, extensionOrigins: [origin] });
  try {
    const web = await b.signIn("real@example.invalid"),
      ext = await extension(b);
    const container = process.env.SOURCE_TASTER_TEST_POSTGRES_CONTAINER;
    if (!container)
      throw new Error(
        "Set the test-owned PostgreSQL container for actual pg_dump/psql restore acceptance",
      );
    const database = new URL(b.urls[1]!).pathname.slice(1);
    const dump = spawnSync(
      "docker",
      [
        "exec",
        container,
        "pg_dump",
        "-U",
        "postgres",
        "--schema=service",
        database,
      ],
      { maxBuffer: 20 * 1024 * 1024 },
    );
    expect(dump.status).toBe(0);
    expect((await ext.call("/sign-out", { everywhere: true })).status).toBe(
      200,
    );
    const config = JSON.parse(await readFile(b.accountConfigPath, "utf8"));
    let restoredOffline=false;
    await b.restartService(async () => {
      await writeFile(
        b.accountConfigPath,
        JSON.stringify({
          ...config,
          authorityEpoch: "restore-real-generation-0002",
        }),
      );
      const restored = spawnSync(
        "docker",
        [
          "exec",
          "-i",
          container,
          "psql",
          "-X",
          "-v",
          "ON_ERROR_STOP=1",
          "-U",
          "postgres",
          database,
        ],
        {
          input: Buffer.concat([
            Buffer.from("DROP SCHEMA service CASCADE;\n"),
            dump.stdout,
          ]),
          maxBuffer: 20 * 1024 * 1024,
        },
      );
      expect(restored.status).toBe(0);
      restoredOffline=true;
    });
    expect(restoredOffline).toBe(true);
    expect((await ext.call("/session")).status).toBe(401);
    expect((await web.call("/v1/account-tokens", {})).status).toBe(401);
    expect(
      (
        await fetch(b.apiUrl + "/v2/quota", {
          headers: { authorization: `Bearer ${ext.token}` },
        })
      ).status,
    ).toBe(403);
    const fresh = await extension(b);
    expect(fresh.session).toEqual(ext.session);
    expect(
      (
        await fetch(b.apiUrl + "/v2/quota", {
          headers: { authorization: `Bearer ${fresh.token}` },
        })
      ).status,
    ).toBe(200);
  } finally {
    await b.stop();
  }
});

test("extension authority fails closed across JWT expiry, logout renewal races and a real service partition",async()=>{
 const b=await bothPrograms({accounts:true,extensionOrigins:[origin]});
 try {
  const ext=await extension(b);
  const quota=(token:string)=>fetch(b.apiUrl+"/v2/quota",{headers:{authorization:`Bearer ${token}`}});
  expect((await quota(ext.token)).status).toBe(200);
  await b.advance(300000);
  expect((await quota(ext.token)).status).toBe(401);
  const renewed=AccountTokenResponse.parse(await (await ext.call("/account-tokens",{})).json()).data.accessToken;
  expect((await quota(renewed)).status).toBe(200);
  await b.service().stop();
  expect((await quota(renewed)).status).toBe(503);
  await b.restartService();
  const [token,logout]=await Promise.all([ext.call("/account-tokens",{}),ext.call("/sign-out",{everywhere:false})]);
  expect(logout.status).toBe(200);
  expect([200,401]).toContain(token.status);
  if(token.ok) expect((await quota(AccountTokenResponse.parse(await token.json()).data.accessToken)).status).toBe(403);
  expect((await ext.call("/session")).status).toBe(401);
  expect((await quota(renewed)).status).toBe(403);
 } finally {await b.stop();}
});
