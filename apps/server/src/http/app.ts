// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP surface of the web process: the published /v1 contract.

import type { ZodIssue } from "zod";
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
import { exportReferences } from "@source-taster/contract-verification/export-routes";
import { suggestionFields, suggestionToken } from "../citations/suggestion.ts";
import { importLibrary } from "../imports/library.ts";
import { referenceExporter } from "../exports/references.ts";
import { renderBibliography } from "@source-taster/contract-verification/bibliography-routes";
import {
  renderBibliographySnapshot,
  FormattingUnavailable,
} from "../citations/rendering.ts";
import * as v2 from "@source-taster/contract-verification/routes-v2";
import { ReferenceLimitExceeded, type Structuring } from "@source-taster/core";
import { stream, streamSSE } from "hono/streaming";
import type { EventListener } from "../checks/events.ts";
import { HTTPException } from "hono/http-exception";
import type { StructuredReference } from "@source-taster/core";
import type { CheckStore } from "../checks/store.ts";
import type { Entitlements, Permission, Principal } from "../entitlements.ts";
import { fail, problemResponse } from "./problems.ts";

function librarySizeIssue(issues: readonly ZodIssue[]): boolean {
  return issues.some(
    (issue) =>
      issue.message === "library-size" ||
      (issue.code === "invalid_union" && issue.errors.some(librarySizeIssue)),
  );
}

export interface AppDeps {
  structuring: Structuring;
  entitlements: Entitlements;
  checks: CheckStore;
  events: EventListener;
  heartbeatMs: number;
  referenceLimit: number;
  clock?: { now(): number };
}

