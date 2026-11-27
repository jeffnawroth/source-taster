// SPDX-License-Identifier: AGPL-3.0-or-later
// Test fixture for orphan-guard.test.ts: a long-running child with the
// graceful SIGTERM shutdown of the real web and worker processes, or one that
// ignores SIGTERM.
console.log("child-ready");
if (process.env.BEHAVIOUR === "stubborn") process.on("SIGTERM", () => {});
else
  process.on("SIGTERM", () => {
    console.log("graceful-shutdown");
    process.exit(0);
  });
setInterval(() => {}, 1000);
