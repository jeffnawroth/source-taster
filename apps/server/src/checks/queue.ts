// SPDX-License-Identifier: AGPL-3.0-or-later
import { PgBoss } from "pg-boss";
import { BOSS_SCHEMA } from "../db/schemas.ts";

export const REFERENCE_QUEUE = "reference-check";
/** ADR-0017: report generation is a separate job class and never competes with Reference work. */
export const REPORT_QUEUE = "verification-report";
export interface ReportJob {
  reportId: string;
}
export interface ReferenceJob {
  checkId: string;
  slot: number;
}

export async function createQueue(databaseUrl: string) {
  const boss = new PgBoss({
    connectionString: databaseUrl,
    schema: BOSS_SCHEMA,
    createSchema: false,
    useListenNotify: true,
  });
  // Errors may contain SQL parameters: report only an allow-listed code.
  boss.on("error", () =>
    console.error(JSON.stringify({ code: "queue-error" })),
  );
  await boss.start();
  await boss.createQueue(REFERENCE_QUEUE, {
    retryLimit: 3,
    retryDelay: 1,
    notify: true,
  });
  await boss.createQueue(REPORT_QUEUE, {
    retryLimit: 1,
    retryDelay: 1,
    notify: true,
  });
  return boss;
}
