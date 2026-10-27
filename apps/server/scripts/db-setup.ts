// SPDX-License-Identifier: AGPL-3.0-or-later
// Provisions the verification service's database: its own role, the database,
// the `verification` and `verification_boss` schemas owned by that role, and
// the Prisma migrations. Idempotent. Used locally, in tests and in CI.
//
//   DATABASE_ADMIN_URL  superuser connection, e.g. postgres://postgres:postgres@localhost:5433/postgres
//   DATABASE_URL        the service's own connection; role, password and database are taken from it

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { BOSS_SCHEMA, PRISMA_SCHEMA } from "../src/db/schemas.ts";

export async function setupDatabase(adminUrl: string, appUrl: string) {
  const app = new URL(appUrl);
  const role = decodeURIComponent(app.username);
  const password = decodeURIComponent(app.password);
  const database = app.pathname.slice(1);

  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    const ident = (name: string) => admin.escapeIdentifier(name);
    const literal = (value: string) => admin.escapeLiteral(value);
    const roleExists = await admin.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [role],
    );
    await admin.query(
      `${roleExists.rowCount ? "ALTER" : "CREATE"} ROLE ${ident(role)} LOGIN PASSWORD ${literal(password)}`,
    );
    const dbExists = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [database],
    );
    if (!dbExists.rowCount)
      await admin.query(`CREATE DATABASE ${ident(database)}`);
    await admin.query(
      `GRANT CONNECT ON DATABASE ${ident(database)} TO ${ident(role)}`,
    );
    await admin.query(
      `ALTER ROLE ${ident(role)} IN DATABASE ${ident(database)} SET search_path = ${ident(PRISMA_SCHEMA)}`,
    );
  } finally {
    await admin.end();
  }

  const adminOnDb = new URL(adminUrl);
  adminOnDb.pathname = `/${database}`;
  const db = new pg.Client({ connectionString: adminOnDb.toString() });
  await db.connect();
  try {
    for (const schema of [PRISMA_SCHEMA, BOSS_SCHEMA]) {
      await db.query(
        `CREATE SCHEMA IF NOT EXISTS ${db.escapeIdentifier(schema)} AUTHORIZATION ${db.escapeIdentifier(role)}`,
      );
    }
  } finally {
    await db.end();
  }

  // Prisma's migration engine takes the target schema from the URL.
  const migrateUrl = new URL(appUrl);
  migrateUrl.searchParams.set("schema", PRISMA_SCHEMA);
  const migrate = spawnSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: { ...process.env, DATABASE_URL: migrateUrl.toString() },
    stdio: "inherit",
  });
  if (migrate.status !== 0) throw new Error("prisma migrate deploy failed");
}

if (import.meta.main) {
  const adminUrl = process.env.DATABASE_ADMIN_URL;
  const appUrl = process.env.DATABASE_URL;
  if (!adminUrl || !appUrl) {
    console.error("db:setup needs DATABASE_ADMIN_URL and DATABASE_URL");
    process.exit(1);
  }
  await setupDatabase(adminUrl, appUrl);
}
