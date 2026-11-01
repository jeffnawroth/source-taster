// SPDX-License-Identifier: AGPL-3.0-or-later
import { createServer, type Server, type Socket } from "node:net";
import { expect, it } from "vitest";
import { startTestService } from "./support/service.ts";

/** Occupies a concrete port the way an ephemeral client socket would. */
async function occupy(): Promise<{
  server: Server;
  sockets: Set<Socket>;
  port: number;
}> {
  const sockets = new Set<Socket>();
  const server = createServer((socket) => sockets.add(socket));
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, resolve); // dual-stack `::`, like the service
  });
  const address = server.address();
  if (address === null || typeof address === "string")
    throw new Error("Expected a TCP address");
  return { server, sockets, port: address.port };
}

it("moves the test service to a free port when the requested one is taken", async () => {
  const held = await occupy();
  const service = await startTestService(held.port, 0);
  try {
    expect(new URL(service.apiUrl).port).not.toBe(String(held.port));
    const response = await fetch(`${service.apiUrl}/health`);
    expect(response.ok).toBe(true);
  } finally {
    await service.stop();
    // The harness's first health probe may have left a connection open.
    for (const socket of held.sockets) socket.destroy();
    await new Promise((resolve) => held.server.close(resolve));
  }
});
