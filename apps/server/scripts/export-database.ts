// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0012 export boundary. stdout must feed the deployment's public-key
// encryption/upload pipeline; this command neither archives keys nor logs SQL.
import { spawn } from "node:child_process";

export const databaseExportFlags = [
  "--no-unlogged-table-data",
  "--no-owner",
  "--no-privileges",
] as const;

if (import.meta.main) {
  if (!process.env.DATABASE_URL || process.stdout.isTTY) {
    console.error(JSON.stringify({ code: "export-pipeline-required" }));
    process.exit(1);
  }
  const child = spawn("pg_dump", ["--format=custom", ...databaseExportFlags], {
    env: { ...process.env, PGDATABASE: process.env.DATABASE_URL },
    stdio: ["ignore", "inherit", "ignore"],
  });
  child.once("error", () => {
    console.error(JSON.stringify({ code: "database-export-failed" }));
    process.exitCode = 1;
  });
  child.once("exit", (code) => {
    if (code !== 0) {
      console.error(JSON.stringify({ code: "database-export-failed" }));
      process.exitCode = 1;
    }
  });
}
