// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0007 identifier batching. Lookups for one Data source from concurrent
// Reference runs of this worker process share one request, which consumes the
// shared PostgreSQL budget once; each run receives the response with the
// identifiers that were sent and demultiplexes its own record. Batches are
// per process: separate worker processes do not join one batch.
//
// One live member (the one with the latest deadline) carries the request with
// its own permit, retry and Owner guard. A member that joins a batch waiting
// for its permit with a later deadline takes the send over before it is sent,
// so the request's timeout and retry follow the latest deadline among the
// members at send. Every member leaves on its own cancellation or deadline. A
// member that has left is not sent; if the carrier leaves, the request is
// abandoned and the remaining members join a new batch.
import type { Evidence, SourceName } from "@source-taster/core";
import type { SourceClock } from "./doi.ts";
export interface BatchResponse {
  body?: unknown;
  evidence: Evidence;
  /** The identifiers sent, in request order; absent if nothing was sent. */
  ids?: string[];
}
/**
 * Sends one batch; `ids` is read once, when the request is sent. Until then,
 * `handover` ends the call (by throwing its reason) so that a member with a
 * later deadline carries the send instead.
 */
export type BatchCarrier = (
  ids: () => string[],
  deadline: number,
  handover: AbortSignal,
) => Promise<{ body?: unknown; evidence: Evidence }>;
export interface BatchPolicy {
  /** Most distinct identifiers in one request. */
  size: number;
  /** Collection time before the batch asks for its permit. */
  windowMs: number;
  /**
   * Keep collecting while the permit is pending and choose the identifiers at
   * send (arXiv: one request per three-second opportunity). Otherwise the
   * batch closes when the window ends (Semantic Scholar: at most 200 ms).
   */
  untilSend: boolean;
}
interface Member {
  value: string;
  deadline: number;
  carry: BatchCarrier;
  left: boolean;
  settle(result: BatchResponse | { error: unknown }): void;
}
interface Batch {
  members: Member[];
  closed: boolean;
  launched: boolean;
  timer?: ReturnType<typeof setTimeout>;
  carrier?: Member;
  handover?: AbortController;
  ids?: string[];
}
export type IdentifierBatches = ReturnType<typeof identifierBatches>;
export function identifierBatches() {
  const open = new Map<SourceName, Batch>();
  const live = (batch: Batch) => batch.members.filter((m) => !m.left);
  const distinct = (members: Member[]) => [
    ...new Set(members.map((m) => m.value)),
  ];
  function close(source: SourceName, batch: Batch) {
    batch.closed = true;
    if (open.get(source) === batch) open.delete(source);
  }
  function add(source: SourceName, policy: BatchPolicy, member: Member) {
    let batch = open.get(source);
    if (!batch || batch.closed) {
      const created: Batch = { members: [], closed: false, launched: false };
      created.timer = setTimeout(() => {
        void launch(source, policy, created);
      }, policy.windowMs);
      open.set(source, created);
      batch = created;
    }
    batch.members.push(member);
    if (batch.carrier && !batch.ids && member.deadline > batch.carrier.deadline)
      batch.handover?.abort(new Error("source-batch-handover"));
    if (distinct(live(batch)).length >= policy.size) {
      close(source, batch);
      void launch(source, policy, batch);
    }
  }
  async function launch(source: SourceName, policy: BatchPolicy, batch: Batch) {
    if (batch.launched) return;
    batch.launched = true;
    clearTimeout(batch.timer);
    if (!policy.untilSend) close(source, batch);
    const members = live(batch);
    if (!members.length) return close(source, batch);
    const carrier = members.reduce((a, b) => (b.deadline > a.deadline ? b : a));
    const handover = new AbortController();
    batch.carrier = carrier;
    batch.handover = handover;
    const ids = () => {
      close(source, batch);
      batch.ids ??= distinct(live(batch));
      return batch.ids;
    };
    let response;
    try {
      response = await carrier.carry(ids, carrier.deadline, handover.signal);
    } catch (error) {
      close(source, batch);
      if (handover.signal.aborted && !batch.ids) return relaunch();
      // The carrier's run was cancelled or lost its authority; only that run
      // sees the error. The others are still waiting and try again.
      carrier.settle({ error });
      for (const member of live(batch)) add(source, policy, member);
      return;
    }
    close(source, batch);
    const sent = batch.ids;
    if (!sent && handover.signal.aborted) return relaunch();
    if (!sent) {
      // Nothing was sent (the carrier's permit wait or deadline ended). That
      // is the carrier's outcome only; the others wait within their own
      // deadlines in a new batch.
      carrier.settle(response);
      for (const member of live(batch)) add(source, policy, member);
      return;
    }
    // A member that joined after the identifiers were chosen was not sent.
    for (const member of live(batch))
      if (sent.includes(member.value))
        member.settle({ ...response, ids: sent });
      else add(source, policy, member);
    /**
     * A later member took the send over before anything was sent: every live
     * member, the previous carrier included, joins a new batch, which the
     * member with the latest deadline carries.
     */
    function relaunch() {
      for (const member of live(batch)) add(source, policy, member);
    }
  }
  return {
    join(
      source: SourceName,
      policy: BatchPolicy,
      request: {
        value: string;
        operation: Evidence["operation"];
        deadline: number;
        carry: BatchCarrier;
        clock: SourceClock;
        signal?: AbortSignal;
      },
    ) {
      const { clock, signal } = request;
      signal?.throwIfAborted();
      const joined = clock.now();
      return new Promise<BatchResponse>((resolve, reject) => {
        const leave = new AbortController();
        const member: Member = {
          value: request.value,
          deadline: request.deadline,
          carry: request.carry,
          left: false,
          settle(result) {
            if (member.left) return;
            member.left = true;
            leave.abort();
            // A cancellation reason or carrier error propagates as it would
            // from the run's own request.
            if ("error" in result)
              return reject(
                result.error instanceof Error
                  ? result.error
                  : new Error("source-operation-aborted"),
              );
            // Each run records only its own wait, never the batch's raw body.
            const { raw: _raw, ...evidence } = result.evidence;
            resolve({
              ...result,
              evidence: {
                ...evidence,
                operation: request.operation,
                durationMs: clock.now() - joined,
              },
            });
          },
        };
        signal?.addEventListener(
          "abort",
          () => member.settle({ error: signal.reason }),
          { once: true, signal: leave.signal },
        );
        clock
          .sleep(Math.max(0, request.deadline - clock.now()), leave.signal)
          .then(
            () =>
              member.settle({
                evidence: {
                  source,
                  operation: request.operation,
                  outcome: "unavailable",
                  reason: "deadline",
                  durationMs: 0,
                  attempts: 0,
                  observedAt: new Date(clock.now()).toISOString(),
                },
              }),
            () => {},
          );
        add(source, policy, member);
      });
    },
  };
}
