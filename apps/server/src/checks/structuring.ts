// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Placeholder Structuring: one Reference per non-empty line. The rule-based
 * parser (ADR-0011) replaces this.
 */
export function splitReferences(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
