// SPDX-License-Identifier: AGPL-3.0-or-later
/** A document-caused failure reported from inside the restricted area. */
export class Rejected extends Error {
  readonly failure:
    | "unsupported"
    | "no-text"
    | "encrypted"
    | "unreadable"
    | "page-limit"
    | "expansion-limit";
  constructor(failure: Rejected["failure"]) {
    super(failure);
    this.failure = failure;
  }
}
