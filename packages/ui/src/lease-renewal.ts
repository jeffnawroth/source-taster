// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Lease renewal that survives a transient failure (#224).
 *
 * The service grants a lease of three renewal intervals and tells the client to
 * renew every third of it (`leaseRenewAfterMs`). A renewal that fails one
 * interval after the last good one therefore leaves about two intervals of
 * lease. The retries use that window and no more: they start 0.25, 0.75 and
 * 1.25 intervals after the failed attempt, and none starts later than 1.5
 * intervals after the first attempt, so the last one still has half an interval
 * to finish. After that the failure is final.
 */
export const retryDelayFractions = [0.25, 0.5, 0.5] as const;
const budgetFraction = 1.5;

/** A definitive answer (the Check is gone, ended or refused) is not retried. */
export function transientFailure(error: unknown): boolean {
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status !== "number") return true; // the request never got an answer
  return status >= 500 || status === 408 || status === 429;
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(done, ms);
    signal.addEventListener("abort", done, { once: true });
    function done() {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    }
  });
}

export async function renewWithRetry<T>(
  renew: () => Promise<T>,
  options: {
    /** `Check.leaseRenewAfterMs`. */
    renewAfterMs: number;
    /** Aborted when the workspace stops following this Check. */
    signal: AbortSignal;
    now?: () => number;
    sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
  },
): Promise<T> {
  const { renewAfterMs, signal, now = Date.now, sleep = wait } = options;
  const started = now();
  for (let retry = 0; ; retry++) {
    try {
      return await renew();
    } catch (error) {
      const fraction = retryDelayFractions[retry];
      if (fraction === undefined || signal.aborted || !transientFailure(error))
        throw error;
      const delay = Math.round(fraction * renewAfterMs);
      if (now() - started + delay > budgetFraction * renewAfterMs) throw error;
      await sleep(delay, signal);
      if (signal.aborted) throw error;
    }
  }
}
