// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP surface of the web process: the published /v1 contract.

import {
  structureDocument,
  structureText,
  getDocumentSettings,
} from "@source-taster/contract-verification/document-routes";
import { documentSizeLimit } from "@source-taster/contract-verification/document";
import {
  ExtractionFailed,
  logMetrics,
  sniffFormat,
  unavailableExtractor,
  type DocumentExtractor,
  type DocumentMetrics,
} from "../documents/extraction.ts";
import { readUpload } from "../documents/upload.ts";
import type { HttpBindings } from "@hono/node-server";
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
import {
  InvalidBibliographySelection,
  bibliographyRulesVersion,
  selectionRegions,
  detectBibliography,
  structureSelection,
  ReferenceLimitExceeded,
  type BibliographyDocument,
  type Structuring,
} from "@source-taster/core";
import { stream, streamSSE } from "hono/streaming";
import type { EventListener } from "../checks/events.ts";
import { HTTPException } from "hono/http-exception";
import type { StructuredReference } from "@source-taster/core";
import { ContentUnavailable } from "../checks/content.ts";
import { ReferenceConflict, CheckExpired } from "../checks/store.ts";
import type { CheckStore } from "../checks/store.ts";
import type { Entitlements, Permission, Principal } from "../entitlements.ts";
import { fail, problemResponse } from "./problems.ts";
import { billedChange, billedCreate } from "../quota/billing.ts";
import type { OwnerBinding } from "../quota/port.ts";
import { MaxReferences } from "@source-taster/contract-verification/v2";
import { randomUUID } from "node:crypto";

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
  documentExtractor?: DocumentExtractor;
  documentMetrics?: DocumentMetrics;
  documentConcurrency?: number;
  documentInputBytes?: number;
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
    documentExtractor = unavailableExtractor,
    documentMetrics = logMetrics,
    documentConcurrency = 2,
    documentInputBytes = documentSizeLimit,
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
  const owner = (principal: Principal): OwnerBinding => ({
    ownerId: principal.ownerId,
    actorId: principal.actorId,
  });
  /**
   * The envelope's Quota slot. A service call: made before the guard and never
   * under it. Display only; it degrades instead of failing a finished request.
   */
  async function quotaSlot(principal: Principal): Promise<Principal["quota"]> {
    if (!entitlements.quota) return principal.quota;
    try {
      return await entitlements.quota.snapshot(owner(principal));
    } catch {
      return { status: "not-implemented" };
    }
  }
  async function output<T, S extends 200 | 201>(
    c: Context,
    principal: Principal,
    permission: Permission,
    data: T,
    status: S,
    checkId?: string,
    knownQuota?: Principal["quota"],
  ) {
    const quota =
      knownQuota === undefined ? await quotaSlot(principal) : knownQuota;
    // Check again after the database/parser work, before response headers. The
    // transport write itself drains under the same durable Owner guard as commits.
    await guarded(principal, permission, () =>
      checkId
        ? checks.publish(principal, checkId, apiVersion, async () => {})
        : Promise.resolve(),
    );
    c.status(status);
    c.header("Content-Type", "application/json");
    c.header("Cache-Control", "no-store");
    const response = stream(c, async (writer) => {
      try {
        const send = () => writer.write(JSON.stringify({ data, quota }));
        await guarded(principal, permission, () =>
          checkId
            ? checks.publish(principal, checkId, apiVersion, send)
            : send(),
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
    if (error instanceof InvalidBibliographySelection)
      return problemResponse("invalid-request");
    if (error instanceof CheckExpired || error instanceof ContentUnavailable)
      return problemResponse(
        apiVersion === 1 ? "check-not-found" : "check-expired",
      );
    if (error instanceof ReferenceLimitExceeded)
      return problemResponse("reference-limit", undefined, error.limit);
    if (error instanceof ReferenceConflict)
      return problemResponse("reference-conflict");
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

  function documentStructure(
    text: string,
    regions: { start: number; end: number }[],
  ) {
    try {
      return {
        structuring: structureSelection(
          structuring,
          text,
          regions,
          referenceLimit,
        ),
        referenceLimitExceeded: false,
      };
    } catch (error) {
      if (!(error instanceof ReferenceLimitExceeded)) throw error;
      return {
        structuring: structureSelection(structuring, text, [], referenceLimit),
        referenceLimitExceeded: true,
      };
    }
  }
  if (apiVersion === 2) {
    app.openapi(structureText, async (c) => {
      const principal = await authorize(c.req.raw, "structuring:create");
      const input = c.req.valid("json");
      const detected = detectBibliography(input.text, {
        list: input.document === true,
      });
      const isDocument =
        input.document ||
        input.regions !== undefined ||
        detected.regions.length > 0;
      const selection = {
        ...detected,
        regions: selectionRegions(
          input.text,
          input.regions ?? detected.regions,
        ),
      };
      const data = isDocument
        ? {
            document: { text: input.text, selection },
            ...documentStructure(input.text, selection.regions),
          }
        : {
            document: null,
            structuring: structuring.structure(input.text),
            referenceLimitExceeded: false,
          };
      return output(c, principal, "structuring:create", data, 200);
    });
    app.openapi(getDocumentSettings, async (c) => {
      const principal = await authorize(c.req.raw, "structuring:create");
      return output(
        c,
        principal,
        "structuring:create",
        { inputBytes: documentInputBytes },
        200,
      );
    });
    let uploads = 0;
    // Authenticate and bound real streamed bytes before the form validator runs.
    app.use(structureDocument.path, async (c, next) => {
      if (c.req.method !== "POST") return next();
      await authorize(c.req.raw, "structuring:create");
      if (uploads >= documentConcurrency) fail("document-unavailable");
      uploads++;
      try {
        const form = await readUpload(
          c.req.raw,
          documentInputBytes,
          (c.env as Partial<HttpBindings> | undefined)?.incoming,
        );
        c.req.bodyCache.formData = form;
        await next();
      } finally {
        uploads--;
      }
    });
    app.openapi(structureDocument, async (c) => {
      const principal = await authorize(c.req.raw, "structuring:create");
      const file: unknown = c.req.valid("form").file;
      if (!(file instanceof File)) fail("invalid-request");
      if (file.size > documentInputBytes)
        fail("document-size-limit", undefined, documentInputBytes);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const format = sniffFormat(bytes);
      if (!format) fail("document-unsupported");
      try {
        const extracted = await documentExtractor.extract(
          format,
          bytes,
          c.req.raw.signal,
        );
        if (format === "pdf" && extracted.partialNoText)
          documentMetrics.record("pdf-partial-no-text");
        const selection = detectBibliography(extracted.text, { list: true });
        const data = {
          selection,
          document: {
            format,
            text: extracted.text,
            notice: extracted.partialNoText
              ? ("partial-no-text" as const)
              : null,
          },
          ...documentStructure(extracted.text, selection.regions),
        };
        return output(c, principal, "structuring:create", data, 200);
      } catch (error) {
        if (error instanceof ReferenceLimitExceeded)
          fail("reference-limit", undefined, error.limit);
        if (error instanceof ExtractionFailed) {
          if (format === "pdf" && error.failure === "no-text")
            documentMetrics.record("pdf-no-text");
          fail(`document-${error.failure}`);
        }
        throw error;
      }
    });
  }
  if (apiVersion === 2)
    app.openapi(v2.getQuota, async (c) => {
      const principal = await authorize(c.req.raw, "check:read");
      // The service is the only source of balances: fail closed when hosted.
      const quota = entitlements.quota
        ? await entitlements.quota.snapshot(owner(principal))
        : principal.quota;
      return output(c, principal, "check:read", quota, 200, undefined, quota);
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
      let document: BibliographyDocument | undefined;
      try {
        if ("document" in input) {
          const regions = selectionRegions(
            input.document.text,
            input.document.regions,
          );
          document = {
            text: input.document.text,
            selection: { version: bibliographyRulesVersion, regions },
          };
        } else if ("text" in input && apiVersion === 2) {
          const selection = detectBibliography(input.text);
          if (selection.regions.length)
            document = { text: input.text, selection };
        }
        const parsed = document
          ? structureSelection(
              structuring,
              document.text,
              document.selection.regions,
              referenceLimit,
            )
          : "library" in input
            ? importLibrary(input.library, referenceLimit)
            : "text" in input
              ? structuring.structure(input.text)
              : null;
        if (
          parsed &&
          parsed.references.length +
            (apiVersion === 1 ? parsed.rejected.length : 0) >
            referenceLimit
        )
          fail(
            "reference-limit",
            `At most ${referenceLimit} References can be checked at once.`,
            referenceLimit,
          );
        // v2 reviews rejected text separately; it never becomes a billed slot.
        if (
          apiVersion === 1 &&
          parsed?.rejected.length &&
          !("library" in input)
        )
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
      // First-N (ADR-0005): only the first N References start; the rest end as
      // not-checked. The request names N after Quota previewed the shortfall.
      const requested = c.req.query("maxReferences");
      const cap =
        apiVersion === 2 && requested !== undefined
          ? MaxReferences.safeParse(requested)
          : undefined;
      if (cap && !cap.success) fail("invalid-request");
      const started = Math.min(references.length, cap?.data ?? Infinity);
      const id = randomUUID();
      const check = await billedCreate(
        entitlements.quota,
        owner(principal),
        id,
        started,
        () =>
          guarded(principal, "check:create", () =>
            checks.create(principal, references, apiVersion, document, {
              id,
              maxReferences: started,
            }),
          ),
      );
      return output(c, principal, "check:create", check, 201, check.id);
    },
  );

  if (apiVersion === 2)
    app.openapi(v2.saveFields, async (c) => {
      const principal = await authorize(c.req.raw, "check:create");
      const { checkId, slot } = c.req.valid("param");
      const request = c.req.valid("json");
      const check = await billedChange(
        entitlements.quota,
        owner(principal),
        checkId,
        () =>
          request.recheck
            ? checks.plan(principal, checkId, {
                kind: "recheck",
                position: slot,
              })
            : Promise.resolve([]),
        (reserved) =>
          guarded(principal, "check:create", () =>
            checks.saveFields(principal, checkId, slot, request, reserved),
          ),
      );
      if (!check) fail("check-not-found");
      return output(c, principal, "check:create", check, 200, check.id);
    });

  if (apiVersion === 2) {
    app.openapi(v2.setManualOverride, async (c) => {
      const principal = await authorize(c.req.raw, "check:create");
      const { checkId, slot } = c.req.valid("param");
      const check = await guarded(principal, "check:create", () =>
        checks.setManualOverride(principal, checkId, slot, c.req.valid("json")),
      );
      if (!check) fail("check-not-found");
      return output(c, principal, "check:create", check, 200, check.id);
    });
    app.openapi(v2.previewSelection, async (c) => {
      const principal = await authorize(c.req.raw, "check:create");
      const { checkId } = c.req.valid("param");
      const data = await guarded(principal, "check:create", () =>
        checks.previewSelection(
          principal,
          checkId,
          c.req.valid("json"),
          structuring,
          referenceLimit,
        ),
      );
      if (!data) fail("check-not-found");
      return output(c, principal, "check:create", data, 200, checkId);
    });
    app.openapi(v2.editSelection, async (c) => {
      const principal = await authorize(c.req.raw, "check:create");
      const { checkId } = c.req.valid("param");
      const request = c.req.valid("json");
      const data = await billedChange(
        entitlements.quota,
        owner(principal),
        checkId,
        () =>
          guarded(principal, "check:create", async () => {
            const preview = await checks.previewSelection(
              principal,
              checkId,
              request,
              structuring,
              referenceLimit,
            );
            return preview
              ? checks.plan(principal, checkId, {
                  kind: "add",
                  count: preview.additionalQuota,
                })
              : null;
          }),
        (reserved) =>
          guarded(principal, "check:create", () =>
            checks.editList(
              principal,
              checkId,
              {
                expectedEventSeq: request.expectedEventSeq,
                add: [],
                remove: [],
              },
              referenceLimit,
              { regions: request.regions, parser: structuring },
              reserved,
            ),
          ),
      );
      if (!data) fail("check-not-found");
      return output(c, principal, "check:create", data, 200, checkId);
    });
    app.openapi(v2.recheckReference, async (c) => {
      const principal = await authorize(c.req.raw, "check:create");
      const { checkId, slot } = c.req.valid("param");
      const request = c.req.valid("json");
      const check = await billedChange(
        entitlements.quota,
        owner(principal),
        checkId,
        () =>
          checks.plan(principal, checkId, { kind: "recheck", position: slot }),
        (reserved) =>
          guarded(principal, "check:create", () =>
            checks.recheck(principal, checkId, slot, request, reserved),
          ),
      );
      if (!check) fail("check-not-found");
      return output(c, principal, "check:create", check, 200, check.id);
    });
    app.openapi(v2.editReferenceList, async (c) => {
      const principal = await authorize(c.req.raw, "check:create");
      const { checkId } = c.req.valid("param");
      const request = c.req.valid("json");
      const check = await billedChange(
        entitlements.quota,
        owner(principal),
        checkId,
        () =>
          checks.plan(principal, checkId, {
            kind: "add",
            count: request.add.length,
          }),
        (reserved) =>
          guarded(principal, "check:create", () =>
            checks.editList(
              principal,
              checkId,
              request,
              referenceLimit,
              undefined,
              reserved,
            ),
          ),
      );
      if (!check) fail("check-not-found");
      return output(c, principal, "check:create", check, 200, check.id);
    });
  }

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
      return output(
        c,
        principal,
        "check:read",
        data,
        200,
        c.req.valid("param").checkId,
      );
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
          fields:
            request.format === "imported-format"
              ? { ...reference.fields, ...replacements.get(reference.slot) }
              : (replacements.get(reference.slot) ?? reference.fields),
        })),
      );
      await guarded(principal, "check:read", () =>
        checks.publish(principal, snapshot.check.id, 2, async () => {}),
      );
      c.header("Content-Type", exporter.contentType);
      c.header(
        "Content-Disposition",
        `attachment; filename="${exporter.filename}"`,
      );
      c.header("Cache-Control", "no-store");
      c.header("X-Content-Type-Options", "nosniff");
      return stream(c, async (writer) => {
        try {
          await guarded(principal, "check:read", () =>
            checks.publish(principal, snapshot.check.id, 2, () =>
              writer.write(body),
            ),
          );
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
      return output(c, principal, "check:read", check, 200, check.id);
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
      return output(c, principal, "check:cancel", check, 200, check.id);
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
      return output(c, principal, "check:renew", check, 200, check.id);
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
      if (apiVersion === 2)
        c.header("X-Source-Taster-Replay-Through", String(check.lastEventSeq));
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
                    checks.publish(output, checkId, apiVersion, () =>
                      stream.writeSSE({
                        id: raw.startsWith(`${checkId}:`)
                          ? `${checkId}:${event.seq}`
                          : String(event.seq),
                        event: event.type,
                        data: JSON.stringify(event),
                      }),
                    ),
                  );
                  after = event.seq;
                }
                if (
                  !snapshot.references.some(
                    (r) =>
                      r.outcome.kind === "status" &&
                      r.outcome.status === "running",
                  ) &&
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
          documentExtractor,
          documentMetrics,
          documentConcurrency,
          documentInputBytes,
        },
        2,
      ),
    );
  return app;
}
