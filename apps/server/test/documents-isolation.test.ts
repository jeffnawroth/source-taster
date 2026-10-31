// SPDX-License-Identifier: AGPL-3.0-or-later
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, expect, it } from "vitest";
import { ProblemDetails } from "@source-taster/contract-verification";
import { DocumentStructuringResponse } from "@source-taster/contract-verification/document";
import { startTestService } from "./support/service.ts";
let service: Awaited<ReturnType<typeof startTestService>>;
let image: string;
beforeAll(async () => {
  const context = await mkdtemp(join(tmpdir(), "st89-isolation-probe-"));
  try {
    const base = (
      await readFile(
        new URL("../extractor.Dockerfile", import.meta.url),
        "utf8",
      )
    ).match(/^FROM .+$/m)![0];
    await cp(
      new URL("./support/extraction-probe.mjs", import.meta.url),
      join(context, "probe.mjs"),
    );
    await writeFile(
      join(context, "Dockerfile"),
      `${base}\nCOPY probe.mjs /probe.mjs\nENTRYPOINT ["node", "/probe.mjs"]\n`,
    );
    image = (
      await promisify(execFile)("docker", ["build", "--quiet", context], {
        timeout: 30000,
      })
    ).stdout.trim();
  } finally {
    await rm(context, { recursive: true, force: true });
  }
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_AUX_PORT ?? 3602),
    50,
    {
      SOURCE_TASTER_DOCUMENT_IMAGE: image,
      SOURCE_TASTER_DOCUMENT_LIMITS: JSON.stringify({
        memoryBytes: 128 * 1024 * 1024,
        outputBytes: 4096,
        concurrency: 1,
        timeoutMs: 5000,
        cpuSeconds: 1,
      }),
    },
  );
});
afterAll(async () => {
  await service?.stop();
});
function probe(command: string, signal?: AbortSignal) {
  const form = new FormData();
  form.set("file", new Blob([`%PDF-1.4\n${command}`]), "probe.pdf");
  return fetch(`${service.apiUrl}/v2/document-structurings`, {
    method: "POST",
    body: form,
    signal,
  });
}
it("denies hostile extraction credentials, host files, writes, network and privilege while enforcing OS memory/CPU/process limits", async () => {
  const response = await probe("inspect");
  expect(response.status).toBe(200);
  const { data } = DocumentStructuringResponse.parse(await response.json());
  expect(JSON.parse(data.document.text)).toEqual({
    uid: 65534,
    credentialsAbsent: true,
    hostFilesDenied: true,
    hostSocketDenied: true,
    writesDenied: true,
    databaseDenied: true,
    internetDenied: true,
    unprivileged: true,
    memory: "134217728",
    swap: "0",
    cpu: "100000 100000",
    processLimit: true,
  });
});
it.each([
  ["cpu", "document-resource-limit"],
  ["memory", "document-resource-limit"],
  ["output", "document-resource-limit"],
  ["malformed", "document-resource-limit"],
  ["timeout", "document-time-limit"],
] as const)(
  "terminates %s abuse and permits a clean later task",
  async (command, code) => {
    const response = await probe(command);
    expect(response.status).toBe(422);
    expect(ProblemDetails.parse(await response.json()).code).toBe(code);
    expect((await probe("inspect")).status).toBe(200);
  },
);

it("refuses excess concurrent extraction and frees the slot promptly on client cancellation", async () => {
  const controllers = [new AbortController(), new AbortController()];
  const requests = controllers.map((controller) =>
    probe("timeout", controller.signal).catch((error: unknown) => error),
  );
  const refused = await Promise.race(requests);
  expect(refused).toBeInstanceOf(Response);
  expect((refused as Response).status).toBe(503);
  controllers.forEach((controller) => controller.abort());
  await Promise.all(requests);
  await expect
    .poll(async () => (await probe("inspect")).status, { timeout: 3000 })
    .toBe(200);
});

it("bounds concurrent upload buffering before extraction starts", async () => {
  const controller = new AbortController();
  const pending = fetch(`${service.apiUrl}/v2/document-structurings`, {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=slow" },
    body: new ReadableStream({
      start(stream) {
        stream.enqueue(
          new TextEncoder().encode(
            '--slow\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n%PDF-1.4\n',
          ),
        );
      },
    }),
    duplex: "half",
    signal: controller.signal,
  } as RequestInit).catch((error: unknown) => error);
  try {
    await expect
      .poll(async () => (await probe("inspect")).status, { timeout: 2000 })
      .toBe(503);
  } finally {
    controller.abort();
    await pending;
  }
  await expect
    .poll(async () => (await probe("inspect")).status, { timeout: 3000 })
    .toBe(200);
});
