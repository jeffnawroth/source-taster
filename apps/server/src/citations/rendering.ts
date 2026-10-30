// SPDX-License-Identifier: AGPL-3.0-or-later
// One reusable worker per web process. Bounded queue and deadline; no Check cache.
import { Worker } from "node:worker_threads";
import type { Check } from "@source-taster/contract-verification/v2";
import type {
  Bibliography,
  BibliographyRequest,
} from "@source-taster/contract-verification/bibliography";
export class FormattingUnavailable extends Error {}
type Job = {
  check: Check;
  request: BibliographyRequest;
  resolve(data: Bibliography): void;
  reject(error: Error): void;
};
const queue: Job[] = [];
let worker: Worker | null = null;
let active: Job | null = null;
let deadline: ReturnType<typeof setTimeout> | undefined;
function complete(data?: Bibliography) {
  clearTimeout(deadline);
  const job = active;
  active = null;
  if (data) job?.resolve(data);
  else job?.reject(new FormattingUnavailable());
  dispatch();
}
function discard(instance: Worker) {
  if (worker !== instance) return;
  worker = null;
  void instance.terminate();
  complete();
}
function dispatch() {
  if (active || !queue.length) return;
  if (!worker) {
    const file = import.meta.url.endsWith(".ts")
      ? "./render-worker.ts"
      : "./render-worker.js";
    const instance = new Worker(new URL(file, import.meta.url));
    worker = instance;
    instance.on("message", (result: { ok: boolean; data?: Bibliography }) => {
      if (worker === instance) complete(result.ok ? result.data : undefined);
    });
    instance.on("error", () => discard(instance));
    instance.on("exit", () => discard(instance));
    instance.unref();
  }
  active = queue.shift()!;
  const instance = worker;
  deadline = setTimeout(() => discard(instance), 30_000);
  deadline.unref();
  try {
    instance.postMessage({ check: active.check, request: active.request });
  } catch {
    discard(instance);
  }
}
export function renderBibliographySnapshot(
  check: Check,
  request: BibliographyRequest,
): Promise<Bibliography> {
  if (queue.length >= 8) return Promise.reject(new FormattingUnavailable());
  return new Promise((resolve, reject) => {
    queue.push({ check, request, resolve, reject });
    dispatch();
  });
}
