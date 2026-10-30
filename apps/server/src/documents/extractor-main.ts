// SPDX-License-Identifier: AGPL-3.0-or-later
// Entry point inside the restricted execution area (ADR-0015). It receives
// only the bounded document on stdin and non-secret limits as arguments, and
// answers with one JSON line on stdout. It owns no credentials, no database
// and no network; the trusted supervisor validates everything it returns.
import { extractDocx } from "./docx.ts";
import { extractPdf } from "./pdf.ts";
import { Rejected } from "./rejected.ts";

const [format, rawLimits] = process.argv.slice(2);
const limits = JSON.parse(rawLimits ?? "{}") as {
  pages: number;
  expandedBytes: number;
};
const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
const bytes = new Uint8Array(Buffer.concat(chunks));
let answer: unknown;
try {
  const result =
    format === "pdf"
      ? await extractPdf(bytes, limits.pages)
      : format === "docx"
        ? await extractDocx(bytes, limits.expandedBytes)
        : Promise.reject(new Rejected("unsupported"));
  answer = { ok: true, ...(await result) };
} catch (error) {
  answer = {
    ok: false,
    failure: error instanceof Rejected ? error.failure : "unreadable",
  };
}
process.stdout.write(JSON.stringify(answer) + "\n", () => process.exit(0));
