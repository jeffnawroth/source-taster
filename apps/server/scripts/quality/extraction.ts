// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0010 identity and qualification declaration supplied by the Operator's
// adapter. This validates the declaration, never supplies legal evidence.
import { z } from "zod";

const euCountries = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
] as const;
export const AiConfiguration = z.strictObject({
  mode: z.enum(["live", "synthetic"]),
  providerPath: z.string().min(1),
  /** Dated/pinned model ID; the Operator must not use a moving alias. */
  modelId: z.string().min(1),
  region: z.string().min(1),
  promptVersion: z.string().min(1),
  schemaVersion: z.string().min(1),
  sampling: z.record(z.string(), z.unknown()),
  determinism: z.string().min(1),
  chunkSize: z.number().int().positive(),
  /** Both processing and storage, EU member states only (no EFTA). */
  processingAndStorageCountries: z.array(z.enum(euCountries)).nonempty(),
  zeroRetention: z.literal(true),
  /** Reference to the privately retained provider/contract approval. */
  qualificationRecord: z.string().min(1),
});
export type AiConfiguration = z.infer<typeof AiConfiguration>;

export function qualifiedAi(model: string | null, configuration: unknown) {
  if (!model) return true;
  const parsed = AiConfiguration.safeParse(configuration);
  return (
    parsed.success &&
    parsed.data.mode === "live" &&
    parsed.data.modelId === model
  );
}
