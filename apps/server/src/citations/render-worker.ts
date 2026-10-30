// SPDX-License-Identifier: AGPL-3.0-or-later
import { parentPort } from "node:worker_threads";
import type { Check } from "@source-taster/contract-verification/v2";
import type { BibliographyRequest } from "@source-taster/contract-verification/bibliography";
import { renderCheckBibliography } from "./bibliography.ts";
parentPort!.on(
  "message",
  ({
    check,
    request,
    resultIds,
  }: {
    check: Check;
    request: BibliographyRequest;
    resultIds: Record<number, string>;
  }) => {
    try {
      parentPort!.postMessage({
        ok: true,
        data: renderCheckBibliography(check, request, resultIds),
      });
    } catch {
      parentPort!.postMessage({ ok: false });
    }
  },
);
