// SPDX-License-Identifier: AGPL-3.0-or-later
// External adapter edge: genuine pg_dump/psql of an owned disposable database.
// The PostgreSQL 18 client runs in the server's own image, so no host client of
// another major version is needed. Dumps stay in a private temp directory.
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pg from "pg";
import { databaseExportFlags } from "../../scripts/export-database.ts";
import { testDatabase } from "./processes.ts";

const image = process.env.SOURCE_TASTER_TEST_PG_CLIENT_IMAGE ?? "postgres:18";

function client(args: string[], url: string, mount: string) {
  const target = new URL(url);
  if (target.hostname === "localhost") target.hostname = "127.0.0.1";
  const result = spawnSync(
    "docker",
    [
      "run",
      "--rm",
      "--network",
      "host",
      "-v",
      `${mount}:/backup`,
      "-e",
      `PGPASSWORD=${decodeURIComponent(target.password)}`,
      image,
      ...args,
      "--dbname",
      `postgres://${target.username}@${target.host}${target.pathname}`,
    ],
    { encoding: "utf8" },
  );
  // Never echo dump/restore output: it can contain content and identifiers.
  if (result.status !== 0)
    throw new Error(`${args[0]} failed with status ${result.status}`);
}

export interface Backup {
  /** The dump's plain SQL text, for absence checks only. */
  text(): Promise<string>;
  /** Restores into a fresh owned database and role. */
  restore(): Promise<{ adminUrl: string; appUrl: string }>;
  discard(): Promise<void>;
}

/** A plain-format dump of the owned database, as an operator export would take it. */
export async function backup(
  adminUrl: string,
  appUrl: string,
  options: { unloggedData: boolean },
): Promise<Backup> {
  const dir = await mkdtemp(join(tmpdir(), "st-91-backup-"));
  const source = new URL(adminUrl);
  source.pathname = new URL(appUrl).pathname;
  try {
    client(
      [
        "pg_dump",
        "--format=plain",
        ...databaseExportFlags.filter(
          (flag) =>
            !options.unloggedData || flag !== "--no-unlogged-table-data",
        ),
        "--file=/backup/dump.sql",
      ],
      source.toString(),
      dir,
    );
  } catch (error) {
    await rm(dir, { recursive: true, force: true });
    throw error;
  }
  return {
    text: () => readFile(join(dir, "dump.sql"), "utf8"),
    async restore() {
      const target = testDatabase();
      const app = new URL(target.appUrl);
      const role = decodeURIComponent(app.username);
      const database = app.pathname.slice(1);
      const admin = new pg.Client({ connectionString: target.adminUrl });
      await admin.connect();
      try {
        const ident = (name: string) => admin.escapeIdentifier(name);
        await admin.query(
          `CREATE ROLE ${ident(role)} LOGIN PASSWORD ${admin.escapeLiteral(decodeURIComponent(app.password))}`,
        );
        await admin.query(
          `CREATE DATABASE ${ident(database)} OWNER ${ident(role)}`,
        );
        await admin.query(
          `ALTER ROLE ${ident(role)} IN DATABASE ${ident(database)} SET search_path = verification`,
        );
        client(
          [
            "psql",
            "--quiet",
            "--set=ON_ERROR_STOP=1",
            "--file=/backup/dump.sql",
          ],
          target.appUrl,
          dir,
        );
        return target;
      } catch (error) {
        await admin.query(
          `DROP DATABASE IF EXISTS ${admin.escapeIdentifier(database)} WITH (FORCE)`,
        );
        await admin.query(
          `DROP ROLE IF EXISTS ${admin.escapeIdentifier(role)}`,
        );
        throw error;
      } finally {
        await admin.end();
      }
    },
    discard: () => rm(dir, { recursive: true, force: true }),
  };
}
