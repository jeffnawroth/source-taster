// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn } from "node:child_process";
import { once } from "node:events";
import { startTestService } from "../test/support/service.ts";

const service = await startTestService(
  Number(process.env.SOURCE_TASTER_E2E_API_PORT ?? 3102),
  3000,
);
const webPort = process.env.SOURCE_TASTER_E2E_WEB_PORT ?? "5174";
const vite = spawn(
  "pnpm",
  ["--filter", "@source-taster/web", "dev", "--port", webPort, "--strictPort"],
  {
    cwd: new URL("../../..", import.meta.url),
    env: { ...process.env, SOURCE_TASTER_API_URL: service.apiUrl },
    stdio: "inherit",
  },
);
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  vite.kill("SIGTERM");
  await service.stop();
  process.exit(code);
}
process.once("SIGTERM", () => {
  void stop();
});
process.once("SIGINT", () => {
  void stop();
});
const [code] = (await once(vite, "exit")) as [number | null];
await stop(code ?? 1);
