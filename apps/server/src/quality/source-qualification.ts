// SPDX-License-Identifier: AGPL-3.0-or-later
// Deployment-owned, private qualification receipts. No receipt is supplied by
// an Operator command, adapter declaration or public synthetic fixture.
import { createHash } from "node:crypto";
import { ReferenceOutcome } from "@source-taster/contract-verification/v2";
import { isDeepStrictEqual } from "node:util";
import { scoringRules } from "../checks/scoring-rules.ts";
import { createDevelopmentProfile, normalizeIsbn } from "@source-taster/core";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
export const qualificationDirectory = (
  root: string,
  configurationDigest?: string,
) =>
  join(
    root,
    "qualifications",
    configurationDigest?.replace(/^sha256:/, "") ?? "unbound",
  );
const digest = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const Receipt = z.strictObject({
  format: z.literal("source-taster-source-qualification/1"),
  source: z.string(),
  codeVersion: z.string(),
  configurationDigest: digest,
  measuredConfigurationId: digest,
  reviewedBy: z.string().min(1),
  rightsRecord: digest,
  serviceUse: z.literal("approved"),
  storage: z.literal("approved"),
  expiresAt: z.iso.datetime(),
  replay: z.strictObject({
    provenance: z.literal("rights-cleared-private-recordings"),
    recordings: digest,
    report: digest,
    adapterVersion: z.string().min(1),
    cases: z.array(
      z.strictObject({
        kind: z.enum([
          "isbn",
          "bibliographic-search",
          "original-page",
          "availability",
          "capture",
          "batch",
          "search",
        ]),
        requests: z.number().int().positive(),
        matched: z.number().int().positive(),
        schemaErrors: z.number().int().nonnegative(),
        identityErrors: z.number().int().nonnegative(),
      }),
    ),
  }),
});
const required: Record<string, string[]> = {
  openlibrary: ["isbn", "bibliographic-search"],
  googlebooks: ["isbn", "bibliographic-search"],
  url: ["original-page"],
  internetarchive: ["original-page", "availability", "capture"],
  semanticscholar: ["batch", "search"],
};
/** Content-addressed protected artifacts: an unknown hash is never evidence. */
export async function qualificationArtifact(root: string, digest: string) {
  if (!/^sha256:[a-f0-9]{64}$/.test(digest))
    throw new Error("invalid-artifact-digest");
  const bytes = await readFile(
    join(root, "qualification-artifacts", digest.slice(7)),
  );
  if (`sha256:${createHash("sha256").update(bytes).digest("hex")}` !== digest)
    throw new Error("artifact-digest-mismatch");
  return bytes;
}
const ReplayReport = z.strictObject({
  format: z.literal("source-taster-source-replay/1"),
  source: z.string(),
  codeVersion: z.string(),
  configurationDigest: digest,
  measuredConfigurationId: digest,
  recordings: digest,
  cases: z
    .array(
      z.strictObject({
        kind: Receipt.shape.replay.shape.cases.element.shape.kind,
        expected: z.strictObject({
          identifier: z.string().min(1),
          title: z.string().min(1),
          timestamp: z.string().optional(),
        }),
        outcome: ReferenceOutcome,
      }),
    )
    .min(1),
});
const ApprovedRecordings = z.strictObject({
  format: z.literal("source-taster-approved-recordings/1"),
  provenance: z.literal("recorded"),
  source: z.string(),
  rightsRecord: digest,
  acquiredAt: z.iso.datetime(),
  adapterVersion: z.string().min(1),
  entries: z
    .array(
      z.strictObject({
        kind: Receipt.shape.replay.shape.cases.element.shape.kind,
        request: z.string().min(1),
        response: z.unknown(),
      }),
    )
    .min(1),
});
async function replayMatches(
  root: string,
  receipt: z.infer<typeof Receipt>,
  parameters?: Record<string, number>,
) {
  // Approval and recording bytes must still exist and retain their approved hash.
  await qualificationArtifact(root, receipt.rightsRecord);
  const recordings = ApprovedRecordings.parse(
    JSON.parse(
      (await qualificationArtifact(root, receipt.replay.recordings)).toString(),
    ),
  );
  if (
    recordings.source !== receipt.source ||
    recordings.rightsRecord !== receipt.rightsRecord ||
    recordings.adapterVersion !== receipt.replay.adapterVersion ||
    (required[receipt.source] ?? []).some(
      (kind) => !recordings.entries.some((entry) => entry.kind === kind),
    )
  )
    return false;
  const report = ReplayReport.parse(
    JSON.parse(
      (await qualificationArtifact(root, receipt.replay.report)).toString(),
    ),
  );
  if (
    report.source !== receipt.source ||
    report.codeVersion !== receipt.codeVersion ||
    report.configurationDigest !== receipt.configurationDigest ||
    report.measuredConfigurationId !== receipt.measuredConfigurationId ||
    report.recordings !== receipt.replay.recordings
  )
    return false;
  for (const kind of required[receipt.source] ?? []) {
    const cases = report.cases.filter((c) => c.kind === kind);
    const declared = receipt.replay.cases.find((c) => c.kind === kind);
    if (
      !cases.length ||
      !declared ||
      declared.requests !== cases.length ||
      declared.matched !== cases.length
    )
      return false;
    for (const item of cases) {
      const outcome = item.outcome;
      if (
        outcome.kind !== "verdict" ||
        !["correct", "exists-with-deviations"].includes(outcome.verdict) ||
        outcome.failedSources.length
      )
        return false;
      const rules = scoringRules(createDevelopmentProfile(parameters ?? {}));
      if (
        !isDeepStrictEqual(outcome.scoringRules.profile, rules.profile) ||
        (outcome.scoringRules.version !== rules.version &&
          !outcome.scoringRules.version.startsWith(`${rules.version}-`)) ||
        outcome.scoringRules.unicode !== rules.unicode ||
        outcome.scoringRules.icu !== rules.icu
      )
        return false;
      if (["original-page", "availability", "capture"].includes(kind)) {
        const source = kind === "original-page" ? "url" : "internetarchive";
        if (
          !outcome.evidence.some(
            (e) =>
              e.source === source &&
              e.outcome === "exists" &&
              e.web?.originalUrl === item.expected.identifier &&
              e.web.title === item.expected.title &&
              (kind !== "capture" ||
                (!!item.expected.timestamp &&
                  e.web.timestamp === item.expected.timestamp)),
          )
        )
          return false;
      } else {
        const best = outcome.candidates.find(
          (c) => c.id === outcome.bestMatchId,
        );
        if (
          !best ||
          best.source !== receipt.source ||
          best.csl.title !== item.expected.title
        )
          return false;
        if (
          kind === "isbn" ||
          receipt.source === "openlibrary" ||
          receipt.source === "googlebooks"
        ) {
          const wanted = normalizeIsbn(item.expected.identifier);
          if (
            !wanted ||
            (normalizeIsbn(best.csl.ISBN ?? "") !== wanted &&
              !best.identifiers?.includes(`isbn:${wanted}`))
          )
            return false;
        } else if (!best.identifiers?.includes(item.expected.identifier))
          return false;
      }
    }
  }
  return true;
}
export async function sourceQualification(input: {
  root?: string;
  sources: string[];
  configurationId?: string;
  comparisonParameters?: Record<string, number>;
  codeVersion: string;
  configurationDigest?: string;
  now?: number;
}) {
  const reasons: string[] = [];
  for (const source of input.sources) {
    if (!required[source]) continue;
    let value: unknown;
    try {
      value = JSON.parse(
        await readFile(
          join(
            qualificationDirectory(input.root ?? "", input.configurationDigest),
            `${source}.json`,
          ),
          "utf8",
        ),
      );
    } catch {
      reasons.push(`source-qualification-missing:${source}`);
      continue;
    }
    const parsed = Receipt.safeParse(value);
    if (!parsed.success) {
      reasons.push(`source-qualification-invalid:${source}`);
      continue;
    }
    const receipt = parsed.data;
    let replayValid = false;
    try {
      if (input.root)
        replayValid = await replayMatches(
          input.root,
          receipt,
          input.comparisonParameters,
        );
    } catch {
      /* Missing, synthetic, malformed or mismatched evidence refuses. */
    }
    if (
      !replayValid ||
      !input.root ||
      !input.configurationDigest ||
      !input.configurationId ||
      receipt.measuredConfigurationId !== input.configurationId ||
      receipt.source !== source ||
      receipt.codeVersion !== input.codeVersion ||
      receipt.configurationDigest !== input.configurationDigest ||
      Date.parse(receipt.expiresAt) <= (input.now ?? Date.now()) ||
      required[source].some((kind) => {
        const cases = receipt.replay.cases.filter((c) => c.kind === kind);
        return (
          cases.length !== 1 ||
          cases[0]!.requests !== cases[0]!.matched ||
          cases[0]!.schemaErrors !== 0 ||
          cases[0]!.identityErrors !== 0
        );
      })
    )
      reasons.push(`source-qualification-invalid:${source}`);
  }
  return reasons;
}

