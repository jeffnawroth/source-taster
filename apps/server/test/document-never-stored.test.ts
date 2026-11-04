// SPDX-License-Identifier: AGPL-3.0-or-later
// #91 AC3 (ADR-0005/0012): the raw upload must not outlive the request. The
// upload path is stateless, so "deleted in the same transaction that stores its
// References" holds because nothing durable ever holds the raw bytes. This test
// proves the absence, for a successful upload (including the Check that stores
// its References) and for uploads rejected at each stage.
//
// Durable means: every table of the owned database (all schemas, UNLOGGED ones
// and pg-boss included, large objects), and the temp directory the service
// owns. Encryption at rest (AC4) would hide a verbatim copy from a text scan, so
// the primary witness is storage growth with incompressible, unencryptable-to-
// smaller bytes; the text scans are a second layer. Both scanners get positive
// controls so they cannot pass blind.
import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import pg from "pg";
import { afterAll, beforeAll, expect, it } from "vitest";
import { ProblemDetails } from "@source-taster/contract-verification";
import { DocumentStructuringResponse } from "@source-taster/contract-verification/document";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { docx, pdf, upload } from "./support/documents.ts";
import { startDoiFixtures, physicsReference } from "./support/doi-fixtures.ts";
import { startTestService } from "./support/service.ts";

const MB = 1024 * 1024;
let service: Awaited<ReturnType<typeof startTestService>>;
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let temp: string;
let db: pg.Client;
let baselineEntries: string[];
let baselineContainers: Set<string>;

beforeAll(async () => {
  // The service children inherit only what the fixture passes, so a private
  // TMPDIR is the one place `os.tmpdir()` writers in the service could land.
  temp = await mkdtemp(join(tmpdir(), "st91-never-stored-"));
  fixtures = await startDoiFixtures();
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_NEVER_STORED_PORT ?? 3604),
    50,
    { ...fixtures.env, TMPDIR: temp },
  );
  const owned = new URL(service.adminUrl);
  owned.pathname = new URL(service.appUrl).pathname;
  db = new pg.Client({ connectionString: owned.toString() });
  await db.connect();
  baselineEntries = await readdir(temp);
  baselineContainers = await extractorContainers();
});
afterAll(async () => {
  await db?.end();
  await service?.stop();
  await fixtures?.stop();
  await rm(temp, { recursive: true, force: true });
});

/** Search needles for bytes: verbatim, hex (how bytea prints) and base64. */
function needles(bytes: Uint8Array): string[] {
  const buffer = Buffer.from(bytes);
  const found = [buffer.toString("latin1"), buffer.toString("hex")];
  // Base64 depends on the offset in the surrounding stream; the middle of each
  // alignment is stable, so probe all three.
  for (const pad of [0, 1, 2])
    found.push(
      Buffer.concat([Buffer.alloc(pad), buffer])
        .toString("base64")
        .slice(4, -4),
    );
  return found;
}

interface Marker {
  /** Present verbatim in the upload, never in the extracted text. */
  text: string;
  random: Uint8Array;
  needles: string[];
}
function marker(): Marker {
  const text = `NOSTORE-${crypto.randomUUID()}`;
  const random = randomBytes(32);
  return {
    text,
    random,
    needles: [...needles(new TextEncoder().encode(text)), ...needles(random)],
  };
}

async function tables() {
  const { rows } = await db.query<{
    schema: string;
    name: string;
    oid: number;
  }>(
    `SELECT n.nspname AS schema, c.relname AS name, c.oid
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind IN ('r', 'p', 'm')
        AND n.nspname NOT IN ('pg_catalog', 'information_schema')
        AND n.nspname NOT LIKE 'pg_toast%'`,
  );
  return rows;
}
const qualified = (table: { schema: string; name: string }) =>
  `${db.escapeIdentifier(table.schema)}.${db.escapeIdentifier(table.name)}`;

/** Row bytes plus on-disk relation size (heap, TOAST and indexes). */
async function databaseBytes() {
  let rowBytes = 0;
  const list = await tables();
  for (const table of list) {
    const { rows } = await db.query<{ bytes: string }>(
      `SELECT coalesce(sum(pg_column_size(x.*)), 0)::bigint AS bytes FROM ${qualified(table)} x`,
    );
    rowBytes += Number(rows[0]!.bytes);
  }
  const { rows } = await db.query<{ bytes: string }>(
    `SELECT coalesce(sum(pg_total_relation_size(oid)), 0)::bigint AS bytes
       FROM pg_class WHERE oid = ANY($1)`,
    [list.map((table) => table.oid)],
  );
  return { rowBytes, relationBytes: Number(rows[0]!.bytes) };
}

