// SPDX-License-Identifier: AGPL-3.0-or-later
// Trusted side of ADR-0015: local Docker provides the OS boundary, never a
// same-privilege Node child. No host mount, network, credentials or writable
// filesystem reaches the parser. An absent boundary fails closed.
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  ExtractionFailed,
  defaultExtractionLimits,
  type DocumentExtractor,
  type ExtractionLimits,
} from "./extraction.ts";

const answer = z.discriminatedUnion("ok", [
  z.strictObject({
    ok: z.literal(true),
    text: z.string(),
    partialNoText: z.boolean(),
  }),
  z.strictObject({
    ok: z.literal(false),
    failure: z.enum([
      "unsupported",
      "no-text",
      "encrypted",
      "unreadable",
      "page-limit",
      "expansion-limit",
    ]),
  }),
]);

export function isolatedExtractor(
  image: string | undefined,
  limits: ExtractionLimits = defaultExtractionLimits,
): DocumentExtractor {
  if (image && !/^sha256:[a-f0-9]{64}$/.test(image))
    throw new Error("Extraction requires an immutable local image ID");
  let active = 0;
  const lifetime = new AbortController();
  const running = new Set<Promise<unknown>>();
  async function extract(
    format: Parameters<DocumentExtractor["extract"]>[0],
    bytes: Uint8Array,
    signal: AbortSignal,
  ) {
    if (!image || active >= limits.concurrency)
      throw new ExtractionFailed("unavailable");
    if (signal?.aborted) throw new ExtractionFailed("aborted");
    if (bytes.byteLength > limits.inputBytes)
      throw new ExtractionFailed("resource-limit");
    active++;
    const name = `source-taster-extract-${randomUUID()}`;
    const started = Date.now();
    // The Docker CLI's host configuration belongs to the trusted supervisor.
    // No inherited application env is copied into the container.
    const env = { PATH: process.env.PATH, HOME: process.env.HOME };
    let failure: "time-limit" | "resource-limit" | "aborted" | undefined;
    let size = 0;
    const chunks: Buffer[] = [];
    try {
      await promisify(execFile)(
        "docker",
        [
          "create",
          "--pull=never",
          "--name",
          name,
          "--interactive",
          "--network=none",
          "--read-only",
          "--cap-drop=ALL",
          "--security-opt=no-new-privileges",
          "--user=65534:65534",
          "--ipc=none",
          "--pids-limit=32",
          "--cpus=1",
          `--memory=${limits.memoryBytes}`,
          `--memory-swap=${limits.memoryBytes}`,
          `--ulimit=cpu=${limits.cpuSeconds}`,
          "--ulimit=nofile=64:64",
          "--ulimit=core=0:0",
          "--log-driver=none",
          image,
          format,
          JSON.stringify({
            inputBytes: limits.inputBytes,
            pages: limits.pages,
            expandedBytes: limits.expandedBytes,
          }),
        ],
        { env, timeout: 10_000, maxBuffer: 4096 },
      );
    } catch {
      active--;
      throw new ExtractionFailed("unavailable");
    }
    const child = spawn(
      "docker",
      ["start", "--attach", "--interactive", name],
      { env, stdio: ["pipe", "pipe", "ignore"] },
    );
    let cleanup: Promise<boolean> | undefined;
    function remove() {
      return (cleanup ??= new Promise<boolean>((resolve) => {
        const remover = spawn("docker", ["rm", "--force", name], {
          env,
          stdio: "ignore",
        });
        const timeout = setTimeout(() => {
          remover.kill("SIGKILL");
          resolve(false);
        }, 5000);
        remover.on("error", () => {
          clearTimeout(timeout);
          resolve(false);
        });
        remover.on("close", (code) => {
          clearTimeout(timeout);
          resolve(code === 0);
        });
      }));
    }
    function stop(reason: typeof failure) {
      failure ??= reason;
      // Kill the container (including descendants), not just its CLI connection.
      void remove().finally(() => child.kill("SIGKILL"));
    }
    const abort = () => stop("aborted");
    signal?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(
      () => stop("time-limit"),
      Math.max(1, limits.timeoutMs - (Date.now() - started)),
    );
    // Abort may have happened while Docker created the (not yet running) task.
    if (signal.aborted) abort();
    child.stdout.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limits.outputBytes) stop("resource-limit");
      else if (!failure) chunks.push(chunk);
    });
    child.stdin.on("error", () => {
      /* EPIPE after rejection/termination has no diagnostics. */
    });
    child.stdin.end(bytes);
    try {
      const code = await new Promise<number | null>((resolve, reject) => {
        child.once("error", reject);
        child.once("close", resolve);
      });
      if (!(await remove())) throw new ExtractionFailed("unavailable");
      if (failure) throw new ExtractionFailed(failure);
      if (code !== 0)
        throw new ExtractionFailed(
          code === 137 || code === 152 ? "resource-limit" : "unavailable",
        );
      let parsed: z.infer<typeof answer>;
      try {
        parsed = answer.parse(
          JSON.parse(Buffer.concat(chunks).toString("utf8")),
        );
      } catch {
        throw new ExtractionFailed("resource-limit");
      }
      if (!parsed.ok) throw new ExtractionFailed(parsed.failure);
      if (!parsed.text.trim()) throw new ExtractionFailed("unreadable");
      return {
        format,
        text: parsed.text,
        partialNoText: parsed.partialNoText,
      };
    } catch (error) {
      if (error instanceof ExtractionFailed) throw error;
      throw new ExtractionFailed("unavailable");
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      await remove();
      // Failed removals quarantine capacity until
      // restart; never admit more work while a container may remain alive.
      if (!cleanup || (await cleanup)) active--;
    }
  }
  return {
    extract(format, bytes, signal) {
      const task = extract(
        format,
        bytes,
        AbortSignal.any([lifetime.signal, ...(signal ? [signal] : [])]),
      );
      running.add(task);
      void task.then(
        () => running.delete(task),
        () => running.delete(task),
      );
      return task;
    },
    async close() {
      lifetime.abort();
      await Promise.allSettled([...running]);
    },
  };
}
