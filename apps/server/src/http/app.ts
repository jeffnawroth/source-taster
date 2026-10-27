// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP surface of the web process: the published /v1 contract.

import { OpenAPIHono } from "@hono/zod-openapi";
import {
  structureReferences,
  createCheck,
  getCheck,
  streamCheckEvents,
} from "@source-taster/contract-verification/routes";
import { ReferenceLimitExceeded, type Structuring } from "@source-taster/core";
import { streamSSE } from "hono/streaming";
import type { EventListener } from "../checks/events.ts";
import { HTTPException } from "hono/http-exception";
import type { StructuredReference } from "@source-taster/core";
import type { CheckStore } from "../checks/store.ts";
import type { Entitlements, Permission, Principal } from "../entitlements.ts";
import { fail, problemResponse } from "./problems.ts";

export interface AppDeps {
  structuring: Structuring;
  entitlements: Entitlements;
  checks: CheckStore;
  events: EventListener;
  heartbeatMs: number;
  referenceLimit: number;
}

export function createApp({
  structuring,
  entitlements,
  checks,
  events,
  heartbeatMs,
  referenceLimit,
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
        (issue) =>
          issue.path[0] === "text" &&
          (issue.code === "too_small" || issue.message === "input-empty"),
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

  app.openapi(structureReferences, async (c) => {
    const principal = await authorize(c.req.raw, "structuring:create");
    try {
      const data = structuring.structure(c.req.valid("json").text);
      return c.json({ data, quota: principal.quota }, 200);
    } catch (error) {
      if (error instanceof ReferenceLimitExceeded)
        fail(
          "reference-limit",
          `At most ${error.limit} References can be structured at once.`,
          error.limit,
        );
      throw error;
    }
  });

  app.openapi(createCheck, async (c) => {
    const principal = await authorize(c.req.raw, "check:create");
    const input = c.req.valid("json");
    let references: StructuredReference[];
    try {
      const parsed = "text" in input ? structuring.structure(input.text) : null;
      if (
        parsed &&
        parsed.references.length + parsed.rejected.length > referenceLimit
      )
        fail(
          "reference-limit",
          `At most ${referenceLimit} References can be checked at once.`,
          referenceLimit,
        );
      if (parsed?.rejected.length) fail("invalid-request");
      references = parsed
        ? parsed.references
        : "references" in input
          ? input.references.map((r) => ({
              originalText: r.originalText,
              span: { start: 0, end: r.originalText.length },
              csl: r.fields,
              fieldSources: Object.fromEntries(
                Object.entries(r.fields).map(([key, value]) => [
                  key,
                  {
                    raw:
                      typeof value === "string" ? value : JSON.stringify(value),
                  },
                ]),
              ),
              authorsTruncated: r.authorsTruncated,
              structuring: { path: "user" as const, version: "user-fields-1" },
            }))
          : [];
    } catch (error) {
      if (error instanceof ReferenceLimitExceeded)
        fail(
          "reference-limit",
          `At most ${error.limit} References can be checked at once.`,
          error.limit,
        );
      throw error;
    }
    if (references.length > referenceLimit)
      fail(
        "reference-limit",
        `At most ${referenceLimit} References can be checked at once.`,
        referenceLimit,
      );
    if (!references.length) fail("invalid-request");
    const check = await checks.create(principal, references);
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
