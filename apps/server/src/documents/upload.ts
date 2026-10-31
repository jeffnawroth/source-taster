// SPDX-License-Identifier: AGPL-3.0-or-later
// Always count bytes on the wire, including chunked requests; Content-Length
// is only an early rejection. Keep the multipart envelope bounded separately.
import { fail } from "../http/problems.ts";
export async function readUpload(
  request: Request,
  inputBytes: number,
): Promise<FormData> {
  const maximum = inputBytes + 65_536;
  if (
    !request.headers.get("content-type")?.startsWith("multipart/form-data;") ||
    !request.body
  )
    fail("invalid-request");
  if (Number(request.headers.get("content-length")) > maximum) {
    await request.body.cancel();
    fail("document-size-limit", undefined, inputBytes);
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        fail("document-size-limit", undefined, inputBytes);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
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
