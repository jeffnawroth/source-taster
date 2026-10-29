// SPDX-License-Identifier: AGPL-3.0-or-later
// Actual both-program harness (source-only, uncalibrated) for native Guest cases.
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { writeFile } from "node:fs/promises";
import {
  bothPrograms,
  eventually,
  freePort,
} from "../../../server/test/support/both-programs.ts";
import { Permission } from "../../../../packages/contract-common/src/index.ts";

export type Both = Awaited<ReturnType<typeof bothPrograms>>;
export { bothPrograms };

export async function allowOrigins(both: Both, origins: string[]) {
  both.serviceConfig.allowedOrigins = origins;
  await writeFile(both.serviceConfigPath, JSON.stringify(both.serviceConfig));
  await both.restartService();
}

/** The hosted web client on its own loopback origin, against the same API. */
export async function startHostedWeb(both: Both) {
  const port = await freePort();
  const url = `http://127.0.0.1:${port}`;
  const web = new URL("../../../web/", import.meta.url);
  const vite: ChildProcess = spawn(
    process.execPath,
    [
      new URL("node_modules/vite/bin/vite.js", web).pathname,
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: web,
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "test",
        SOURCE_TASTER_API_URL: both.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: both.serviceUrl,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  vite.stdout!.on("data", (b) => (output += String(b)));
  vite.stderr!.on("data", (b) => (output += String(b)));
  await eventually(async () => {
    if (vite.exitCode !== null) throw new Error(output);
    try {
      return (await fetch(url)).ok;
    } catch {
      return false;
    }
  });
  return {
    url,
    stop: async () => {
      if (vite.exitCode !== null) return;
      const exited = once(vite, "exit");
      vite.kill("SIGTERM");
      await exited;
    },
  };
}

/** Set the frozen harness clock so tokens issued now expire `ms` from real time. */
export async function expireIssuedTokensIn(both: Both, ms: number) {
  await both.advance(Date.now() + ms - 300_000 - both.now());
}

/** Every Guest permission except starting a Check. */
export const withoutCheckCreation = Permission.options.filter(
  (permission) => permission !== "check:create",
);
