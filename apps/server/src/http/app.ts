// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP surface of the web process: the published /v1 contract.

import type { Context, TypedResponse } from "hono";
import type { JSONParsed } from "hono/utils/types";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  structureReferences,
  createCheck,
  cancelCheck,
  renewCheckLease,
  getCheck,
  streamCheckEvents,
} from "@source-taster/contract-verification/routes";
import { ReferenceLimitExceeded, type Structuring } from "@source-taster/core";
import { stream, streamSSE } from "hono/streaming";
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
  clock?: { now(): number };
}

export function createApp({
  structuring,
  entitlements,
  checks,
  events,
  heartbeatMs,
  referenceLimit,
  clock = { now: Date.now },
}: AppDeps) {
  async function authorize(
    request: Request,
    permission: Permission,
  ): Promise<Principal> {
    const principal = await entitlements.resolve(request);
    if (!principal) fail("unauthenticated");
    if (!principal.can(permission)) fail("forbidden");
    await guarded(principal, permission, () => Promise.resolve());
    return principal;
  }

  function guarded<T>(
    principal: Principal,
    permission: Permission,
    operation: () => Promise<T>,
  ): Promise<T> {
    return entitlements.guard
      ? entitlements.guard(principal, permission, operation)
      : operation();
  }
  async function output<T, S extends 200 | 201>(
    c: Context,
    principal: Principal,
    permission: Permission,
    data: T,
    status: S,
  ) {
    // Check again after the database/parser work, before response headers. The
    // transport write itself drains under the same durable Owner guard as commits.
    await guarded(principal, permission, () => Promise.resolve());
    c.status(status);
    c.header("Content-Type", "application/json");
    c.header("Cache-Control", "no-store");
    const response = stream(c, async (writer) => {
      try {
        await guarded(principal, permission, () =>
          writer.write(JSON.stringify({ data, quota: principal.quota })),
        );
      } catch {
        writer.abort();
      }
    });
    return response as Response &
      TypedResponse<
        JSONParsed<{
          data: T;
          quota: Principal["quota"];
        }>,
        S,
        "json"
      >;
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
      return output(c, principal, "structuring:create", data, 200);
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
    const check = await guarded(principal, "check:create", () =>
      checks.create(principal, references),
    );
    return output(c, principal, "check:create", check, 201);
  });

  app.openapi(getCheck, async (c) => {
    const principal = await authorize(c.req.raw, "check:read");
    const check = await guarded(principal, "check:read", () =>
      checks.get(principal, c.req.valid("param").checkId),
    );
    if (!check) fail("check-not-found");
    return output(c, principal, "check:read", check, 200);
  });

  app.openapi(cancelCheck, async (c) => {
    const principal = await authorize(c.req.raw, "check:cancel");
    const check = await guarded(principal, "check:cancel", () =>
      checks.cancel(principal, c.req.valid("param").checkId),
    );
    if (!check) fail("check-not-found");
    return output(c, principal, "check:cancel", check, 200);
  });
  app.openapi(renewCheckLease, async (c) => {
    const principal = await authorize(c.req.raw, "check:renew");
    const check = await guarded(principal, "check:renew", () =>
      checks.renew(principal, c.req.valid("param").checkId),
    );
    if (!check) fail("check-not-found");
    return output(c, principal, "check:renew", check, 200);
  });

  app.openapi(streamCheckEvents, async (c) => {
    const principal = await authorize(c.req.raw, "check:read");
    const checkId = c.req.valid("param").checkId;
    const check = await checks.get(principal, checkId);
    if (!check) fail("check-not-found");
    const raw = c.req.header("last-event-id") ?? "0";
    const seq = /^\d+$/.test(raw)
      ? String(Number(raw))
      : raw.startsWith(`${checkId}:`)
        ? raw.slice(checkId.length + 1)
        : "invalid";
    if (
      !/^(0|[1-9]\d*)$/.test(seq) ||
      !Number.isSafeInteger(Number(seq)) ||
      Number(seq) > check.lastEventSeq
    )
      fail("invalid-request");
    // A fresh client request proves liveness once; heartbeats are server output,
    // not client acknowledgements. Further renewal is an explicit mutation.
    if (principal.can("check:renew")) {
      try {
        await guarded(principal, "check:renew", () =>
          checks.renew(principal, checkId),
        );
      } catch (error) {
        // Read and lease permissions are independent. A forbidden optional
        // renewal cannot grant a lease or suppress an otherwise authorized read.
        if (!(error instanceof HTTPException) || error.status !== 403)
          throw error;
      }
    }
    let after = Number(seq);
    c.header("Cache-Control", "no-cache, no-transform");
    c.header("X-Accel-Buffering", "no");
    return streamSSE(
      c,
      async (stream) => {
        const lifetime = new AbortController();
        stream.onAbort(() => lifetime.abort());
        try {
          while (!stream.aborted) {
            const cycle = new AbortController();
            const abort = () => cycle.abort();
            lifetime.signal.addEventListener("abort", abort, { once: true });
            // Subscribe before replay to close the replay/live notification race.
            const wake = events.wait(
              cycle.signal,
              Math.max(
                1,
                Math.min(
                  heartbeatMs,
                  principal.expiresAt === undefined
                    ? heartbeatMs
                    : principal.expiresAt - clock.now(),
                ),
              ),
            );
            try {
              const current = await authorize(c.req.raw, "check:read");
              const snapshot = await checks.get(current, checkId);
              if (!snapshot) return;
              const batch = await checks.events(checkId, after);
              for (const event of batch) {
                const output = await authorize(c.req.raw, "check:read");
                if (output.ownerId !== principal.ownerId) return;
                await guarded(output, "check:read", () =>
                  stream.writeSSE({
                    id: raw.startsWith(`${checkId}:`)
                      ? `${checkId}:${event.seq}`
                      : String(event.seq),
                    event: event.type,
                    data: JSON.stringify(event),
                  }),
                );
                after = event.seq;
              }
              if (snapshot.state === "ended" && after >= snapshot.lastEventSeq)
                return;
              if (batch.length) continue;
              await wake;
              if (!stream.aborted) {
                const current = await authorize(c.req.raw, "check:read");
                if (current.ownerId !== principal.ownerId) return;
                await guarded(current, "check:read", () =>
                  stream.write(": heartbeat\n\n"),
                );
              }
            } finally {
              lifetime.signal.removeEventListener("abort", abort);
              cycle.abort();
            }
          }
        } catch {
          /* Denial closes silently. Hono's outer error handler emits an SSE error frame. */
        } finally {
          lifetime.abort();
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
