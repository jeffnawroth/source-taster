// SPDX-License-Identifier: AGPL-3.0-or-later
// The standalone intake shows how many References the deterministic parser
// recognises before anything is sent (#194 D, counted). Only the parser subpath
// is imported: the core index pulls in the journal-abbreviation data.
import {
  createParser,
  ReferenceLimitExceeded,
} from "@source-taster/core/structuring";

const parser = createParser();

/** References the parser recognises in `text`, or null when there is nothing to show. */
export function recognizedCount(text: string): number | null {
  if (!text.trim()) return null;
  try {
    return parser.structure(text).references.length;
  } catch (error) {
    // Over the limit the Check states its own reason; no count is shown.
    if (error instanceof ReferenceLimitExceeded) return null;
    throw error;
  }
}
