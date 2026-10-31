// SPDX-License-Identifier: AGPL-3.0-or-later
// Always count bytes on the wire, including chunked requests; Content-Length
// is only an early rejection. Keep the multipart envelope bounded separately.
import type { IncomingMessage } from "node:http";
import { fail } from "../http/problems.ts";
export async function readUpload(
  request: Request,
  inputBytes: number,
  incoming?: IncomingMessage,
): Promise<FormData> {
  const maximum = inputBytes + 65_536;
  if (
    !request.headers.get("content-type")?.startsWith("multipart/form-data;") ||
    (!incoming && !request.body)
  )
    fail("invalid-request");
  if (Number(request.headers.get("content-length")) > maximum) {
    fail("document-size-limit", undefined, inputBytes);
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  function append(value: Uint8Array) {
    size += value.byteLength;
    if (size > maximum) fail("document-size-limit", undefined, inputBytes);
    chunks.push(value);
  }
  if (incoming) {
    // Do not create a Readable.toWeb reader for an aborted upload: its paused
    // inner reader would interfere with the HTTP adapter's bounded drain and
    // close a connection already reused by the client. Release the native
    // iterator without destroying the socket; the adapter owns wire cleanup.
    for await (const chunk of incoming.iterator({ destroyOnReturn: false }))
      append(chunk as Buffer);
  } else {
    const reader = request.body!.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        append(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  let form: FormData;
  try {
    form = await new Response(
      new Blob(chunks.map((chunk) => new Uint8Array(chunk))),
      { headers: { "content-type": request.headers.get("content-type")! } },
    ).formData();
  } catch {
    fail("invalid-request");
  }
  const entries = [...form.entries()];
  if (
    entries.length !== 1 ||
    entries[0]?.[0] !== "file" ||
    !(entries[0][1] instanceof File)
  )
    fail("invalid-request");
  return form;
}
