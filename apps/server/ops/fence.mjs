// SPDX-License-Identifier: AGPL-3.0-or-later
import pg from "pg";
export async function assertRecoveryReleased(url) {
  const db = new pg.Client({ connectionString: url });
  await db.connect();
  try {
    const result = await db.query(
      "SELECT 1 AS fence FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='ops_recovery_fence'",
    );
    if (result.rows[0]?.fence) throw Error("restore-traffic-fenced");
  } finally {
    await db.end();
  }
}
