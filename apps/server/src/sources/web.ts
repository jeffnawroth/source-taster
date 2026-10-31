// SPDX-License-Identifier: AGPL-3.0-or-later
import { webPageTitle } from "@source-taster/core";
import type {
  Evidence,
  SearchSettings,
  SourceName,
  WebObservation,
  WebSources,
} from "@source-taster/core";
import type { SourceBudget, SourceClock, SourceDispatch } from "./doi.ts";
import { prepareSafeHttp } from "./safe-http.ts";
export function createWebSources(options: {
  budget: SourceBudget;
  clock: SourceClock;
  settings: SearchSettings;
  signal?: AbortSignal;
  fixtureBase?: string;
  urlEnabled: boolean;
  archiveEnabled: boolean;
  beforeRequest?: (source: SourceName) => Promise<void>;
  dispatch?: (
    send: () => Promise<SourceDispatch | null>,
  ) => Promise<SourceDispatch | null>;
}): WebSources {
  async function request(
    source: "url" | "internetarchive",
    url: URL,
    deadline: number,
    operation: "url" | "archive",
  ) {
    const began = options.clock.now();
    let attempts = 0,
      status: number | undefined,
      response: Response | undefined;
    let reason = "deadline";
    for (let attempt = 0; attempt <= options.settings.maxRetries; attempt++) {
      options.signal?.throwIfAborted();
      if (options.clock.now() >= deadline) break;
      await options.beforeRequest?.(source);
      const permit = await options.budget.acquire(source, operation, deadline);
      if (!permit) {
        reason = "rate-budget";
        break;
      }
      const abort = new AbortController();
      const timer = setTimeout(
        () => abort.abort(new DOMException("Timed out", "TimeoutError")),
        Math.max(
          1,
          Math.min(
            deadline - options.clock.now(),
            options.settings.sources[source].requestTimeoutMs,
          ),
        ),
      );
      const signal = options.signal
        ? AbortSignal.any([options.signal, abort.signal])
        : abort.signal;
      let retry: boolean;
      let delay = 0;
      let dispatchTimer: ReturnType<typeof setTimeout> | undefined;
      try {
        const sendHttp = await prepareSafeHttp(
          url,
          signal,
          options.fixtureBase,
        );
        const invoke = () =>
          permit.dispatch((timeoutMs) => {
            signal.throwIfAborted();
            // A permit can narrow the deadline after DNS/budget/authority waiting.
            dispatchTimer = setTimeout(
              () => abort.abort(new DOMException("Timed out", "TimeoutError")),
              timeoutMs,
            );
            attempts++;
            return sendHttp();
          });
        await options.beforeRequest?.(source);
        const dispatched = await (options.dispatch
          ? options.dispatch(invoke)
          : invoke());
        if (!dispatched) {
          attempt--;
          continue;
        }
        response = await dispatched.pending;
        status = response.status;
        if (status !== 429 && status < 500) {
          reason = "response";
          break;
        }
        const after = response.headers.get("retry-after");
        if (after) {
          delay = /^\d+(?:\.\d+)?$/u.test(after)
            ? Math.ceil(Number(after) * 1000)
            : Math.max(0, Date.parse(after) - options.clock.now());
          if (Number.isFinite(delay)) await options.budget.defer(source, delay);
          retry =
            Number.isFinite(delay) && delay <= options.settings.retryAfterMaxMs;
        } else retry = status >= 500;
        reason = status === 429 ? "rate-budget" : "http-error";
        response = undefined;
      } catch (error) {
        options.signal?.throwIfAborted();
        retry =
          signal.reason instanceof DOMException &&
          signal.reason.name === "TimeoutError";
        reason =
          error instanceof Error &&
          [
            "unsafe-destination",
            "response-size",
            "unsupported-encoding",
          ].includes(error.message)
            ? error.message
            : retry
              ? "timeout"
              : "request-unavailable";
        response = undefined;
      } finally {
        clearTimeout(timer);
        clearTimeout(dispatchTimer);
        abort.abort();
        await permit.release();
      }
      if (
        !retry ||
        attempt === options.settings.maxRetries ||
        options.clock.now() + delay >= deadline
      )
        break;
      if (delay) await options.clock.sleep(delay, options.signal);
    }
    const evidence: Evidence = {
      source,
      operation,
      outcome: "unavailable",
      reason,
      ...(status === undefined ? {} : { status }),
      attempts,
      durationMs: options.clock.now() - began,
      observedAt: new Date(options.clock.now()).toISOString(),
    };
    if (options.clock.now() >= deadline)
      return { evidence: { ...evidence, reason: "deadline" } };
    return { response, evidence };
  }
  return {
    enabled: {
      url: options.urlEnabled,
      internetarchive: options.archiveEnabled,
    },
    async archive(originalUrl, deadline) {
      const url = new URL("https://archive.org/wayback/available");
      url.searchParams.set("url", originalUrl);
      const { response, evidence } = await request(
        "internetarchive",
        url,
        deadline,
        "archive",
      );
      if (!response || response.status !== 200) return { evidence: [evidence] };
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        evidence.reason = "invalid-metadata";
        return { evidence: [evidence] };
      }
      if (
        !body ||
        typeof body !== "object" ||
        !("archived_snapshots" in body) ||
        !body.archived_snapshots ||
        typeof body.archived_snapshots !== "object" ||
        Array.isArray(body.archived_snapshots)
      ) {
        evidence.reason = "invalid-metadata";
        return { evidence: [evidence] };
      }
      const snapshots = body.archived_snapshots;
      if (!Object.keys(snapshots).length) {
        evidence.outcome = "no-record";
        evidence.reason = undefined;
        evidence.raw = { originalUrl, archiveMatch: false };
        return { evidence: [evidence] };
      }
      const closest = "closest" in snapshots ? snapshots.closest : undefined;
      if (
        !closest ||
        typeof closest !== "object" ||
        !("available" in closest) ||
        closest.available !== true ||
        !("status" in closest) ||
        closest.status !== "200" ||
        !("url" in closest) ||
        typeof closest.url !== "string" ||
        !("timestamp" in closest) ||
        typeof closest.timestamp !== "string"
      ) {
        evidence.reason = "invalid-metadata";
        return { evidence: [evidence] };
      }
      let snapshot: URL;
      try {
        snapshot = new URL(closest.url);
      } catch {
        evidence.reason = "invalid-metadata";
        return { evidence: [evidence] };
      }
      const match = (snapshot.pathname + snapshot.search).match(
        /^\/web\/(\d{14})(?:id_)?\/(https?:\/\/[^]+)$/u,
      );
      if (
        snapshot.hostname !== "web.archive.org" ||
        !["http:", "https:"].includes(snapshot.protocol) ||
        snapshot.username ||
        snapshot.password ||
        snapshot.port ||
        !match ||
        match[1] !== closest.timestamp ||
        !sameUrl(match[2]!, originalUrl)
      ) {
        evidence.reason = "archive-mismatch";
        return { evidence: [evidence] };
      }
      snapshot = new URL(
        `https://web.archive.org/web/${match[1]}id_/${match[2]}`,
      );
      evidence.outcome = "exists";
      evidence.reason = undefined;
      evidence.raw = {
        originalUrl,
        archiveUrl: snapshot.href,
        timestamp: closest.timestamp,
      };
      const page = await this.page(snapshot.href, deadline, "internetarchive");
      // Redirects must still point to a capture of the cited original URL,
      // never a toolbar, an unrelated capture or a live-page redirect.
      const final = page.observation
        ? new URL(page.observation.finalUrl)
        : undefined;
      const finalMatch =
        final &&
        (final.pathname + final.search).match(
          /^\/web\/(\d{14})(?:id_)?\/(https?:\/\/[^]+)$/u,
        );
      if (
        !page.observation?.title ||
        page.evidence.at(-1)?.outcome !== "exists" ||
        final?.hostname !== "web.archive.org" ||
        !finalMatch ||
        finalMatch[1] !== closest.timestamp ||
        !sameUrl(finalMatch[2]!, originalUrl)
      ) {
        const last = page.evidence.at(-1);
        if (last && last.outcome === "exists") {
          last.outcome = "unavailable";
          last.reason = "archive-mismatch";
        }
        return { evidence: [evidence, ...page.evidence] };
      }
      const observation = {
        ...page.observation,
        originalUrl,
        archiveUrl: page.observation.finalUrl,
        timestamp: closest.timestamp,
      };
      page.evidence.at(-1)!.raw = observation;
      page.evidence.at(-1)!.web = observation;
      return { observation, evidence: [evidence, ...page.evidence] };
    },
    async page(originalUrl, deadline, source = "url") {
      const evidence: Evidence[] = [];
      let url: URL;
      try {
        url = new URL(originalUrl);
      } catch {
        return { evidence, reason: "invalid-url" };
      }
      for (let redirects = 0; redirects <= 5; redirects++) {
        const received = await request(
          source,
          url,
          deadline,
          source === "url" ? "url" : "archive",
        );
        const entry = received.evidence;
        evidence.push(entry);
        const response = received.response;
        if (!response) return { evidence };
        // Only the agreed observation survives; no page body, cookies or headers.
        const observation: WebObservation = {
          originalUrl,
          finalUrl: url.href,
          status: response.status,
        };
        entry.raw = observation;
        entry.web = observation;
        if ([301, 302, 303, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          if (!location || redirects === 5) {
            entry.reason = "redirect-limit";
            return { evidence };
          }
          try {
            url = new URL(location, url);
          } catch {
            entry.reason = "invalid-url";
            return { evidence };
          }
          observation.redirectTarget = url.href;
          entry.outcome = "redirect";
          entry.reason = undefined;
          continue;
        }
        if ([404, 410].includes(response.status)) {
          entry.outcome = "nonexistent";
          entry.reason = undefined;
          return { observation, evidence };
        }
        if (
          response.status !== 200 ||
          !/^(?:text\/html|application\/xhtml\+xml)(?:;|$)/iu.test(
            response.headers.get("content-type") ?? "",
          )
        ) {
          entry.reason = "inconclusive-response";
          return { observation, evidence };
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        const declared = response.headers
          .get("content-type")
          ?.match(/\bcharset\s*=\s*["']?([^;"'\s]+)/iu)?.[1];
        const meta = new TextDecoder("latin1")
          .decode(bytes.subarray(0, 1024))
          .match(/<meta\b[^>]*\bcharset\s*=\s*["']?([a-z0-9_-]+)/iu)?.[1];
        let html: string;
        try {
          html = new TextDecoder(declared ?? meta ?? "utf-8", {
            fatal: true,
          }).decode(bytes);
        } catch {
          entry.reason = "inconclusive-response";
          return { observation, evidence };
        }
        const title = webPageTitle(html);
        if (
          !title ||
          /\b(?:404|page not found|not found|seite nicht gefunden|access denied|just a moment|robot check)\b/iu.test(
            html.slice(0, 65536),
          )
        ) {
          entry.reason = "inconclusive-response";
          return { observation, evidence };
        }
        observation.title = title;
        entry.outcome = "exists";
        entry.reason = undefined;
        return { observation, evidence };
      }
      return { evidence };
    },
  };
}

function sameUrl(a: string, b: string) {
  try {
    const left = new URL(a),
      right = new URL(b);
    left.hash = "";
    right.hash = "";
    return left.href === right.href;
  } catch {
    return false;
  }
}
