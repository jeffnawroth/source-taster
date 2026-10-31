// SPDX-License-Identifier: AGPL-3.0-or-later
// Hostile parser fixture at the extraction adapter edge. Its only observable
// result is returned through the public HTTP document contract.
import { readFile, writeFile, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { connect } from "node:net";
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const command = Buffer.concat(chunks).toString().split("\n")[1];
if (command === "timeout")
  await new Promise(() => {
    setInterval(() => {}, 1000);
  });
if (command === "cpu") {
  while (true) {
    /* Deliberately consume CPU inside the OS limit. */
  }
}
if (command === "output") {
  while (true) process.stdout.write("x".repeat(4096));
}
if (command === "memory") {
  const buffers = [];
  while (true) buffers.push(Buffer.alloc(8 * 1024 * 1024, 1));
}
if (command === "malformed") {
  process.stdout.write('{"ok":true,"text":42}');
  process.exit(0);
}
const denied = async (operation) => {
  try {
    await operation();
    return false;
  } catch {
    return true;
  }
};
const networkDenied = (host, port) =>
  new Promise((resolve) => {
    const socket = connect({ host, port });
    socket.setTimeout(500);
    socket.on("connect", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(true));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(true);
    });
  });
const status = await readFile("/proc/self/status", "utf8");
const children = [];
let processLimit = false;
for (let index = 0; index < 40; index++) {
  const child = spawn("/bin/sleep", ["10"]);
  const started = await new Promise((resolve) => {
    child.once("spawn", () => resolve(true));
    child.once("error", () => resolve(false));
  });
  if (!started) {
    processLimit = true;
    break;
  }
  children.push(child);
}
for (const child of children) child.kill("SIGKILL");
const report = {
  uid: process.getuid(),
  credentialsAbsent: !Object.keys(process.env).some((key) =>
    /DATABASE|SECRET|TOKEN|SOURCE_TASTER|KEY/.test(key),
  ),
  hostFilesDenied: await denied(() => access("/Users/jeffnawroth")),
  hostSocketDenied: await denied(() => access("/var/run/docker.sock")),
  writesDenied: await denied(() => writeFile("/tmp/escape", "x")),
  databaseDenied: await networkDenied("127.0.0.1", 5433),
  internetDenied: await networkDenied("1.1.1.1", 443),
  unprivileged: /CapEff:\s+0+\n/.test(status) && /NoNewPrivs:\s+1/.test(status),
  memory: (await readFile("/sys/fs/cgroup/memory.max", "utf8")).trim(),
  swap: (await readFile("/sys/fs/cgroup/memory.swap.max", "utf8")).trim(),
  cpu: (await readFile("/sys/fs/cgroup/cpu.max", "utf8")).trim(),
  processLimit,
};
process.stdout.write(
  JSON.stringify({
    ok: true,
    text: JSON.stringify(report),
    partialNoText: false,
  }),
);
