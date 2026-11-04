import { postgresEnvironment } from "./postgres.mjs";
// SPDX-License-Identifier: AGPL-3.0-or-later
// Restore only to an explicitly named, empty isolated database, under its owner.
import pg from "pg";
import { spawn } from "node:child_process";
export async function isolatedRestore(dump, header) {
  const url = new URL(process.env.OPS_RESTORE_TARGET_URL);
  const name = url.pathname.slice(1);
  if (
    !/^st_restore_[a-f0-9]{24}$/.test(name) ||
    decodeURIComponent(url.username) !== name ||
    !process.env.OPS_DRILL_DISRUPTION_AT
  )
    throw Error("restore-target");
  const disruption = Date.parse(process.env.OPS_DRILL_DISRUPTION_AT),
    start = Date.now();
  if (
    !Number.isFinite(disruption) ||
    disruption > start ||
    Date.parse(header.createdAt) > start
  )
    throw Error("restore-clock");
  url.searchParams.delete("schema");
  const db = new pg.Client({ connectionString: url.toString() });
  await db.connect();
  try {
    const privileges = await db.query(
      "SELECT rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname=current_user",
    );
    const schemas = await db.query(
      "SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname NOT IN ('information_schema','public')",
    );
    const relations = await db.query(
      "SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'",
    );
    const owner = await db.query(
      "SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname=current_database()",
    );
    if (
      schemas.rowCount ||
      relations.rowCount ||
      owner.rows[0].owner !== name ||
      Object.values(privileges.rows[0]).some(Boolean)
    )
      throw Error("restore-nonempty-or-role");
    const child = spawn(
      "pg_restore",
      [
        `--dbname=${name}`,
        "--exit-on-error",
        "--single-transaction",
        "--no-owner",
        "--no-privileges",
        dump,
      ],
      { env: postgresEnvironment(url.toString()), stdio: "ignore" },
    );
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (c) =>
        c === 0 ? resolve() : reject(Error("restore-command")),
      );
    });
    // No traffic-release command: external deletion/block replay is independently reviewed.
    await db.query(
      "CREATE TABLE public.ops_recovery_fence (blocked boolean NOT NULL CHECK(blocked), restored_at timestamptz NOT NULL DEFAULT now()); INSERT INTO public.ops_recovery_fence(blocked) VALUES(true)",
    );
    const namespaces = await db.query(
      "SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname NOT IN ('information_schema','public')",
    );
    if (
      namespaces.rows.some(
        (r) => !["verification", "verification_boss"].includes(r.nspname),
      )
    )
      throw Error("restore-program-separation");
    // Daily content keys must stay empty. No content is read or printed here.
    const unlogged = await db.query(
      "SELECT n.nspname, c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relpersistence='u' AND c.relkind='r'",
    );
    for (const row of unlogged.rows) {
      const result = await db.query(
        `SELECT 1 FROM ${db.escapeIdentifier(row.nspname)}.${db.escapeIdentifier(row.relname)} LIMIT 1`,
      );
      if (result.rowCount) throw Error("restore-transient-material");
    }
    console.log(
      JSON.stringify({
        version: 1,
        complete: true,
        scope: "isolated-regression-only",
        traffic: "blocked",
        restoredAt: new Date().toISOString(),
        disruptionAt: new Date(disruption).toISOString(),
        restoreStartedAt: new Date(start).toISOString(),
        sourceBackupAt: header.createdAt,
        measuredRestoreMs: Date.now() - start,
        sourceAgeAtDisruptionMs: disruption - Date.parse(header.createdAt),
        rpoTargetMs: 86400000,
        rtoTargetMs: 28800000,
        cloudQualified: false,
      }),
    );
  } finally {
    await db.end();
  }
}