/** Every `schema.table` whose row text contains any needle, plus large objects. */
async function databaseHits(found: string[]) {
  const searchable = found.filter((value) => value && !value.includes("\0"));
  const hits: string[] = [];
  for (const table of await tables())
    for (const needle of searchable) {
      const { rows } = await db.query<{ hit: boolean }>(
        `SELECT EXISTS (SELECT 1 FROM ${qualified(table)} x WHERE position($1::text in x::text) > 0) AS hit`,
        [needle],
      );
      if (rows[0]!.hit) {
        hits.push(`${table.schema}.${table.name}`);
        break;
      }
    }
  const { rows } = await db.query<{ count: string }>(
    "SELECT count(*) FROM pg_largeobject_metadata",
  );
  if (Number(rows[0]!.count) > 0) hits.push("pg_largeobject");
  return hits;
}

async function filesBelow(directory: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) out.push(...(await filesBelow(path)));
    else out.push(path);
  }
  return out;
}
async function fileHits(found: string[]) {
  const hits: string[] = [];
  for (const path of await filesBelow(temp)) {
    const content = await readFile(path);
    if (found.some((needle) => content.includes(Buffer.from(needle, "latin1"))))
      hits.push(path);
  }
  return hits;
}

async function extractorContainers() {
  const { stdout } = await promisify(execFile)("docker", [
    "ps",
    "-a",
    "--filter",
    "name=source-taster-extract-",
    "--format",
    "{{.Names}}",
  ]);
  return new Set(stdout.split("\n").filter(Boolean));
}

/** Nothing durable holds the upload: tables, large objects, temp files. */
async function expectNothingStored(
  found: Marker,
  before: Awaited<ReturnType<typeof databaseBytes>>,
  payloadBytes: number,
) {
  const after = await databaseBytes();
  // Random bytes cannot shrink under TOAST compression or encryption, so a
  // stored copy would grow storage by roughly the payload. Allow a fraction for
  // legitimate row writes of the same request.
  const allowance = payloadBytes / 4;
  expect(after.rowBytes - before.rowBytes, "row bytes grew").toBeLessThan(
    allowance,
  );
  expect(
    after.relationBytes - before.relationBytes,
    "relation bytes grew",
  ).toBeLessThan(allowance);
  expect(
    await databaseHits(found.needles),
    "tables or large objects hold the upload",
  ).toEqual([]);
  expect(await fileHits(found.needles), "temp files hold the upload").toEqual(
    [],
  );
  expect(await readdir(temp), "service temp directory changed").toEqual(
    baselineEntries,
  );
  await expect
    .poll(
      async () =>
        [...(await extractorContainers())].filter(
          (name) => !baselineContainers.has(name),
        ),
      { message: "extractor containers were left behind" },
    )
    .toEqual([]);
}

it("scanners see a copy: positive controls for the database and temp-file witnesses", async () => {
  const found = marker();
  const payload = randomBytes(2 * MB);
  const before = await databaseBytes();
  // A copy kept in any durable shape must trip the witnesses.
  await db.query(
    "CREATE TABLE st91_control (text_copy text, bytea_copy bytea)",
  );
  try {
    await db.query("INSERT INTO st91_control VALUES ($1, $2)", [
      found.text,
      Buffer.concat([Buffer.from(found.random), payload]),
    ]);
    const after = await databaseBytes();
    expect(after.rowBytes - before.rowBytes).toBeGreaterThan(MB);
    expect(after.relationBytes - before.relationBytes).toBeGreaterThan(MB);
    const hits = await databaseHits(found.needles);
    expect(hits).toEqual(["public.st91_control"]);
    // The base64 and hex shapes are found as well as the verbatim text.
    await db.query("DELETE FROM st91_control");
    await db.query("INSERT INTO st91_control (text_copy) VALUES ($1)", [
      Buffer.from(found.random).toString("base64"),
    ]);
    expect(await databaseHits(found.needles)).toEqual(["public.st91_control"]);
  } finally {
    await db.query("DROP TABLE st91_control");
  }
  await mkdir(join(temp, "nested"));
  await writeFile(join(temp, "nested", "copy.bin"), Buffer.from(found.random));
  try {
    expect(await fileHits(found.needles)).toEqual([
      join(temp, "nested", "copy.bin"),
    ]);
  } finally {
    await rm(join(temp, "nested"), { recursive: true, force: true });
  }
});