export function createApp(
  {
    structuring,
    entitlements,
    checks,
    events,
    heartbeatMs,
    referenceLimit,
    clock = { now: Date.now },
  }: AppDeps,
  apiVersion = 1,
) {
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
      if (librarySizeIssue(result.error.issues))
        return problemResponse(
          "library-size",
          "The library file exceeds 20 MB.",
          20,
        );
      const emptyText = result.error.issues.some(
        (issue) =>
          issue.path[0] === "text" &&
          (issue.code === "too_small" || issue.message === "input-empty"),
      );
      return problemResponse(emptyText ? "input-empty" : "invalid-request");
    },
  });

  app.onError((error) => {
    if (error instanceof ReferenceLimitExceeded)
      return problemResponse(
        "reference-limit",
        `At most ${error.limit} References can be imported at once.`,
        error.limit,
      );
    if (error instanceof FormattingUnavailable)
      return problemResponse("formatting-unavailable");
    if (error instanceof HTTPException) return error.getResponse();
    console.error(JSON.stringify({ code: "internal" }));
    return problemResponse("internal");
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  if (apiVersion === 1)
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

  if (apiVersion === 2)
    app.openapi(v2.importReferences, async (c) => {
      const principal = await authorize(c.req.raw, "structuring:create");
      const data = importLibrary(c.req.valid("json"), referenceLimit);
      return output(c, principal, "structuring:create", data, 200);
    });

  app.openapi(
    (apiVersion === 2 ? v2.createCheck : createCheck) as typeof v2.createCheck,
    async (c) => {
      const principal = await authorize(c.req.raw, "check:create");
      const input = c.req.valid("json");
      let references: StructuredReference[];
      try {
        const parsed =
          "library" in input
            ? importLibrary(input.library, referenceLimit)
            : "text" in input
              ? structuring.structure(input.text)
              : null;
        if (
          parsed &&
          parsed.references.length + parsed.rejected.length > referenceLimit
        )
          fail(
            "reference-limit",
            `At most ${referenceLimit} References can be checked at once.`,
            referenceLimit,
          );
        if (parsed?.rejected.length && !("library" in input))
          fail("invalid-request");
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
                        typeof value === "string"
                          ? value
                          : JSON.stringify(value),
                    },
                  ]),
                ),
                authorsTruncated: r.authorsTruncated,
                structuring: {
                  path: "user" as const,
                  version: "user-fields-1",
                },
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
        checks.create(principal, references, apiVersion),
      );
      return output(c, principal, "check:create", check, 201);
    },
  );

  if (apiVersion === 2)
    app.openapi(renderBibliography, async (c) => {
      const principal = await authorize(c.req.raw, "check:read");
      const snapshot = await guarded(principal, "check:read", () =>
        checks.exportSnapshot(principal, c.req.valid("param").checkId),
      );
      if (!snapshot) fail("check-not-found");
      const check = snapshot.check;
      const request = c.req.valid("json");
      if (
        [...request.applySlots, ...(request.suggestionSlots ?? [])].some(
          (slot) =>
            !check.references.some((reference) => reference.slot === slot),
        )
      )
        fail("invalid-request");
      // Pure rendering holds no Owner lock; publication rechecks current
      // authority below, so lease renewal and cancellation remain available.
      const data = await renderBibliographySnapshot(
        check,
        request,
        Object.fromEntries(
          snapshot.references
            .filter(
              (reference) => reference.resultIsCurrent && reference.resultId,
            )
            .map((reference) => [reference.slot, reference.resultId!]),
        ),
      );
      return output(c, principal, "check:read", data, 200);
    });

  if (apiVersion === 2)
    app.openapi(exportReferences, async (c) => {
      const principal = await authorize(c.req.raw, "check:read");
      const snapshot = await guarded(principal, "check:read", () =>
        checks.exportSnapshot(principal, c.req.valid("param").checkId),
      );
      if (!snapshot) fail("check-not-found");
      const request = c.req.valid("json");
      if (request.mode === "original" && request.corrections.length)
        fail("invalid-request");
      if (
        new Set(request.corrections.map((choice) => choice.slot)).size !==
        request.corrections.length
      )
        fail("invalid-request");
      const replacements = new Map<
        number,
        NonNullable<ReturnType<typeof suggestionFields>>
      >();
      for (const choice of request.corrections) {
        const reference = snapshot.check.references.find(
          (entry) => entry.slot === choice.slot,
        );
        const current = snapshot.references.find(
          (entry) => entry.slot === choice.slot,
        );
        if (
          !reference ||
          !current?.resultIsCurrent ||
          !current.resultId ||
          suggestionToken(reference, current.resultId) !== choice.resultToken
        )
          fail("invalid-request");
        const fields = suggestionFields(reference);
        if (!fields) fail("invalid-request");
        replacements.set(choice.slot, fields);
      }
      if (
        request.format === "imported-format" &&
        (!snapshot.references.length ||
          snapshot.references.some(
            (reference) =>
              !reference.imported ||
              reference.imported.format !==
                snapshot.references[0]?.imported?.format,
          ))
      )
        fail("invalid-request");
      const exporter = referenceExporter(request.format, snapshot.references);
      const body = exporter.serialize(
        snapshot.references.map((reference) => ({
          ...reference,
          authorsTruncated: replacements.has(reference.slot)
            ? false
            : reference.authorsTruncated,
          fields: replacements.get(reference.slot) ?? reference.fields,
        })),
      );
      await guarded(principal, "check:read", () => Promise.resolve());
      c.header("Content-Type", exporter.contentType);
      c.header(
        "Content-Disposition",
        `attachment; filename="${exporter.filename}"`,
      );
      c.header("Cache-Control", "no-store");
      c.header("X-Content-Type-Options", "nosniff");
      return stream(c, async (writer) => {
        try {
          await guarded(principal, "check:read", () => writer.write(body));
        } catch {
          writer.abort();
        }
      });
    });

  app.openapi(
    (apiVersion === 2 ? v2.getCheck : getCheck) as typeof v2.getCheck,
    async (c) => {
      const principal = await authorize(c.req.raw, "check:read");
      const check = await guarded(principal, "check:read", () =>
        checks.get(principal, c.req.valid("param").checkId, apiVersion),
      );
      if (!check) fail("check-not-found");
      return output(c, principal, "check:read", check, 200);
    },
  );

  app.openapi(
    (apiVersion === 2 ? v2.cancelCheck : cancelCheck) as typeof v2.cancelCheck,
    async (c) => {
      const principal = await authorize(c.req.raw, "check:cancel");
      const check = await guarded(principal, "check:cancel", () =>
        checks.cancel(principal, c.req.valid("param").checkId, apiVersion),
      );
      if (!check) fail("check-not-found");
      return output(c, principal, "check:cancel", check, 200);
    },
  );
  app.openapi(
    (apiVersion === 2
      ? v2.renewCheckLease
      : renewCheckLease) as typeof v2.renewCheckLease,
    async (c) => {
      const principal = await authorize(c.req.raw, "check:renew");
      const check = await guarded(principal, "check:renew", () =>
        checks.renew(principal, c.req.valid("param").checkId, apiVersion),
      );
      if (!check) fail("check-not-found");
      return output(c, principal, "check:renew", check, 200);
    },
  );

  app.openapi(
    (apiVersion === 2
      ? v2.streamCheckEvents
      : streamCheckEvents) as typeof v2.streamCheckEvents,
    async (c) => {
      const principal = await authorize(c.req.raw, "check:read");
      const checkId = c.req.valid("param").checkId;
      const check = await checks.get(principal, checkId, apiVersion);
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
            checks.renew(principal, checkId, apiVersion),
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
                const snapshot = await checks.get(current, checkId, apiVersion);
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
                if (
                  snapshot.state === "ended" &&
                  after >= snapshot.lastEventSeq
                )
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
    },
  );

  const document = app.getOpenAPI31Document({
    openapi: "3.1.0",
    info: {
      title: "Source Taster verification API",
      version: String(apiVersion),
    },
  });

  app.get(`/v${apiVersion}/openapi.json`, (c) => c.json(document));
  if (apiVersion === 1)
    app.route(
      "/",
      createApp(
        {
          structuring,
          entitlements,
          checks,
          events,
          heartbeatMs,
          referenceLimit,
          clock,
        },
        2,
      ),
    );
  return app;
}
