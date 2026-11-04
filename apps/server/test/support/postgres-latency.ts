// SPDX-License-Identifier: AGPL-3.0-or-later
// A transport-only delay in front of an owned real PostgreSQL database. No SQL
// is inspected or replaced. Enable latency after provisioning/Check creation.
import { createServer, connect, type Socket } from "node:net";
import { once } from "node:events";
import { setTimeout } from "node:timers/promises";

export async function postgresLatency(databaseUrl: string) {
  const target = new URL(databaseUrl);
  const upstreamPort = Number(target.port);
  const upstreamHost = target.hostname;
  const sockets = new Set<Socket>();
  let delayMs = 0;
  const server = createServer((client) => {
    const upstream = connect(upstreamPort, upstreamHost);
    for (const socket of [client, upstream]) {
      socket.setNoDelay(true);
      sockets.add(socket);
      socket.on("error", () => {
        client.destroy();
        upstream.destroy();
      });
      socket.on("close", () => sockets.delete(socket));
    }
    client.pipe(upstream);
    void (async () => {
      for await (const chunk of upstream) {
        if (delayMs) await setTimeout(delayMs);
        if (!client.destroyed && !client.write(chunk as Buffer))
          await once(client, "drain");
      }
      client.end();
    })().catch(() => client.destroy());
    client.on("close", () => upstream.destroy());
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no TCP port");
  target.hostname = "127.0.0.1";
  target.port = String(address.port);
  return {
    url: target.toString(),
    delay: (ms: number) => (delayMs = ms),
    stop: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}
