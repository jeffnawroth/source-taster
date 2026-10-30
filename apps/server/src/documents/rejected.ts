// SPDX-License-Identifier: AGPL-3.0-or-later
/** A document-caused failure reported from inside the restricted area. */
export class Rejected extends Error {
  constructor(
    readonly failure:
      | "unsupported"
      | "no-text"
      | "encrypted"
      | "unreadable"
      | "page-limit"
      | "expansion-limit",
  ) {
    super(failure);
  }
}
