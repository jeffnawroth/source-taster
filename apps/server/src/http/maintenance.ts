// SPDX-License-Identifier: AGPL-3.0-or-later
// The content-free maintenance notice route, shared by the production web
// process and the local-preview composition so the banner's poll (#249) gets
// the same answer in both.

import type { Context } from "hono";
import { maintenanceNotice } from "../../ops/maintenance.mjs";

interface Routes {
  get(
    path: string,
    handler: (c: Context) => Response | Promise<Response>,
  ): unknown;
}

export function mountMaintenanceNotice(
  app: Routes,
  file: string | undefined = process.env.SOURCE_TASTER_MAINTENANCE_FILE,
) {
  app.get("/health/maintenance", async (c) => {
    c.header("Cache-Control", "no-store");
    try {
      return c.json(await maintenanceNotice(file));
    } catch {
      return c.json({ state: "unknown" }, 503);
    }
  });
}
