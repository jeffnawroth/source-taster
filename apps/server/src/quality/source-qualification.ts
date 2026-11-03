// SPDX-License-Identifier: AGPL-3.0-or-later
// Deployment-owned, private qualification receipts. No receipt is supplied by
// an Operator command, adapter declaration or public synthetic fixture.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
const digest = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const Receipt = z.strictObject({
  format: z.literal("source-taster-source-qualification/1"),
  source: z.string(),
  codeVersion: z.string(),
  configurationDigest: digest,
  reviewedBy: z.string().min(1),
  rightsRecord: digest,
  serviceUse: z.literal("approved"),
  storage: z.literal("approved"),
  expiresAt: z.iso.datetime(),
  replay: z.strictObject({
    provenance: z.literal("rights-cleared-private-recordings"),
    recordings: digest,
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
export async function sourceQualification(input: {
  root?: string;
  sources: string[];
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
          join(input.root ?? "", "source-qualifications", `${source}.json`),
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
    if (
      !input.root ||
      !input.configurationDigest ||
      receipt.source !== source ||
      receipt.codeVersion !== input.codeVersion ||
      receipt.configurationDigest !== input.configurationDigest ||
      Date.parse(receipt.expiresAt) <= (input.now ?? Date.now()) ||
      required[source]!.some((kind) => {
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
