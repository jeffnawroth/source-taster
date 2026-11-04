// SPDX-License-Identifier: AGPL-3.0-or-later
import pg from "pg";
export async function operationalHealth(url) {
  const db = new pg.Client({ connectionString: url });
  await db.connect();
  return {
    async ready() {
      try {
        const r = await db.query(
          "SELECT observed_at > now()-interval '30 seconds' AS ready FROM verification.ops_worker_health WHERE id=1",
        );
        return r.rows[0]?.ready === true;
      } catch {
        return false;
      }
    },
    pulse() {
      let busy = false;
      const tick = async () => {
        if (busy) return;
        busy = true;
        try {
          await db.query(
            "INSERT INTO verification.ops_worker_health VALUES(1,now()) ON CONFLICT(id) DO UPDATE SET observed_at=now()",
          );
        } catch {
          /* Readiness will expire; never emit connection details. */
        } finally {
          busy = false;
        }
      };
      void tick();
      const timer = setInterval(() => void tick(), 1000);
      return () => clearInterval(timer);
    },
    close: () => db.end(),
  };
}
