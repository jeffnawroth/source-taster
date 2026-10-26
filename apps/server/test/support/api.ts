// SPDX-License-Identifier: AGPL-3.0-or-later
// Test helpers that speak only the published HTTP + SSE contract.

import {
  CheckEvent,
  CheckResponse,
  isFinalEvent,
} from "@source-taster/contract-verification";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { inject } from "vitest";

export const api = inject("apiUrl");

export const twoReferences = [
  "Doe, J. (2020). A study of things. Journal of Studies, 1(2), 3-4.",
  "Roe, R. (2021). Another study. Proceedings of Testing, 5-6.",
].join("\n");

export function postCheck(body: unknown) {
  return fetch(`${api}/v1/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function createCheck(text = twoReferences) {
  const response = await postCheck({ text });
  if (response.status !== 201)
    throw new Error(`POST /v1/checks returned ${response.status}`);
  return CheckResponse.parse(await response.json()).data;
}

export interface ReceivedEvent {
  /** The SSE `id:` field of the frame. */
  id: string | undefined;
  /** The SSE `event:` field of the frame. */
  type: string | undefined;
  event: CheckEvent;
}

/**
 * Opens the event stream and collects frames until the server closes it,
 * or until `stopAfter` frames have arrived (then disconnects).
 */
export async function readEvents(
  checkId: string,
  options: { lastEventId?: string; stopAfter?: number } = {},
): Promise<{ events: ReceivedEvent[]; closedByServer: boolean }> {
  const controller = new AbortController();
  const headers: Record<string, string> = { accept: "text/event-stream" };
  if (options.lastEventId !== undefined)
    headers["last-event-id"] = options.lastEventId;
  const response = await fetch(`${api}/v1/checks/${checkId}/events`, {
    headers,
    signal: controller.signal,
  });
  if (response.status !== 200 || !response.body)
    throw new Error(`event stream returned ${response.status}`);
  if (!response.headers.get("content-type")?.startsWith("text/event-stream"))
    throw new Error("event stream has the wrong content type");

  const events: ReceivedEvent[] = [];
  for await (const frame of readSseFrames(response.body)) {
    events.push({
      id: frame.id,
      type: frame.event,
      event: CheckEvent.parse(JSON.parse(frame.data)),
    });
    if (events.length === options.stopAfter) {
      controller.abort();
      return { events, closedByServer: false };
    }
  }
  return { events, closedByServer: true };
}

export { isFinalEvent };
