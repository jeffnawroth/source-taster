// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn } from "node:child_process";
import { expect, test } from "vitest";
import { withOrphanGuard } from "./support/orphan-guard.ts";

// #326: test children must not outlive the runner that started them. The
// runner's stdout is a pipe the child inherits, so end-of-file arrives exactly
// when the last process holding it, the child, has exited. That is a real
// condition that does not depend on who reaps zombies in the test container.
async function killRunnerAndWaitForChild(
  mode: "direct" | "shell",
  behaviour: "graceful" | "stubborn",
) {
  const runner = spawn(
    process.execPath,
    ["test/support/orphan-runner.ts", mode, behaviour],
    { cwd: new URL("..", import.meta.url), stdio: ["ignore", "pipe", "pipe"] },
  );
  let output = "";
  runner.stdout.on("data", (chunk: Buffer) => (output += chunk.toString()));
  runner.stderr.on("data", (chunk: Buffer) => (output += chunk.toString()));
  const ended = new Promise<void>((resolve) =>
    runner.stdout.on("end", resolve),
  );
  await expect.poll(() => output, { timeout: 10_000 }).toContain("child-ready");
  const killedAt = Date.now();
  runner.kill("SIGKILL");
  await ended;
  return { output, seconds: (Date.now() - killedAt) / 1000 };
}

test.each(["direct", "shell"] as const)(
  "a child exits by itself after its runner is killed (%s)",
  async (mode) => {
    const { output, seconds } = await killRunnerAndWaitForChild(
      mode,
      "graceful",
    );
    // The graceful shutdown ran, so the guard did not change how children stop.
    expect(output).toContain("graceful-shutdown");
    expect(seconds).toBeLessThan(5);
  },
  20_000,
);

test("a child that ignores SIGTERM is killed shortly after", async () => {
  const { output, seconds } = await killRunnerAndWaitForChild(
    "direct",
    "stubborn",
  );
  expect(output).not.toContain("graceful-shutdown");
  expect(seconds).toBeLessThan(8);
}, 20_000);

test("the guard adds to NODE_OPTIONS once and keeps the caller's PID", () => {
  const first = withOrphanGuard({ NODE_OPTIONS: "--no-warnings" });
  expect(first.NODE_OPTIONS).toMatch(/^--no-warnings --import=file:\/\//);
  expect(withOrphanGuard(first).NODE_OPTIONS).toBe(first.NODE_OPTIONS);
  expect(first.SOURCE_TASTER_TEST_WATCH_PIDS.split(",")).toContain(
    String(process.pid),
  );
});
