// SPDX-License-Identifier: AGPL-3.0-or-later
// Actual CLI + PG18 bytes. S3 alone is replaced at its HTTP adapter edge.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { generateKeyPairSync, randomBytes } from "node:crypto";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pg from "pg";
const cli = new URL("../../ops/backup.mjs", import.meta.url).pathname;
async function run(args, env) {
  const p = spawn(process.execPath, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  for (const stream of [p.stdout, p.stderr])
    stream.on("data", (b) => (output += b));
  const code = await new Promise((resolve) => p.on("exit", resolve));
  return { code, output };
}
test(
  "encrypted locked export restores retained data but never daily keys/counters; tamper, interruption and incomplete backup fail closed",
  { timeout: 120000 },
  async () => {
    assert.ok(process.env.DATABASE_ADMIN_URL, "explicit owned PG required");
    const dir = await mkdtemp(join(tmpdir(), "st116-test-"));
    const admin = new pg.Client({
      connectionString: process.env.DATABASE_ADMIN_URL,
    });
    await admin.connect();
    const names = [];
    const fresh = async (prefix) => {
      const name = prefix + randomBytes(12).toString("hex");
      names.push(name);
      await admin.query(`CREATE ROLE ${name} LOGIN PASSWORD 'fixture'`);
      await admin.query(`CREATE DATABASE ${name} OWNER ${name}`);
      const url = new URL(process.env.DATABASE_ADMIN_URL);
      url.pathname = `/${name}`;
      url.username = name;
      url.password = "fixture";
      return url.toString();
    };
    let broken = false,
      tampered = false,
      unlocked = false;
    const objects = new Map();
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, "http://localhost");
      const key = url.pathname;
      if (url.searchParams.has("object-lock"))
        return res.end("<ObjectLockEnabled>Enabled</ObjectLockEnabled>");
      if (url.searchParams.has("versioning"))
        return res.end("<Status>Enabled</Status>");
      if (url.searchParams.has("lifecycle"))
        return res.end(
          "<Status>Enabled</Status><Expiration><Days>13</Days></Expiration><NoncurrentVersionExpiration><NoncurrentDays>1</NoncurrentDays></NoncurrentVersionExpiration>",
        );
      if (req.method === "PUT") {
        if (broken) {
          req.resume();
          res.writeHead(503);
          return res.end();
        }
        const chunks = [];
        for await (const b of req) chunks.push(b);
        const version = randomBytes(8).toString("hex");
        objects.set(key, {
          data: Buffer.concat(chunks),
          version,
          until: req.headers["x-amz-object-lock-retain-until-date"],
        });
        res.setHeader("x-amz-version-id", version);
        return res.end();
      }
      const obj = objects.get(key);
      if (!obj || url.searchParams.get("versionId") !== obj.version) {
        res.writeHead(404);
        return res.end();
      }
      res.setHeader("x-amz-version-id", obj.version);
      res.setHeader(
        "x-amz-object-lock-mode",
        unlocked ? "GOVERNANCE" : "COMPLIANCE",
      );
      res.setHeader("x-amz-object-lock-retain-until-date", obj.until);
      if (req.method === "HEAD") return res.end();
      return res.end(
        tampered && !key.endsWith(".complete")
          ? Buffer.from("corrupted")
          : obj.data,
      );
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const { publicKey, privateKey } = generateKeyPairSync("rsa", {
        modulusLength: 3072,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });
      await writeFile(join(dir, "pub.pem"), publicKey);
      await writeFile(join(dir, "private.pem"), privateKey, { mode: 0o600 });
      const conf = {
        program: "verification",
        endpoint: `http://127.0.0.1:${server.address().port}`,
        bucket: "fixture-bucket",
        publicKey: join(dir, "pub.pem"),
        retentionHours: 312,
      };
      await writeFile(join(dir, "config.json"), JSON.stringify(conf));
      // PG clients inside our own container, credentials piped over stdin, never argv.
      const wrapper = `#!/usr/bin/env node\nimport {spawn} from 'node:child_process'; import {createReadStream} from 'node:fs'; import {basename} from 'node:path'; const command=basename(process.argv[1]); const args=process.argv.slice(2); const file=command==='pg_restore'?args.pop():null;  const p=spawn('docker',['exec','-i','${process.env.OPS_TEST_PG_CONTAINER ?? "st116-owned-pg"}','sh','-c','IFS= read -r PGDATABASE; IFS= read -r PGUSER; IFS= read -r PGPASSWORD; export PGDATABASE PGUSER PGPASSWORD; export PGHOST=127.0.0.1 PGPORT=5432; exec "$@"','--',command,...args],{stdio:['pipe','inherit','inherit']});p.stdin.write([process.env.PGDATABASE,process.env.PGUSER,process.env.PGPASSWORD,''].join(String.fromCharCode(10)));if(file)createReadStream(file).pipe(p.stdin);else p.stdin.end();p.on('exit',c=>process.exit(c??1));\n`;
      for (const name of ["pg_dump", "pg_restore"])
        await writeFile(join(dir, name), wrapper, { mode: 0o700 });
      const source = await fresh("st_source_");
      const db = new pg.Client({ connectionString: source });
      await db.connect();
      await db.query(
        `CREATE SCHEMA verification; CREATE SCHEMA verification_boss; CREATE TABLE verification.retained(kind text, payload text, expires_at timestamptz); INSERT INTO verification.retained VALUES ('consented-history','HISTORY-FIXTURE','2026-11-20'),('legal','LEGAL-FIXTURE','2034-11-04'),('transient-ciphertext','opaque-ciphertext','2026-11-05'); CREATE UNLOGGED TABLE verification.daily_keys(secret text); INSERT INTO verification.daily_keys VALUES ('NEVER-EXPORT-DAILY-KEY'); CREATE TABLE verification.abuse_counters(secret text); INSERT INTO verification.abuse_counters VALUES ('NEVER-EXPORT-COUNTER');`,
      );
      await db.end();
      const env = {
        OPS_CONFIG: join(dir, "config.json"),
        OPS_LOOPBACK_FIXTURES: "1",
        AWS_ACCESS_KEY_ID: "fixture",
        AWS_SECRET_ACCESS_KEY: "fixture",
        DATABASE_URL: source,
        PATH: `${dir}:${process.env.PATH}`,
      };
      const exported = await run([cli, "export"], env);
      assert.equal(exported.code, 0, exported.output);
      const receipt = JSON.parse(exported.output);
      assert.equal(receipt.complete, true);
      const bytes = objects.get("/fixture-bucket/" + receipt.key).data;
      for (const secret of [
        "HISTORY-FIXTURE",
        "LEGAL-FIXTURE",
        "NEVER-EXPORT-DAILY-KEY",
        "NEVER-EXPORT-COUNTER",
      ])
        assert.equal(bytes.includes(Buffer.from(secret)), false);
      await writeFile(join(dir, "receipt"), exported.output);
      const target = await fresh("st_restore_");
      const restoreEnv = {
        ...env,
        OPS_PRIVATE_KEY: join(dir, "private.pem"),
        OPS_BACKUP_RECEIPT: join(dir, "receipt"),
        OPS_RESTORE_TARGET_URL: target,
        OPS_DRILL_DISRUPTION_AT: new Date().toISOString(),
      };
      const restored = await run([cli, "restore-isolated"], restoreEnv);
      assert.equal(restored.code, 0, restored.output);
      assert.equal(JSON.parse(restored.output).cloudQualified, false);
      const recovered = new pg.Client({ connectionString: target });
      await recovered.connect();
      assert.deepEqual(
        (
          await recovered.query(
            "SELECT kind,payload,expires_at::text FROM verification.retained ORDER BY kind",
          )
        ).rows.map((r) => [r.kind, r.payload, r.expires_at.slice(0, 10)]),
        [
          ["consented-history", "HISTORY-FIXTURE", "2026-11-20"],
          ["legal", "LEGAL-FIXTURE", "2034-11-04"],
          ["transient-ciphertext", "opaque-ciphertext", "2026-11-05"],
        ],
      );
      assert.equal(
        (await recovered.query("SELECT * FROM verification.daily_keys"))
          .rowCount,
        0,
      );
      assert.equal(
        (await recovered.query("SELECT * FROM verification.abuse_counters"))
          .rowCount,
        0,
      );
      assert.equal(
        (await recovered.query("SELECT blocked FROM public.ops_recovery_fence"))
          .rows[0].blocked,
        true,
      );
      await recovered.end();
      assert.equal(
        (await run([cli, "restore-isolated"], restoreEnv)).code,
        78,
        "never overwrite existing target",
      );
      tampered = true;
      assert.equal((await run([cli, "restore-isolated"], restoreEnv)).code, 78);
      tampered = false;
      objects.delete("/fixture-bucket/" + receipt.key + ".complete");
      assert.equal(
        (await run([cli, "restore-isolated"], restoreEnv)).code,
        78,
        "missing complete part",
      );
      unlocked = true;
      assert.equal((await run([cli, "export"], env)).code, 78);
      unlocked = false;
      broken = true;
      assert.equal((await run([cli, "export"], env)).code, 78);
      assert.equal(
        (await readFile(join(dir, "receipt"), "utf8")).includes(
          "fixture-bucket",
        ),
        false,
      );
    } finally {
      await new Promise((resolve) => server.close(resolve));
      for (const name of names.reverse()) {
        await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
        await admin.query(`DROP ROLE IF EXISTS ${name}`);
      }
      await admin.end();
      await rm(dir, { recursive: true, force: true });
    }
  },
);