const ProviderApproval = z.strictObject({
  format: z.literal("source-taster-provider-approval/1"),
  configurationDigest: digest,
  measuredConfigurationId: digest,
  aiConfigurationDigest: digest,
  codeVersion: z.string(),
  reviewedBy: z.string().min(1),
  contractRecord: digest,
  processingAndStorage: z.literal("EU-only"),
  retention: z.literal("zero"),
  expiresAt: z.iso.datetime(),
});
export async function providerQualification(input: {
  root?: string;
  configurationDigest?: string;
  configurationId?: string;
  aiModel: string | null;
  aiConfiguration: unknown;
  codeVersion: string;
  now?: number;
}) {
  if (!input.aiModel) return [];
  let value: unknown;
  try {
    value = JSON.parse(
      await readFile(
        join(
          qualificationDirectory(input.root ?? "", input.configurationDigest),
          "provider-approval.json",
        ),
        "utf8",
      ),
    );
  } catch {
    return ["provider-approval-missing"];
  }
  const parsed = ProviderApproval.safeParse(value);
  if (!parsed.success || !input.root || !input.configurationDigest)
    return ["provider-approval-invalid"];
  const approval = parsed.data;
  try {
    await qualificationArtifact(input.root, approval.contractRecord);
  } catch {
    return ["provider-approval-invalid"];
  }
  const aiDigest = `sha256:${createHash("sha256").update(JSON.stringify(input.aiConfiguration)).digest("hex")}`;
  return !input.configurationId ||
    approval.measuredConfigurationId !== input.configurationId ||
    approval.configurationDigest !== input.configurationDigest ||
    approval.aiConfigurationDigest !== aiDigest ||
    approval.codeVersion !== input.codeVersion ||
    Date.parse(approval.expiresAt) <= (input.now ?? Date.now())
    ? ["provider-approval-invalid"]
    : [];
}
