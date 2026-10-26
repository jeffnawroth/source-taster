// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP surface of the web process: the published /v1 contract.

import { OpenAPIHono } from "@hono/zod-openapi";
import {
  createCheck,
  getCheck,
  streamCheckEvents,
} from "@source-taster/contract-verification/routes";
import { streamSSE } from "hono/streaming";
import type { EventListener } from "../checks/events.ts";
import { HTTPException } from "hono/http-exception";
import { splitReferences } from "../checks/structuring.ts";
import type { CheckStore } from "../checks/store.ts";
import type { Entitlements, Permission, Principal } from "../entitlements.ts";
import { fail, problemResponse } from "./problems.ts";

export interface AppDeps {
  entitlements: Entitlements;
  checks: CheckStore;
  events: EventListener;
  heartbeatMs: number;
}

export function createApp({
  entitlements,
  checks,
  events,
  heartbeatMs,
}: AppDeps) {
  async function authorize(
    request: Request,
    permission: Permission,
  ): Promise<Principal> {
    const principal = await entitlements.resolve(request);
    if (!principal) fail("unauthenticated");
    if (!principal.can(permission)) fail("forbidden");
    return principal;
  }

  const app = new OpenAPIHono({
    defaultHook: (result) => {
      if (result.success) return;
      const emptyText = result.error.issues.some(
        (issue) => issue.path[0] === "text" && issue.code === "too_small",
      );
      return problemResponse(emptyText ? "input-empty" : "invalid-request");
    },
  });

  app.onError((error) => {
    if (error instanceof HTTPException) return error.getResponse();
    console.error(JSON.stringify({ code: "internal" }));
    return problemResponse("internal");
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.openapi(createCheck, async (c) => {
    const principal = await authorize(c.req.raw, "check:create");
    const { text } = c.req.valid("json");
    const check = await checks.create(principal, splitReferences(text));
    return c.json({ data: check, quota: principal.quota }, 201);
  });

  app.openapi(getCheck, async (c) => {
    const principal = await authorize(c.req.raw, "check:read");
    const check = await checks.get(principal, c.req.valid("param").checkId);
    if (!check) fail("check-not-found");
    return c.json({ data: check, quota: principal.quota }, 200);
  });

  app.openapi(streamCheckEvents, async (c) => {
    const principal = await authorize(c.req.raw, "check:read");
    const checkId = c.req.valid("param").checkId;
    const check = await checks.get(principal, checkId);
    if (!check) fail("check-not-found");
    const raw = c.req.header("last-event-id") ?? "0";
    if (
      !/^\d+$/.test(raw) ||
      !Number.isSafeInteger(Number(raw)) ||
      Number(raw) > check.lastEventSeq
    )
      fail("invalid-request");
    let after = Number(raw);
    c.header("Cache-Control", "no-cache, no-transform");
    c.header("X-Accel-Buffering", "no");
    return streamSSE(
      c,
      async (stream) => {
        const lifetime = new AbortController();
        stream.onAbort(() => lifetime.abort());
        while (!stream.aborted) {
          const cycle = new AbortController();
          const abort = () => cycle.abort();
          lifetime.signal.addEventListener("abort", abort, { once: true });
          // Subscribe before replay to close the replay/live notification race.
          const wake = events.wait(cycle.signal, heartbeatMs);
          try {
            const current = await authorize(c.req.raw, "check:read");
            const snapshot = await checks.get(current, checkId);
            if (!snapshot) return;
            const batch = await checks.events(checkId, after);
            for (const event of batch) {
              await stream.writeSSE({
                id: String(event.seq),
                event: event.type,
                data: JSON.stringify(event),
              });
              after = event.seq;
            }
            if (snapshot.state === "ended" && after >= snapshot.lastEventSeq)
              return;
            if (batch.length) continue;
            await wake;
            if (!stream.aborted) await stream.write(": heartbeat\n\n");
          } finally {
            lifetime.signal.removeEventListener("abort", abort);
            cycle.abort();
          }
        }
      },
      () => {
        console.error(JSON.stringify({ code: "stream-error" }));
        return Promise.resolve();
      },
    );
  });

  app.doc31("/v1/openapi.json", {
    openapi: "3.1.0",
    info: { title: "Source Taster verification API", version: "1" },
  });

  return app;
}
