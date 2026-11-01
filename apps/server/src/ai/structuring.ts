// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { AiOutput as Output } from "@source-taster/contract-verification/ai";
import {
  structureSelection,
  ReferenceLimitExceeded,
  type Csl,
  type Span,
  type StructuredReference,
  type Structuring,
  type StructuringResult,
} from "@source-taster/core";
import type { ExtractionPort } from "./port.ts";

export class InvalidAiOutput extends Error {}
export function configurationId(port: ExtractionPort) {
  return `ai-sha256:${createHash("sha256").update(JSON.stringify(port.configuration)).digest("hex")}`;
}
function validSpan(span: Span, start: number, end: number) {
  return (
    Number.isSafeInteger(span.start) &&
    Number.isSafeInteger(span.end) &&
    span.start >= start &&
    span.end > span.start &&
    span.end <= end
  );
}
/** Never normalize or substitute AI text: accept exact UTF-16 spans only. */
export function ground(
  input: string,
  output: unknown,
  parser: Structuring,
  configuration: string,
): StructuredReference[] {
  if (JSON.stringify(output)?.length > 1_048_576) throw new InvalidAiOutput();
  const parsed = Output.safeParse(output);
  if (!parsed.success) throw new InvalidAiOutput();
  const ordered = [...parsed.data.references].sort(
    (a, b) => a.span.start - b.span.start || a.span.end - b.span.end,
  );
  for (let i = 1; i < ordered.length; i++)
    if (ordered[i]!.span.start < ordered[i - 1]!.span.end)
      throw new InvalidAiOutput();
  return ordered.flatMap((item) => {
    if (
      !validSpan(item.span, 0, input.length) ||
      input.slice(item.span.start, item.span.end) !== item.originalText
    )
      throw new InvalidAiOutput();
    // Supplied offsets must be in the Reference, even for rejected fields.
    for (const span of Object.values(item.spans))
      if (!validSpan(span, item.span.start, item.span.end))
        throw new InvalidAiOutput();
    const baseline = parser.structure(item.originalText);
    if (!baseline.references.length) return [];
    const csl: Csl = {};
    const fieldSources: StructuredReference["fieldSources"] = {};
    const proposals: NonNullable<StructuredReference["ai"]>["proposals"] = [];
    const changedFields: string[] = [];
    const leaves = (key: string, value: unknown): [string, string][] => {
      if (typeof value === "string") return [[key, value]];
      if (Array.isArray(value))
        return value.flatMap((v, i) => leaves(`${key}.${i}`, v));
      if (value && typeof value === "object")
        return Object.entries(value).flatMap(([k, v]) =>
          leaves(key === "issued" ? key : `${key}.${k}`, v),
        );
      return [];
    };
    for (const [field, value] of Object.entries(item.csl)) {
      const parts = leaves(field, value);
      if (
        field !== "type" &&
        (!parts.length ||
          parts.some(([key, raw]) => {
            const span = item.spans[key];
            return !span || input.slice(span.start, span.end) !== raw;
          }))
      ) {
        proposals.push({ field, value, reason: "ungrounded" });
        continue;
      }
      Object.assign(csl, { [field]: value });
      for (const [key, raw] of parts)
        fieldSources[key] = {
          raw,
          provenance: "ai",
          ...(item.spans[key] ? { span: item.spans[key] } : {}),
        };
      // Composite display sources are exact only where the provider supplied one.
      if (!(field in fieldSources))
        fieldSources[field] = {
          provenance: "ai",
          raw: parts.map(([, raw]) => raw).join("; "),
        };
      if (
        !isDeepStrictEqual(
          baseline.references[0]?.csl[field as keyof Csl],
          value,
        )
      )
        changedFields.push(field);
    }
    return [
      {
        originalText: item.originalText,
        span: item.span,
        csl,
        fieldSources,
        structuring: { path: "ai" as const, version: configuration },
        ai: {
          configuration,
          notice: "ai-can-be-wrong" as const,
          proposals,
          changedFields,
        },
      },
    ];
  });
}
function shift(
  reference: StructuredReference,
  offset: number,
): StructuredReference {
  const span = (s: Span) => ({ start: s.start + offset, end: s.end + offset });
  return {
    ...reference,
    span: span(reference.span),
    fieldSources: Object.fromEntries(
      Object.entries(reference.fieldSources).map(([key, source]) => [
        key,
        { ...source, ...(source.span ? { span: span(source.span) } : {}) },
      ]),
    ),
  };
}
export async function extractText(options: {
  text: string;
  regions?: Span[];
  parser: Structuring;
  limit: number;
  port: ExtractionPort;
  signal: AbortSignal;
  authorize(this: void): Promise<void>;
}): Promise<StructuringResult> {
  const { text, regions, parser, limit, port, signal, authorize } = options;
  const size = port.configuration?.chunkSize ?? 0;
  if (!port.extractSpans || size < 64 || size > 65_536)
    throw new InvalidAiOutput();
  if (text.length > 20_971_520) {
    const fallback = regions
      ? structureSelection(parser, text, regions, limit)
      : parser.structure(text);
    return {
      ...fallback,
      ai: {
        reason: null,
        upgrade: false,
        fallbacks: (regions ?? [{ start: 0, end: text.length }]).map(
          (span) => ({ span, reason: "invalid-output" as const }),
        ),
      },
    };
  }
  const chunks: Span[] = [];
  for (const region of regions ?? [{ start: 0, end: text.length }]) {
    // Documents retain deterministic reference boundaries; pasted text breaks
    // only at paragraph boundaries. Oversized indivisible units fall back whole.
    const detected = regions
      ? parser.structure(text.slice(region.start, region.end))
      : undefined;
    const units = detected
      ? [...detected.references, ...detected.rejected]
          .map((r) => ({
            start: r.span.start + region.start,
            end: r.span.end + region.start,
          }))
          .sort((a, b) => a.start - b.start)
      : [
          ...text
            .slice(region.start, region.end)
            .matchAll(/[^\r\n]+(?:\r?\n(?!\s*\r?\n)[^\r\n]+)*/gu),
        ].map((m) => ({
          start: region.start + m.index,
          end: region.start + m.index + m[0].length,
        }));
    let current: Span | undefined;
    let previous: Span | undefined;
    for (const unit of units) {
      if (current && unit.end - current.start <= size) current.end = unit.end;
      else {
        const overlap =
          previous &&
          previous.end - previous.start <= Math.floor(size / 8) &&
          unit.end - previous.start <= size;
        current = {
          start: overlap ? previous!.start : unit.start,
          end: unit.end,
        };
        chunks.push(current);
      }
      previous = unit;
    }
  }
  const chunkOverflow = chunks.length > 2048;
  if (chunkOverflow)
    chunks.splice(
      0,
      chunks.length,
      ...(regions ?? [{ start: 0, end: text.length }]),
    );
  let outputBytes = 0;
  const seen = new Set<string>();
  const stop = new AbortController();
  const result: StructuringResult = {
    references: [],
    rejected: [],
    guidance: null,
    quotaConsumed: 0,
    referenceLimit: limit,
    ai: { reason: null, upgrade: false, fallbacks: [] },
  };
  const outcomes = new Array<{
    references: StructuredReference[];
    rejected: StructuringResult["rejected"];
    fallback?: NonNullable<StructuringResult["ai"]>["fallbacks"][number];
  }>(chunks.length);
  const requestTimeout = AbortSignal.timeout(60_000);
  const deadline = AbortSignal.any([signal, stop.signal, requestTimeout]);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(3, chunks.length) }, async () => {
      for (;;) {
        const index = cursor++;
        const chunk = chunks[index];
        if (!chunk) return;
        const input = text.slice(chunk.start, chunk.end);
        let reason: "invalid-output" | "timeout" | "provider-unavailable" =
          "invalid-output";
        let references: StructuredReference[] | undefined;
        for (
          let attempt = 0;
          attempt < 2 && input.length <= size && !chunkOverflow;
          attempt++
        ) {
          signal.throwIfAborted();
          stop.signal.throwIfAborted();
          if (requestTimeout.aborted) {
            reason = "timeout";
            break;
          }
          // Authority failures propagate: never disguise revocation as fallback.
          await authorize();
          const timeout = AbortSignal.timeout(15_000);
          const abort = AbortSignal.any([deadline, timeout]);
          let remove = () => {};
          try {
            const stopped = new Promise<never>((_, reject) => {
              const onAbort = () => reject(new Error("ai-request-aborted"));
              abort.addEventListener("abort", onAbort, { once: true });
              remove = () => abort.removeEventListener("abort", onAbort);
              if (abort.aborted) onAbort();
            });
            const output = await Promise.race([
              port.extractSpans!(input, abort),
              stopped,
            ]);
            outputBytes += Buffer.byteLength(JSON.stringify(output) ?? "");
            if (outputBytes > 16_777_216) throw new InvalidAiOutput();
            references = ground(
              input,
              output,
              parser,
              configurationId(port),
            ).map((r) => shift(r, chunk.start));
            break;
          } catch (error) {
            signal.throwIfAborted();
            stop.signal.throwIfAborted();
            reason =
              timeout.aborted ||
              requestTimeout.aborted ||
              (error instanceof Error && error.name === "TimeoutError")
                ? "timeout"
                : error instanceof InvalidAiOutput
                  ? "invalid-output"
                  : "provider-unavailable";
          } finally {
            remove();
          }
        }
        if (references) outcomes[index] = { references, rejected: [] };
        else {
          const fallback = parser.structure(input);
          outcomes[index] = {
            references: fallback.references.map((r) => shift(r, chunk.start)),
            rejected: fallback.rejected.map((r) => ({
              ...r,
              span: {
                start: r.span.start + chunk.start,
                end: r.span.end + chunk.start,
              },
            })),
            fallback: { span: chunk, reason },
          };
        }
        for (const r of outcomes[index].references)
          seen.add(`${r.span.start}:${r.span.end}`);
        if (seen.size > limit) throw new ReferenceLimitExceeded(limit);
      }
    }),
  ).catch((error: unknown) => {
    stop.abort();
    throw error;
  });
  signal.throwIfAborted();
  stop.signal.throwIfAborted();
  await authorize();
  for (const outcome of outcomes) {
    result.references.push(...outcome.references);
    result.rejected.push(...outcome.rejected);
    if (outcome.fallback) result.ai!.fallbacks.push(outcome.fallback);
  }
  result.references = result.references.filter(
    (r, i, all) =>
      all.findIndex(
        (other) =>
          other.span.start === r.span.start && other.span.end === r.span.end,
      ) === i,
  );
  if (result.references.length > limit) throw new ReferenceLimitExceeded(limit);
  result.guidance = result.references.length ? null : "no-references";
  return result;
}