it("stores no raw bytes of a successful upload, nor after its References are stored in a Check", async () => {
  const found = marker();
  const payload = randomBytes(3 * MB);
  const file = await docx([physicsReference], {
    stored: [
      // Named and filled with the marker, but not part of the extracted text.
      {
        name: "word/media/secret.txt",
        bytes: new TextEncoder().encode(found.text),
      },
      { name: "word/media/random-marker.bin", bytes: found.random },
      { name: "word/media/payload.bin", bytes: payload },
    ],
  });
  expect(file.byteLength).toBeGreaterThan(3 * MB);
  const before = await databaseBytes();

  const response = await upload(service.apiUrl, file, "private-thesis.docx");
  expect(response.status).toBe(200);
  const body = await response.text();
  const { data } = DocumentStructuringResponse.parse(JSON.parse(body));
  expect(data.document.text).toBe(physicsReference);
  expect(body).not.toContain(found.text);
  expect(data.structuring.references).toHaveLength(1);
  await expectNothingStored(found, before, payload.byteLength);

  // The Check commits the References' content in its own transaction. The raw
  // upload is still nowhere: only the Reference text was added.
  const created = await fetch(`${service.apiUrl}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: data.structuring.references.map((reference) => ({
        originalText: reference.originalText,
        fields: reference.csl,
      })),
    }),
  });
  expect(created.status).toBe(201);
  const check = CheckResponse.parse(await created.json()).data;
  await expect
    .poll(async () => {
      const current = await fetch(`${service.apiUrl}/v2/checks/${check.id}`);
      return CheckResponse.parse(await current.json()).data.state;
    })
    .toBe("ended");
  const stored = await db.query<{ count: string }>(
    "SELECT count(*) FROM pg_largeobject_metadata",
  );
  expect(Number(stored.rows[0]!.count)).toBe(0);
  await expectNothingStored(found, before, payload.byteLength);
});

it.each([
  [
    "oversized (rejected up front from Content-Length)",
    (found: Marker) =>
      Buffer.concat([
        Buffer.from(found.text),
        Buffer.from(found.random),
        randomBytes(21 * MB),
      ]),
    413,
    "document-size-limit",
  ],
  [
    "unsupported format (rejected at the format check)",
    (found: Marker) =>
      Buffer.concat([
        Buffer.from(`not a document ${found.text}`),
        Buffer.from(found.random),
        randomBytes(3 * MB),
      ]),
    415,
    "document-unsupported",
  ],
  [
    "unreadable PDF (rejected after extraction)",
    (found: Marker) =>
      Buffer.concat([
        Buffer.from(`%PDF-1.4\nbroken ${found.text}`),
        Buffer.from(found.random),
        randomBytes(3 * MB),
      ]),
    422,
    "document-unreadable",
  ],
  [
    "encrypted PDF (rejected after extraction)",
    (found: Marker) => Buffer.from(pdf([[found.text]], { encrypted: true })),
    422,
    "document-encrypted",
  ],
] as const)(
  "stores no raw bytes of a failed upload: %s",
  async (_name, build, status, code) => {
    const found = marker();
    const bytes = build(found);
    const before = await databaseBytes();
    const response = await upload(
      service.apiUrl,
      new Uint8Array(bytes),
      "private-name.pdf",
    );
    expect(response.status).toBe(status);
    const body = await response.text();
    expect(ProblemDetails.parse(JSON.parse(body)).code).toBe(code);
    expect(body).not.toContain(found.text);
    // Large uploads also get the growth bound; a small PDF relies on the scans.
    await expectNothingStored(
      found,
      before,
      Math.max(bytes.byteLength, 3 * MB),
    );
  },
);

it("stores no raw bytes of an oversized chunked upload, which is rejected while streaming", async () => {
  // Without Content-Length the bytes are read and counted on the wire before
  // the limit trips, so this is the stage where a spool could exist.
  const found = marker();
  const head = Buffer.from(
    `--chunked\r\nContent-Disposition: form-data; name="file"; filename="large.pdf"\r\n\r\n${found.text}`,
  );
  const before = await databaseBytes();
  const response = await fetch(`${service.apiUrl}/v2/document-structurings`, {
    method: "POST",
    headers: { "content-type": "multipart/form-data; boundary=chunked" },
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(head));
        controller.enqueue(new Uint8Array(found.random));
        for (let index = 0; index < 22; index++)
          controller.enqueue(new Uint8Array(randomBytes(MB)));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit);
  expect(response.status).toBe(413);
  const body = await response.text();
  expect(ProblemDetails.parse(JSON.parse(body)).code).toBe(
    "document-size-limit",
  );
  expect(body).not.toContain(found.text);
  await expectNothingStored(found, before, 3 * MB);
});
