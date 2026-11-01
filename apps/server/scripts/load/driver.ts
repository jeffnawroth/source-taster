// SPDX-License-Identifier: AGPL-3.0-or-later
// Client side of the load harness (#117): starts Checks over the public
// verification HTTP API, follows each one over SSE like the web app does, keeps
// its lease alive and records monotonic observation times. Timestamps are
// client receipt times (`performance.now()`); on loopback the delivery
// latency is part of what a client sees and is not subtracted.
import type {
  CheckObservation,
  ReferenceObservation,
  ReferenceOutcome,
} from "../../src/load/analysis.ts";
import type { WorkloadReference } from "./replay.ts";

export interface DriveOptions {
  apiUrl: string;
  /** One list per Check; all Checks are started together. */
  workload: WorkloadReference[][];
  /** The run is abandoned (and reported invalid) after this long. */
  maxRunMs: number;
  /** Lease renewals happen at this fraction of `leaseRenewAfterMs`. */
  leaseRenewFraction?: number;
  maxReconnects?: number;
}

interface WireEvent {
  type: "check.updated" | "reference.updated";
  state?: string;
  endReason?: string | null;
  reference?: {
    slot: number;
    progress: string;
    outcome?: {
      kind: "verdict" | "status";
      verdict?: string;
      status?: string;
      evidence?: { outcome?: string; reason?: string }[];
    };
  };
}

/** Parses a text/event-stream body into frames with their `id` and `data`. */
async function* frames(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      let boundary: number;
      while ((boundary = buffer.search(/\r?\n\r?\n/u)) >= 0) {
        const raw = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/u, "");
        let id: string | undefined;
        const data: string[] = [];
        for (const line of raw.split(/\r?\n/u)) {
          if (line.startsWith("id:")) id = line.slice(3).trim();
          else if (line.startsWith("data:")) data.push(line.slice(5).trim());
        }
        if (data.length) yield { id, data: data.join("\n") };
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function outcomeOf(
  outcome: NonNullable<WireEvent["reference"]>["outcome"],
): ReferenceOutcome | undefined {
  if (!outcome) return undefined;
  if (outcome.kind === "status")
    return { kind: "status", status: outcome.status, unavailable: [] };
  return {
    kind: "verdict",
    verdict: outcome.verdict,
    unavailable: (outcome.evidence ?? [])
      .filter((e) => e.outcome === "unavailable")
      .map((e) => e.reason ?? "unknown"),
  };
}

async function driveCheck(
  index: number,
  list: WorkloadReference[],
  options: DriveOptions,
  origin: number,
  signal: AbortSignal,
): Promise<CheckObservation> {
  const references: ReferenceObservation[] = list.map((r, i) => ({
    slot: i + 1,
    id: r.id,
    category: r.category,
  }));
  const observation: CheckObservation = {
    index,
    sentAtMs: 0,
    reconnects: 0,
    leaseRenewals: 0,
    references,
  };
  const now = () => performance.now() - origin;
  const fail = (reason: string) => {
    observation.failure ??= reason;
    return observation;
  };
  let renewal: NodeJS.Timeout | undefined;
  try {
    observation.sentAtMs = now();
    const created = await fetch(`${options.apiUrl}/v2/checks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        references: list.map((r) => ({
          originalText: r.originalText,
          fields: r.fields,
        })),
      }),
      signal,
    });
    observation.createdAtMs = now();
    if (created.status !== 201) return fail(`create-failed-${created.status}`);
    const { data } = (await created.json()) as {
      data: { id: string; leaseRenewAfterMs: number };
    };
    observation.checkId = data.id;
    const renewEvery = Math.max(
      1000,
      Math.floor(data.leaseRenewAfterMs * (options.leaseRenewFraction ?? 0.5)),
    );
    renewal = setInterval(() => {
      void fetch(`${options.apiUrl}/v2/checks/${data.id}/lease`, {
        method: "POST",
        signal,
      })
        .then((response) => {
          if (response.ok) observation.leaseRenewals += 1;
          else fail(`lease-renewal-${response.status}`);
        })
        .catch(() => undefined);
    }, renewEvery);

    let cursor = `${data.id}:0`;
    const maxReconnects = options.maxReconnects ?? 5;
    for (let attempt = 0; ; attempt += 1) {
      if (attempt > maxReconnects) return fail("stream-lost");
      if (attempt > 0) observation.reconnects += 1;
      const stream = await fetch(
        `${options.apiUrl}/v2/checks/${data.id}/events`,
        {
          headers: { accept: "text/event-stream", "last-event-id": cursor },
          signal,
        },
      );
      if (stream.status !== 200 || !stream.body)
        return fail(`stream-failed-${stream.status}`);
      for await (const frame of frames(stream.body)) {
        const at = now();
        if (frame.id) cursor = frame.id;
        const event = JSON.parse(frame.data) as WireEvent;
        if (event.type === "reference.updated" && event.reference) {
          const target = references[event.reference.slot - 1];
          if (!target) continue;
          if (
            target.firstActiveAtMs === undefined &&
            event.reference.progress !== "queued"
          )
            target.firstActiveAtMs = at;
          if (event.reference.progress === "ended") {
            target.firstActiveAtMs ??= at;
            target.endedAtMs ??= at;
            target.outcome = outcomeOf(event.reference.outcome);
          }
        } else if (event.type === "check.updated" && event.state === "ended") {
          observation.endedAtMs = at;
          observation.endReason = event.endReason ?? undefined;
          return observation;
        }
      }
      // The stream closed without the final event: reattach from the cursor.
    }
  } catch (error) {
    return fail(
      signal.aborted ? "run-deadline" : `client-error-${(error as Error).name}`,
    );
  } finally {
    if (renewal) clearInterval(renewal);
  }
}

/** Starts every Check at once and resolves when all have ended or the run ends. */
export async function driveChecks(
  options: DriveOptions,
): Promise<CheckObservation[]> {
  const origin = performance.now();
  const abort = new AbortController();
  const deadline = setTimeout(() => abort.abort(), options.maxRunMs);
  try {
    return await Promise.all(
      options.workload.map((list, index) =>
        driveCheck(index, list, options, origin, abort.signal),
      ),
    );
  } finally {
    clearTimeout(deadline);
  }
}
