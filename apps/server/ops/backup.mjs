import { schemaIdentity } from "./schema.mjs";
import { postgresEnvironment } from "./postgres.mjs";
// SPDX-License-Identifier: AGPL-3.0-or-later
// Public-key encrypted export; offline private key is never needed by exporter.
import { spawn } from "node:child_process";
import {
  createCipheriv,
  createDecipheriv,
  publicEncrypt,
  privateDecrypt,
  randomBytes,
  constants,
  createPublicKey,
} from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { readFile, writeFile, open, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { storage, fileHash } from "./storage.mjs";
import { databaseExportFlags } from "../scripts/export-database.ts";
const program = "verification",
  schema = "verification";
const limit = 1024 ** 3;
export async function configuration() {
  const c = JSON.parse(await readFile(process.env.OPS_CONFIG, "utf8"));
  if (c.program !== program || !c.publicKey || c.retentionHours !== 312)
    throw Error("backup-config");
  return c;
}
function bounded() {
  let size = 0;
  return new Transform({
    transform(b, _, cb) {
      size += b.length;
      cb(size > limit ? Error("backup-limit") : null, b);
    },
  });
}
function child(command, args, url) {
  const p = spawn(command, args, {
    env: postgresEnvironment(url),
    stdio: ["ignore", "pipe", "ignore"],
  });
  const done = new Promise((resolve, reject) => {
    p.once("error", reject);
    p.once("exit", (c) =>
      c === 0 ? resolve() : reject(Error("database-command")),
    );
  });
  done.catch(() => {});
  return { p, done };
}
async function encrypt(c, file) {
  const key = randomBytes(32),
    iv = randomBytes(12);
  const pub = createPublicKey(await readFile(c.publicKey));
  if (
    pub.asymmetricKeyType !== "rsa" ||
    pub.asymmetricKeyDetails.modulusLength < 3072
  )
    throw Error("backup-key");
  const header = Buffer.from(
    JSON.stringify({
      version: 1,
      schemaVersion: await schemaIdentity(process.env.DATABASE_URL),
      program,
      schema,
      createdAt: new Date().toISOString(),
      iv: iv.toString("base64"),
      key: publicEncrypt(
        {
          key: pub,
          oaepHash: "sha256",
          padding: constants.RSA_PKCS1_OAEP_PADDING,
        },
        key,
      ).toString("base64"),
    }),
  );
  const length = Buffer.alloc(4);
  length.writeUInt32BE(header.length);
  const aad = Buffer.concat([Buffer.from("STB1"), length, header]);
  await writeFile(file, aad, { mode: 0o600, flag: "wx" });
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(aad);
  const db = new URL(process.env.DATABASE_URL);
  if (db.searchParams.has("schema")) db.searchParams.delete("schema");
  const { p, done } = child(
    "pg_dump",
    [
      "--format=custom",
      `--schema=${schema}`,
      `--schema=${schema}_boss`,
      ...databaseExportFlags,
    ],
    db.toString(),
  );
  const timer = setTimeout(() => p.kill("SIGKILL"), 300000);
  try {
    await Promise.all([
      pipeline(
        p.stdout,
        bounded(),
        cipher,
        createWriteStream(file, { flags: "a" }),
      ),
      done,
    ]);
    const fd = await open(file, "a");
    try {
      await fd.write(cipher.getAuthTag());
    } finally {
      await fd.close();
    }
  } finally {
    clearTimeout(timer);
    p.kill();
    key.fill(0);
  }
}
async function decrypt(file, target) {
  const size = (await stat(file)).size;
  if (size < 100 || size > limit + 65536) throw Error("backup-size");
  const fd = await open(file, "r");
  let aad, h, tag;
  try {
    const prefix = Buffer.alloc(8);
    await fd.read(prefix, 0, 8, 0);
    const n = prefix.readUInt32BE(4);
    if (prefix.subarray(0, 4).toString() !== "STB1" || n > 8192 || n < 1)
      throw Error("backup-format");
    aad = Buffer.alloc(8 + n);
    await fd.read(aad, 0, aad.length, 0);
    h = JSON.parse(aad.subarray(8).toString());
    if (
      h.version !== 1 ||
      h.program !== program ||
      h.schema !== schema ||
      !Number.isFinite(Date.parse(h.createdAt))
    )
      throw Error("backup-program");
    tag = Buffer.alloc(16);
    await fd.read(tag, 0, 16, size - 16);
  } finally {
    await fd.close();
  }
  const key = privateDecrypt(
    {
      key: await readFile(process.env.OPS_PRIVATE_KEY),
      oaepHash: "sha256",
      padding: constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(h.key, "base64"),
  );
  try {
    const cipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(h.iv, "base64"),
    );
    cipher.setAAD(aad);
    cipher.setAuthTag(tag);
    await pipeline(
      createReadStream(file, { start: aad.length, end: size - 17 }),
      cipher,
      bounded(),
      createWriteStream(target, { flags: "wx", mode: 0o600 }),
    );
  } finally {
    key.fill(0);
  }
  return h;
}
async function main() {
  const c = await configuration();
  const s3 = storage(c);
  await s3.qualify();
  const dir = await mkdtemp(join(tmpdir(), "st-backup-"));
  try {
    const file = join(dir, "encrypted");
    if (process.argv[2] === "export") {
      if (!process.env.DATABASE_URL || process.env.OPS_PRIVATE_KEY)
        throw Error("backup-environment");
      const startedAt = new Date().toISOString();
      await encrypt(c, file);
      const hash = await fileHash(file),
        key = `${program}/${randomBytes(16).toString("hex")}.stb`;
      const retainUntil = new Date(
        Date.parse(startedAt) + c.retentionHours * 3600000,
      ).toISOString();
      const version = await s3.put(key, file, retainUntil);
      await s3.verify(key, version, retainUntil, hash);
      const receipt = {
        format: 1,
        program,
        key,
        version,
        sha256: hash,
        startedAt,
        retainUntil,
        complete: true,
      };
      const manifest = join(dir, "manifest");
      await writeFile(manifest, JSON.stringify(receipt), { mode: 0o600 });
      const manifestVersion = await s3.put(
        `${key}.complete`,
        manifest,
        retainUntil,
      );
      await s3.verify(
        `${key}.complete`,
        manifestVersion,
        retainUntil,
        await fileHash(manifest),
      );
      console.log(JSON.stringify({ ...receipt, manifestVersion }));
    } else if (process.argv[2] === "restore-isolated") {
      const r = JSON.parse(
        await readFile(process.env.OPS_BACKUP_RECEIPT, "utf8"),
      );
      if (
        !r.complete ||
        r.format !== 1 ||
        r.program !== program ||
        !/^verification\/[a-f0-9]{32}\.stb$/.test(r.key) ||
        !r.manifestVersion ||
        !r.version ||
        !/^[a-f0-9]{64}$/.test(r.sha256)
      )
        throw Error("backup-receipt");
      const manifest = join(dir, "manifest");
      await s3.download(`${r.key}.complete`, r.manifestVersion, manifest);
      const committed = JSON.parse(await readFile(manifest, "utf8"));
      for (const k of [
        "format",
        "program",
        "complete",
        "key",
        "version",
        "sha256",
        "startedAt",
        "retainUntil",
      ])
        if (committed[k] !== r[k]) throw Error("backup-incomplete");
      await s3.verify(r.key, r.version, r.retainUntil, r.sha256);
      await s3.download(r.key, r.version, file);
      if ((await fileHash(file)) !== r.sha256) throw Error("backup-integrity");
      const dump = join(dir, "restore.dump");
      const header = await decrypt(file, dump);
      const { isolatedRestore } = await import("./restore.mjs");
      await isolatedRestore(dump, header);
    } else throw Error("backup-command");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
if (import.meta.main) {
  process.umask(0o077);
  try {
    await main();
  } catch {
    console.error(
      JSON.stringify({ version: 1, complete: false, code: "backup-refused" }),
    );
    process.exitCode = 78;
  }
}
