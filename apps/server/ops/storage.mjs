import { stat } from "node:fs/promises";
// SPDX-License-Identifier: AGPL-3.0-or-later
// Owned Scaleway S3 adapter. Native SigV4; no SDK/dependency exception.
import { createHash, createHmac } from "node:crypto";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
export const digest = (data) => createHash("sha256").update(data).digest("hex");
export async function fileHash(file) {
  const h = createHash("sha256");
  for await (const b of createReadStream(file)) h.update(b);
  return h.digest("hex");
}
export function storage(config) {
  const endpoint = new URL(config.endpoint);
  const local =
    process.env.NODE_ENV !== "production" &&
    process.env.OPS_LOOPBACK_FIXTURES === "1" &&
    endpoint.hostname === "127.0.0.1" &&
    endpoint.protocol === "http:";
  if (
    (!local && endpoint.origin !== "https://s3.fr-par.scw.cloud") ||
    endpoint.pathname !== "/" ||
    endpoint.search ||
    endpoint.username ||
    endpoint.password ||
    endpoint.hash ||
    !/^[a-z0-9][a-z0-9-]{2,62}$/.test(config.bucket)
  )
    throw Error("storage-config");
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY)
    throw Error("storage-credentials");
  async function request(
    method,
    key = "",
    { query = {}, headers = {}, file, body } = {},
  ) {
    const url = new URL(`/${config.bucket}/${key}`, endpoint);
    for (const [k, v] of Object.entries(query).sort())
      url.searchParams.set(k, v);
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const day = timestamp.slice(0, 8),
      scope = `${day}/fr-par/s3/aws4_request`;
    const payload = file ? await fileHash(file) : digest(body ?? "");
    if (file) {
      const md5 = createHash("md5");
      for await (const chunk of createReadStream(file)) md5.update(chunk);
      headers = {
        ...headers,
        "content-length": String((await stat(file)).size),
        "content-md5": md5.digest("base64"),
      };
    }
    const all = {
      ...headers,
      host: url.host,
      "x-amz-date": timestamp,
      "x-amz-content-sha256": payload,
    };
    const names = Object.keys(all).sort();
    const canonical = [
      method,
      url.pathname,
      url.searchParams.toString().replaceAll("+", "%20"),
      names.map((k) => `${k}:${all[k].trim()}\n`).join(""),
      names.join(";"),
      payload,
    ].join("\n");
    const hmac = (key, value) =>
      createHmac("sha256", key).update(value).digest();
    let signing = Buffer.from(`AWS4${process.env.AWS_SECRET_ACCESS_KEY}`);
    for (const part of [day, "fr-par", "s3", "aws4_request"])
      signing = hmac(signing, part);
    all.authorization = `AWS4-HMAC-SHA256 Credential=${process.env.AWS_ACCESS_KEY_ID}/${scope}, SignedHeaders=${names.join(";")}, Signature=${hmac(signing, `AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${digest(canonical)}`).toString("hex")}`;
    const result = await fetch(url, {
      method,
      headers: all,
      body: file ? createReadStream(file) : body,
      duplex: "half",
      redirect: "error",
      signal: AbortSignal.timeout(120000),
    });
    if (!result.ok) {
      await result.body?.cancel();
      throw Error("storage-request");
    }
    return result;
  }
  return {
    async qualify() {
      const lock = await (
        await request("GET", "", { query: { "object-lock": "" } })
      ).text();
      const lifecycle = await (
        await request("GET", "", { query: { lifecycle: "" } })
      ).text();
      const versioning = await (
        await request("GET", "", { query: { versioning: "" } })
      ).text();
      // Fail closed: lifecycle/retention policy must be independently qualified by Q06/Q09.
      if (
        !lock.includes("<ObjectLockEnabled>Enabled</ObjectLockEnabled>") ||
        !versioning.includes("<Status>Enabled</Status>") ||
        !lifecycle.includes("<Status>Enabled</Status>") ||
        !/<Expiration>\s*<Days>13<\/Days>\s*<\/Expiration>/.test(lifecycle) ||
        !/<NoncurrentVersionExpiration>\s*<NoncurrentDays>1<\/NoncurrentDays>\s*<\/NoncurrentVersionExpiration>/.test(
          lifecycle,
        )
      )
        throw Error("storage-lock-policy");
    },
    async put(key, file, until) {
      const r = await request("PUT", key, {
        file,
        headers: {
          "x-amz-object-lock-mode": "COMPLIANCE",
          "x-amz-object-lock-retain-until-date": until,
          "content-type": "application/octet-stream",
        },
      });
      await r.body?.cancel();
      const version = r.headers.get("x-amz-version-id");
      if (!version || version === "null") throw Error("storage-version");
      return version;
    },
    async verify(key, version, until, expected) {
      const r = await request("HEAD", key, { query: { versionId: version } });
      if (
        r.headers.get("x-amz-object-lock-mode") !== "COMPLIANCE" ||
        r.headers.get("x-amz-object-lock-retain-until-date") !== until ||
        r.headers.get("x-amz-version-id") !== version
      )
        throw Error("storage-retention");
      const h = createHash("sha256");
      let size = 0;
      const data = await request("GET", key, { query: { versionId: version } });
      await pipeline(
        data.body,
        new Writable({
          write(b, _, cb) {
            size += b.length;
            if (size > 1024 ** 3 + 65536) return cb(Error("backup-limit"));
            h.update(b);
            cb();
          },
        }),
      );
      if (h.digest("hex") !== expected) throw Error("storage-integrity");
    },
    async download(key, version, target, maximumBytes = 1024 ** 3 + 65536) {
      const { createWriteStream } = await import("node:fs");
      const { Transform } = await import("node:stream");
      let bytes = 0;
      const response = await request("GET", key, {
        query: { versionId: version },
      });
      await pipeline(
        response.body,
        new Transform({
          transform(b, _, cb) {
            bytes += b.length;
            cb(bytes > maximumBytes ? Error("backup-limit") : null, b);
          },
        }),
        createWriteStream(target, { mode: 0o600, flags: "wx" }),
      );
    },
  };
}
