// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { downloadDataSubject } from "../src/data-subject-routes.ts";
import { writeFile } from "node:fs/promises";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  cancelCheck,
  renewCheckLease,
  createCheck,
  getCheck,
  streamCheckEvents,
  structureReferences,
} from "../src/routes.ts";
const app = new OpenAPIHono();
for (const route of [
  downloadDataSubject,
  cancelCheck,
  renewCheckLease,
  createCheck,
  getCheck,
  streamCheckEvents,
  structureReferences,
])
  app.openAPIRegistry.registerPath(route);
const document = app.getOpenAPI31Document({
  openapi: "3.1.0",
  info: { title: "Source Taster verification API", version: "1" },
});
await writeFile(
  new URL("../openapi.json", import.meta.url),
  JSON.stringify(document, null, 2) + "\n",
);

const v2 = await import("../src/routes-v2.ts");
const next = new OpenAPIHono();
const { exportReferences } = await import("../src/export-routes.ts");
const { createReport, getReport, downloadReport, cancelReport } =
  await import("../src/report-routes.ts");
const { renderBibliography } = await import("../src/bibliography-routes.ts");
const { structureDocument, getDocumentSettings, structureText } =
  await import("../src/document-routes.ts");
for (const route of [
  downloadDataSubject,
  structureText,
  structureDocument,
  getDocumentSettings,
  renderBibliography,
  exportReferences,
  createReport,
  getReport,
  downloadReport,
  cancelReport,
  v2.setManualOverride,
  v2.importReferences,
  v2.saveFields,
  v2.recheckReference,
  v2.editReferenceList,
  v2.editSelection,
  v2.previewSelection,
  v2.cancelCheck,
  v2.renewCheckLease,
  v2.createCheck,
  v2.getCheck,
  v2.getQuota,
  v2.getHistory,
  v2.setHistory,
  v2.deleteHistory,
  v2.restartHistory,
  v2.streamCheckEvents,
])
  next.openAPIRegistry.registerPath(route);
await writeFile(
  new URL("../openapi-v2.json", import.meta.url),
  JSON.stringify(
    next.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { title: "Source Taster verification API", version: "2" },
    }),
    null,
    2,
  ) + "\n",
);
