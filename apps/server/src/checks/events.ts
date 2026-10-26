// SPDX-License-Identifier: AGPL-3.0-or-later
import { EventEmitter } from "node:events";
import pg from "pg";

export const EVENT_CHANNEL = "verification_check_events";

/** Notifications only wake readers; the durable event log is the authority. */
export async function listenForEvents(databaseUrl: string) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);
  const client = new pg.Client({ connectionString: databaseUrl });
  // If the listener fails, streams still refetch on each heartbeat. The process
  // exits so its supervisor can reconnect, rather than silently running degraded.
  client.on("error", () => {
    console.error(JSON.stringify({ code: "event-listener-error" }));
    process.exit(1);
    emitter.emit("wake");
  });
  client.on("notification", () => emitter.emit("wake"));
  await client.connect();
  await client.query(`LISTEN ${EVENT_CHANNEL}`);
  return {
    close: () => client.end(),
    wait(signal: AbortSignal, timeoutMs: number) {
      let done: () => void;
      const promise = new Promise<void>((resolve) => {
        done = resolve;
      });
      const finish = () => {
        clearTimeout(timer);
        emitter.off("wake", finish);
        signal.removeEventListener("abort", finish);
        done();
      };
      const timer = setTimeout(finish, timeoutMs);
      emitter.once("wake", finish);
      signal.addEventListener("abort", finish, { once: true });
      if (signal.aborted) finish();
      return promise;
    },
  };
}
export type EventListener = Awaited<ReturnType<typeof listenForEvents>>;
