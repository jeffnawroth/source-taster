// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  CheckResponse,
  type Check,
} from "@source-taster/contract-verification/v2";
import { TextStructuringResponse } from "@source-taster/contract-verification/document";
import type { AiStructuringResult } from "@source-taster/contract-verification/ai";
import type { NativeChromium, Panel } from "../../e2e/support/chromium.ts";

/** Observe actual successful API response bodies on the panel's CDP session.
 * No Fetch.fulfillRequest, route mocks or replacement product state. */
export function captureResponses(native: NativeChromium, panel: Panel) {
  let check: Check | undefined;
  let structuring: AiStructuringResult | undefined;
  const pending = new Set<Promise<void>>();
  const bodies = new Map<string, string>();
  const failures: string[] = [];
  const observed: { url: string; status: number }[] = [];
  const listener = (event: { sessionId: string; message: string }) => {
    if (event.sessionId !== panel.sessionId) return;
    const message = JSON.parse(event.message) as {
      method?: string;
      params?: {
        requestId: string;
        response?: { url: string; status: number };
      };
    };
    const response = message.params?.response;
    if (message.method === "Network.responseReceived" && response) {
      const path = new URL(response.url).pathname;
      if (/^\/v2\/(?:checks(?:\/[a-f0-9-]+)?|structurings)$/.test(path)) {
        observed.push(response);
        if (response.status >= 200 && response.status < 300)
          bodies.set(message.params!.requestId, path);
      }
    }
    if (message.method !== "Network.loadingFinished" || !message.params) return;
    const requestId = message.params.requestId;
    const path = bodies.get(requestId);
    if (!path) return;
    bodies.delete(requestId);
    const task = (async () => {
      const body = await panel.send<{ body: string; base64Encoded: boolean }>(
        "Network.getResponseBody",
        { requestId },
      );
      const json: unknown = JSON.parse(
        body.base64Encoded
          ? Buffer.from(body.body, "base64").toString("utf8")
          : body.body,
      );
      if (path === "/v2/structurings")
        structuring = TextStructuringResponse.parse(json).data.structuring;
      else check = CheckResponse.parse(json).data;
    })().catch((error: unknown) => {
      failures.push(`Actual API fixture capture ${path}: ${String(error)}`);
    });
    pending.add(task);
    void task.then(() => pending.delete(task));
  };
  native.browser.on("Target.receivedMessageFromTarget", listener);
  return {
    check: () => check,
    structuring: () => structuring,
    failures,
    observed,
    flush: () => Promise.all([...pending]),
    close: () =>
      native.browser.off("Target.receivedMessageFromTarget", listener),
  };
}
