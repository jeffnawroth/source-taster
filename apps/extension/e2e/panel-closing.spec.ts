// SPDX-License-Identifier: AGPL-3.0-or-later
// The harness's own behaviour when the side panel goes away while it still has
// calls in flight (#227). It needs no browser: the panel's CDP session is
// replaced by one that answers the way a closing target does.
import { EventEmitter } from "node:events";
import { expect, test } from "@playwright/test";
import type { CDPSession } from "@playwright/test";
import { Panel } from "./support/chromium.ts";

type Call = { id: number; method: string };

/** A browser session whose panel target replies to `reply`, or is gone. */
function fakeBrowser(
  reply: (call: Call, emit: (message: object) => void) => void,
) {
  const emitter = new EventEmitter();
  const emit = (message: object) =>
    emitter.emit("Target.receivedMessageFromTarget", {
      sessionId: "panel",
      message: JSON.stringify(message),
    });
  return {
    emitter,
    emit,
    session: {
      on: (event: string, listener: () => void) => emitter.on(event, listener),
      off: (event: string, listener: () => void) =>
        emitter.off(event, listener),
      // The executor throws into a rejection, as a gone target does.
      send: (method: string, params: { message: string }) =>
        new Promise((resolve) => {
          if (method === "Target.sendMessageToTarget")
            reply(JSON.parse(params.message) as Call, emit);
          resolve({});
        }),
    } as unknown as CDPSession,
  };
}

/** Unhandled rejections raised while `act` runs and the event loop settles. */
async function unhandledDuring(act: () => void) {
  const seen: unknown[] = [];
  const collect = (reason: unknown) => seen.push(reason);
  process.on("unhandledRejection", collect);
  try {
    act();
    // Node reports an unhandled rejection after the microtask queue drains.
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
  } finally {
    process.off("unhandledRejection", collect);
  }
  return seen;
}

const paused = (requestId: string) => ({
  method: "Fetch.requestPaused",
  params: { requestId, request: { url: "http://x.test/other", method: "GET" } },
});

test("a request paused as the panel target goes away does not leave an unhandled rejection", async () => {
  const gone = new Error("No session with given id");
  const { session, emit } = fakeBrowser((call, send) => {
    if (call.method === "Fetch.enable") send({ id: call.id, result: {} });
    else throw gone;
  });
  const panel = new Panel(session, "panel", "target", "chrome://panel");
  await panel.holdRequests(/\/bibliography$/);
  const seen = await unhandledDuring(() => {
    emit(paused("1"));
  });
  expect(seen).toEqual([]);
});

test("a pass-through still in flight when the panel detaches does not leave an unhandled rejection", async () => {
  const { session, emit } = fakeBrowser((call, send) => {
    if (call.method === "Fetch.enable") send({ id: call.id, result: {} });
    // Fetch.continueRequest is never answered: the panel detaches first.
  });
  const panel = new Panel(session, "panel", "target", "chrome://panel");
  await panel.holdRequests(/\/bibliography$/);
  const seen = await unhandledDuring(() => {
    emit(paused("1"));
    panel.detach();
  });
  expect(seen).toEqual([]);
});
