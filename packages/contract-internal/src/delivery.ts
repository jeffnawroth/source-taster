// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Wire framing only. This module has no database, identity or content access.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
export type JsonInput = unknown;
export class JsonFragment {
  source: AsyncIterable<string>;
  constructor(source: AsyncIterable<string>) {
    this.source = source;
  }
}
/** Encode lazy collections and split even a single long string without building
 * a complete serialized record or document. Callers own bounded persistence reads. */
export async function* jsonTokens(value: JsonInput): AsyncGenerator<string> {
  if (value instanceof JsonFragment) {
    yield* value.source;
    return;
  }
  if (value === null || value === undefined) {
    yield "null";
    return;
  }
  if (value instanceof Date) {
    yield JSON.stringify(value.toISOString());
    return;
  }
  if (typeof value === "bigint") {
    yield JSON.stringify(String(value));
    return;
  }
  if (typeof value === "string") {
    yield '"';
    for (let i = 0; i < value.length; i += 2048)
      yield JSON.stringify(value.slice(i, i + 2048)).slice(1, -1);
    yield '"';
    return;
  }
  if (typeof value !== "object") {
    yield JSON.stringify(value);
    return;
  }
  if (
    Symbol.asyncIterator in value ||
    Symbol.iterator in value ||
    Array.isArray(value)
  ) {
    yield "[";
    let first = true;
    for await (const item of value as
      AsyncIterable<unknown> | Iterable<unknown>) {
      if (!first) yield ",";
      first = false;
      yield* jsonTokens(item);
    }
    yield "]";
    return;
  }
  yield "{";
  let first = true;
  for (const key of Object.keys(value)) {
    const item = (value as Record<string, unknown>)[key];
    if (item === undefined) continue;
    if (!first) yield ",";
    first = false;
    yield JSON.stringify(key) + ":";
    yield* jsonTokens(item);
  }
  yield "}";
}
export interface DeliveryContext {
  snapshotId: string;
  requestId: string;
  program: "service" | "verification" | "accounting";
  generatedAt: string;
  expiresAt: string;
  credentialHash: string;
  records?: Record<string, string>;
}
export function partLimit(input: string | undefined) {
  const bytes = input === undefined ? 65536 : Number(input);
  if (!Number.isSafeInteger(bytes) || bytes < 512 || bytes > 262144)
    throw new Error("Invalid export part size");
  return bytes;
}
function mac(secret: string, value: string) {
  return createHmac("sha256", secret)
    .update("export-delivery-v1:" + value)
    .digest("base64url");
}
export function deliveryCursor(
  secret: string,
  context: DeliveryContext,
  cursor?: string,
) {
  if (!cursor)
    return { sequence: -1, prefix: createHash("sha256").digest("hex") };
  if (cursor.length > 2048) throw new Error("Invalid delivery cursor");
  const [payload, signature, extra] = cursor.split(".");
  if (!payload || !signature || extra)
    throw new Error("Invalid delivery cursor");
  const expected = Buffer.from(mac(secret, payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new Error("Invalid delivery cursor");
  const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
    context: DeliveryContext;
    sequence: number;
    prefix: string;
  };
  if (
    JSON.stringify(data.context) !== JSON.stringify(context) ||
    !Number.isSafeInteger(data.sequence) ||
    data.sequence < 0 ||
    !/^[a-f0-9]{64}$/.test(data.prefix)
  )
    throw new Error("Invalid delivery cursor");
  return data;
}
/** Backpressure follows ReadableStream.pull. A cancelled response closes its
 * iterator. Resume replays and authenticates the prefix without retaining it. */
export function deliveryBody(options: {
  source: AsyncIterable<string>;
  context: DeliveryContext;
  secret: string;
  partBytes: number;
  multipart: boolean;
  cursor?: string;
  validate(): Promise<void>;
  completed(verifier: string): Promise<void>;
}) {
  const resume = deliveryCursor(
    options.secret,
    options.context,
    options.cursor,
  );
  async function* frames() {
    const hash = createHash("sha256");
    let sequence = 0,
      bytes = 0,
      used = 0;
    let chain = createHash("sha256").digest("hex");
    let buffer = Buffer.allocUnsafe(options.partBytes);
    const frame = async (part: Buffer) => {
      await options.validate();
      hash.update(part);
      bytes += part.length;
      chain = createHash("sha256")
        .update(Buffer.from(chain, "hex"))
        .update(part)
        .digest("hex");
      const prefix = hash.copy().digest("hex");
      const index = sequence++;
      if (index === resume.sequence && prefix !== resume.prefix)
        throw new Error("Snapshot prefix changed");
      if (index <= resume.sequence) return undefined;
      const payload = Buffer.from(
        JSON.stringify({ context: options.context, sequence: index, prefix }),
      ).toString("base64url");
      return options.multipart
        ? Buffer.from(
            JSON.stringify({
              type: "part",
              snapshotId: options.context.snapshotId,
              sequence: index,
              chain,
              bytes: part.length,
              sha256: createHash("sha256").update(part).digest("hex"),
              cursor: payload + "." + mac(options.secret, payload),
              base64: part.toString("base64"),
            }) + "\n",
          )
        : part;
    };
    for await (const token of options.source) {
      const encoded = Buffer.from(token);
      let offset = 0;
      while (offset < encoded.length) {
        const length = Math.min(
          options.partBytes - used,
          encoded.length - offset,
        );
        encoded.copy(buffer, used, offset, offset + length);
        used += length;
        offset += length;
        if (used === options.partBytes) {
          const output = await frame(buffer);
          if (output) yield output;
          buffer = Buffer.allocUnsafe(options.partBytes);
          used = 0;
        }
      }
    }
    if (used) {
      const output = await frame(buffer.subarray(0, used));
      if (output) yield output;
    }
    if (resume.sequence >= sequence)
      throw new Error("Invalid delivery cursor range");
    await options.validate();
    const sha256 = hash.digest("hex");
    const completionToken = mac(
      options.secret,
      JSON.stringify({ ...options.context, sha256, bytes, parts: sequence }),
    );
    await options.completed(
      createHash("sha256").update(completionToken).digest("hex"),
    );
    if (options.multipart)
      yield Buffer.from(
        JSON.stringify({
          type: "manifest",
          ...options.context,
          credentialHash: undefined,
          complete: true,
          parts: sequence,
          bytes,
          sha256,
          chain,
          completionToken,
        }) + "\n",
      );
  }
  const iterator = frames();
  return new ReadableStream<Uint8Array>(
    {
      async pull(controller) {
        try {
          const next = await iterator.next();
          if (next.done) controller.close();
          else controller.enqueue(next.value);
        } catch {
          await iterator.return(undefined);
          controller.error(
            new Error(
              "Delivery interrupted; current authority and an unchanged snapshot are required to resume",
            ),
          );
        }
      },
      async cancel() {
        await iterator.return(undefined);
      },
    },
    { highWaterMark: 0 },
  );
}
