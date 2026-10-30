// SPDX-License-Identifier: AGPL-3.0-or-later
import { decodeHTML } from "entities";
import {
  compare,
  comparisonLimits,
  type ComparisonProfile,
} from "./comparison.ts";
import {
  flattenSearchSettings,
  referenceDeadlineMs,
  type SearchSettings,
} from "./search-settings.ts";
import type { StructuredReference } from "./structuring.ts";
import type {
  Evidence,
  ScoringRules,
  VerdictResult,
  WebObservation,
} from "./verification.ts";
export const isWebReference = (type?: string) =>
  ["webpage", "post-weblog", "post"].includes(type ?? "");

export interface WebSources {
  enabled: { url: boolean; internetarchive: boolean };
  archive(
    url: string,
    deadline: number,
  ): Promise<{ observation?: WebObservation; evidence: Evidence[] }>;
  page(
    url: string,
    deadline: number,
    source?: "url" | "internetarchive",
  ): Promise<{
    observation?: WebObservation;
    evidence: Evidence[];
    reason?: string;
  }>;
}
export function createWebVerification(ports: {
  sources: WebSources;
  now(): number;
  settings: SearchSettings;
  settingsVersion: string;
  rules: ScoringRules;
  parameters: ComparisonProfile;
}) {
  return async (
    reference: StructuredReference,
    execution?: { startedAt: number },
    prior?: VerdictResult,
  ): Promise<VerdictResult> => {
    const result: VerdictResult = {
      kind: "verdict",
      verdict: "not-verifiable",
      reference,
      scoringRules: {
        ...ports.rules,
        version: `${ports.rules.version}-web-verdict-80-1`,
      },
      searchStrategyVersion: `web-search-80-1-${Number(ports.sources.enabled.url)}-${Number(ports.sources.enabled.internetarchive)}-settings-${ports.settingsVersion}-uncalibrated`,
      searchConfiguration: {
        ...flattenSearchSettings(ports.settings),
        ...comparisonLimits,
        route: "web",
        maxRedirects: 5,
        maxResponseBytes: 5242880,
        htmlHeadCodeUnits: 65536,
        titleCodeUnits: 4096,
        encoding: "http-charset,meta-first-1024-bytes,utf8-fatal",
        destinationPolicy:
          "all-dns-answers-public-unicast;pinned-new-socket;no-credentials-1",
        soft404Policy:
          "known-error-or-bot-challenge-marker-in-first-65536-code-units-1",
        archivePolicy:
          "availability-plus-capture;same-original-url-and-timestamp;title-required-1",
        referenceDeadlineMs,
        identityEvidence:
          "same-or-redirected-url-and-title;no-status-only-identity",
      },
      identity: { kind: "unresolved" },
      bestMatchId: null,
      candidates: [],
      evidence: [],
      reasons: ["url-verification-incomplete"],
      failedSources: [],
      retraction: "unknown",
    };
    const deadline =
      (execution?.startedAt ?? ports.now()) + referenceDeadlineMs;
    if (!reference.csl.URL) return finish();
    if (!ports.sources.enabled.url) {
      result.evidence.push({
        source: "url",
        operation: "url",
        outcome: "disabled",
        reason: "operator-disabled",
        attempts: 0,
        durationMs: 0,
        observedAt: new Date(ports.now()).toISOString(),
      });
      result.evidence.push({
        source: "internetarchive",
        operation: "archive",
        outcome: ports.sources.enabled.internetarchive
          ? "unsupported"
          : "disabled",
        reason: ports.sources.enabled.internetarchive
          ? "url-verification-incomplete"
          : "operator-disabled",
        attempts: 0,
        durationMs: 0,
        observedAt: new Date(ports.now()).toISOString(),
      });
      return finish();
    }
    const live = await ports.sources.page(reference.csl.URL, deadline);
    result.evidence.push(...live.evidence);
    function identify(
      observation: WebObservation,
      source: "url" | "internetarchive",
      observedAt: string,
      dead = false,
    ) {
      if (!observation.title) return false;
      const scored = compare(
        reference,
        {
          type: reference.csl.type,
          title: observation.title,
          URL: observation.finalUrl,
        },
        ports.parameters,
      );
      if (
        (scored.fields.find((f) => f.field === "title")?.score?.value ?? -1) <
          ports.parameters.strongField ||
        ports.now() >= deadline
      )
        return false;
      const candidate = {
        id: observation.finalUrl,
        source,
        origin: source === "url" ? ("url" as const) : ("archive" as const),
        slot: 1,
        retrievedAt: observedAt,
        csl: {
          type: reference.csl.type,
          title: observation.title,
          URL: observation.finalUrl,
        },
        raw: observation,
        ...scored,
      };
      const url = candidate.fields.find((f) => f.field === "URL");
      if (url) url.agreement = !dead;
      result.candidates.push(candidate);
      result.bestMatchId = candidate.id;
      result.identity = {
        kind: source === "url" ? "web-url" : "web-archive",
        candidateId: candidate.id,
      };
      const differs =
        dead || scored.fields.some((f) => f.score && !f.score.fullAgreement);
      result.verdict = differs ? "exists-with-deviations" : "correct";
      result.reasons = dead
        ? ["web-original-unavailable"]
        : [differs ? "fields-differ" : "identified"];
      return true;
    }
    const observation = live.observation;
    const identified =
      observation?.title &&
      live.evidence.at(-1)?.outcome === "exists" &&
      identify(observation, "url", live.evidence.at(-1)!.observedAt);
    if (identified) {
      result.evidence.push({
        source: "internetarchive",
        operation: "archive",
        outcome: ports.sources.enabled.internetarchive ? "skipped" : "disabled",
        reason: ports.sources.enabled.internetarchive
          ? "early-termination"
          : "operator-disabled",
        attempts: 0,
        durationMs: 0,
        observedAt: new Date(ports.now()).toISOString(),
      });
    } else if (
      live.evidence.some((e) =>
        ["unsafe-destination", "invalid-url"].includes(e.reason ?? ""),
      ) ||
      live.reason === "invalid-url"
    ) {
      // Do not disclose refused private/internal URLs to an external service.
    } else if (ports.sources.enabled.internetarchive) {
      const archived = await ports.sources.archive(reference.csl.URL, deadline);
      result.evidence.push(...archived.evidence);
      const dead = live.evidence.at(-1)?.outcome === "nonexistent";
      // 403/429/soft-404 and safety refusals stay incomplete, even if a
      // historic page exists. They never prove that the original disappeared.
      if (dead && archived.observation)
        identify(
          archived.observation,
          "internetarchive",
          archived.evidence.at(-1)!.observedAt,
          true,
        );
      else if (
        dead &&
        archived.evidence.at(-1)?.outcome === "no-record" &&
        ports.now() < deadline
      ) {
        result.verdict = "not-found";
        result.reasons = ["search-completed"];
      }
    } else {
      result.evidence.push({
        source: "internetarchive",
        operation: "archive",
        outcome: "disabled",
        reason: "operator-disabled",
        attempts: 0,
        durationMs: 0,
        observedAt: new Date(ports.now()).toISOString(),
      });
    }
    return finish();
    function finish() {
      if (prior) {
        const identified = ["correct", "exists-with-deviations"].includes(
          result.verdict,
        );
        const dead = result.verdict === "not-found";
        const priorBest = prior.candidates.find(
          (c) => c.id === prior.bestMatchId,
        );
        if (identified || dead) {
          const urlField = priorBest?.fields.find((f) => f.field === "URL");
          if (urlField) urlField.agreement = result.identity.kind === "web-url";
          const differs =
            result.verdict === "exists-with-deviations" ||
            dead ||
            priorBest?.fields.some(
              (f) =>
                f.field !== "URL" &&
                ((f.score && !f.score.fullAgreement) || f.agreement === false),
            );
          result.verdict = differs ? "exists-with-deviations" : "correct";
          result.reasons = dead
            ? ["url-unavailable"]
            : differs
              ? [
                  ...result.reasons.filter(
                    (r) => r === "web-original-unavailable",
                  ),
                  "fields-differ",
                ]
              : ["identified"];
        }
        result.identity = prior.identity;
        result.bestMatchId = prior.bestMatchId;
        result.candidates.unshift(...prior.candidates);
        result.evidence.unshift(...prior.evidence);
        result.scoringRules.version = `${prior.scoringRules.version}-web-verdict-80-1`;
        result.searchStrategyVersion = `${prior.searchStrategyVersion}-${result.searchStrategyVersion}`;
        result.retraction = prior.retraction;
        result.retractionEvidence = prior.retractionEvidence;
      }
      result.failedSources = [
        ...new Set(
          result.evidence
            .filter(
              (e) =>
                e.outcome === "unavailable" &&
                [
                  "timeout",
                  "deadline",
                  "rate-budget",
                  "http-error",
                  "request-unavailable",
                ].includes(e.reason ?? ""),
            )
            .map((e) => e.source),
        ),
      ];
      return result;
    }
  };
}

/** Bounded linear scan; never execute HTML, inspect scripts or retain the body. */
export function webPageTitle(html: string): string | undefined {
  const head = html.slice(0, 65536),
    lower = head.toLowerCase();
  const token = /<!--|<(script|style|title)\b[^>]*>/giu;
  let match: RegExpExecArray | null;
  while ((match = token.exec(head))) {
    if (match[0] === "<!--") {
      const end = head.indexOf("-->", token.lastIndex);
      if (end < 0) return;
      token.lastIndex = end + 3;
      continue;
    }
    const tag = match[1]!.toLowerCase();
    const closeTag = new RegExp(`</${tag}` + String.raw`\s*>`, "gu");
    closeTag.lastIndex = token.lastIndex;
    const closing = closeTag.exec(lower),
      end = closing?.index ?? -1;
    if (end < 0) return;
    if (tag === "title") {
      const value = decodeHTML(head.slice(token.lastIndex, end))
        .replace(/\s+/gu, " ")
        .trim();
      return value && value.length <= 4096 ? value : undefined;
    }
    const close = head.indexOf(">", end);
    if (close < 0) return;
    token.lastIndex = close + 1;
  }
}
