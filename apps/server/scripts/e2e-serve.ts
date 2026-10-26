// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn } from "node:child_process";
import { once } from "node:events";
import { startTestService } from "../test/support/service.ts";

const service = await startTestService(3102, 3000);
const vite = spawn(
  "pnpm",
  ["--filter", "@source-taster/web", "dev", "--port", "5174", "--strictPort"],
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
