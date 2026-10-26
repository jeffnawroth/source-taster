// SPDX-License-Identifier: AGPL-3.0-or-later
export type Language = "de" | "en";
export const languages: Language[] = ["de", "en"];
export const legalIds = ["legal-notice", "terms", "privacy", "withdrawal"];
export interface Review {
  reviewer: string;
  date: string;
  evidence: string;
  sha256: string;
}
export type WebsiteMode = "preview" | "publication";
export function assertPreviewAllowed(
  mode: WebsiteMode,
  nodeEnv = process.env.NODE_ENV,
) {
  if (mode === "preview" && nodeEnv === "production")
    throw new Error("Draft preview is local-only");
}
