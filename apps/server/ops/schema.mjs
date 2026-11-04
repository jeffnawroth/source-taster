// SPDX-License-Identifier: AGPL-3.0-or-later
import pg from "pg";
import { createHash } from "node:crypto";
export async function schemaIdentity(url) {
  const db = new pg.Client({ connectionString: url });
  await db.connect();
  try {
    const role = await db.query(
      "SELECT rolsuper,rolcreaterole,rolcreatedb,rolbypassrls FROM pg_roles WHERE rolname=current_user",
    );
    if (Object.values(role.rows[0]).some(Boolean))
      throw Error("backup-privileged-role");
    const ownership = await db.query(
      "SELECT pg_get_userbyid(nspowner)=current_user AS owned FROM pg_namespace WHERE nspname='verification'",
    );
    if (ownership.rows[0]?.owned !== true) throw Error("backup-schema-owner");
    const migrations = await db.query(
      "SELECT migration_name,checksum FROM verification._prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name",
    );
    if (!migrations.rowCount) throw Error("backup-schema-version");
    return createHash("sha256")
      .update(JSON.stringify(migrations.rows))
      .digest("hex");
  } finally {
    await db.end();
  }
}
