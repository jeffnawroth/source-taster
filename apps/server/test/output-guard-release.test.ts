// SPDX-License-Identifier: AGPL-3.0-or-later
import { once } from "node:events";
import net from "node:net";
import { serve } from "@hono/node-server";
import { createParser } from "@source-taster/core";
import { getDocumentSettings } from "@source-taster/contract-verification/document-routes";
import { afterEach, expect, it } from "vitest";
import type { CheckStore } from "../src/checks/store.ts";
import type { EventListener } from "../src/checks/events.ts";
import type { Entitlements } from "../src/entitlements.ts";
import { createApp } from "../src/http/app.ts";

// #175: the Owner lock covers the decision and the serialization of a JSON
// envelope, and ends when the serialized body is handed to the response stream.
// It is not held until the transport write has drained, so a reader that stops
// reading cannot make the same Owner's other requests hit the lock timeout.
// Documented in docs/implementation/96-guest-authority.md (amendment #175).
const lockTimeoutMs = 2_000;
const closers: (() => void)[] = [];
afterEach(() => {
  for (const close of closers.splice(0)) close();
});

/** A per-Owner mutex standing in for the durable Owner lock and its lock_timeout. */
function ownerLock() {
  let tail: Promise<void> = Promise.resolve();
  const timeouts: string[] = [];
  const entitlements: Entitlements = {
    resolve: () =>
      Promise.resolve({
        ownerId: "o",
        actorId: "a",
        can: () => true,
        quota: null,
      }),
    async guard(_principal, _permission, operation) {
      const before = tail;
      let release!: () => void;
      tail = new Promise<void>((resolve) => (release = resolve));
      let timer: NodeJS.Timeout | undefined;
      try {
        await Promise.race([
          before,
          new Promise((_, reject) => {
            timer = setTimeout(() => {
              timeouts.push("lock_timeout");
              reject(new Error("lock timeout"));
            }, lockTimeoutMs);
          }),
        ]);
      } catch (error) {
        release();
        throw error;
      } finally {
        clearTimeout(timer);
      }
      try {
        return await operation();
      } finally {
        release();
      }
    },
  };
  return { entitlements, timeouts };
}

it("does not hold the Owner lock while a client leaves a large response unread", async () => {
  const { entitlements, timeouts } = ownerLock();
  const app = createApp(
    {
      structuring: createParser({ referenceLimit: 100_000 }),
      events: {} as EventListener,
      heartbeatMs: 1000,
      referenceLimit: 100_000,
      checks: {} as CheckStore,
      entitlements,
    },
    2,
  );
  const server = serve({ fetch: app.fetch, port: 0, hostname: "127.0.0.1" });
  closers.push(() => server.close());
  await once(server, "listening");
  const { port } = server.address() as net.AddressInfo;

  // The response is far larger than the kernel's socket buffers on both ends,
  // so a write that waited for the transport would still be waiting.
  const text = Array.from(
    { length: 20_000 },
    (_, i) =>
      `Smith, J., & Jones, K. (2020). A long title about topic number ${i} and more. Journal of Things, ${i}(2), 3-4.`,
  ).join("\n");
  const body = JSON.stringify({ text });
  const stalled = net.connect(port, "127.0.0.1");
  closers.push(() => stalled.destroy());
  await once(stalled, "connect");
  stalled.pause();
  stalled.write(
    `POST /v2/structurings HTTP/1.1\r\nHost: x\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`,
  );
  // Give the request time to be decided, serialized and handed off.
  await new Promise((resolve) => setTimeout(resolve, 750));

  const started = Date.now();
  const next = await fetch(
    `http://127.0.0.1:${port}${getDocumentSettings.path}`,
  );
  expect(next.status).toBe(200);
  expect(Date.now() - started).toBeLessThan(lockTimeoutMs / 2);
  expect(timeouts).toEqual([]);
}, 30_000);
