// SPDX-License-Identifier: AGPL-3.0-or-later
// Untrusted HTTP: validate every destination, pin an approved DNS answer at
// connection creation, never share sockets, credentials, cookies or proxies.
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { createGunzip, createInflate, createBrotliDecompress } from "node:zlib";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
const ceiling = 5 * 1024 * 1024;
function publicAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b, c] = ip.split(".").map(Number) as [number, number, number];
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113)
    );
  }
  // Only global unicast IPv6; exclude transition, benchmarking and documentation
  // ranges as well as all mapped IPv4/private/link-local/multicast addresses.
  if (isIP(ip) !== 6) return false;
  const canonical = new URL(`http://[${ip}]`).hostname.slice(1, -1);
  const [first, second] = canonical
    .split(":")
    .map((value) => parseInt(value || "0", 16));
  return (
    first! >= 0x2000 &&
    first! <= 0x3fff &&
    !(first === 0x2001 && (second! <= 0x1ff || second === 0xdb8)) &&
    first !== 0x2002 &&
    first !== 0x3fff
  );
}
function validatedUrl(url: URL) {
  const host = url.hostname
    .replace(/^\[|\]$/gu, "")
    .toLowerCase()
    .replace(/\.$/u, "");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    !host ||
    host === "localhost" ||
    (!host.includes(".") && !isIP(host)) ||
    /\.(?:localhost|local|internal|home|lan|invalid|corp|intranet|test|example|onion|arpa)$/u.test(
      host.replace(/\.$/u, ""),
    ) ||
    (isIP(host) && !publicAddress(host))
  )
    throw new Error("unsafe-destination");
  return host;
}
/** Prepare DNS outside the dispatch authority fence; send synchronously inside it. */
export async function prepareSafeHttp(
  url: URL,
  signal: AbortSignal,
  fixtureBase?: string,
) {
  const host = validatedUrl(url);
  signal.throwIfAborted();
  let target = url;
  let address: string, family: number;
  // Explicit development-only adapter replacement, limited to these three
  // public hosts. Untrusted redirects still pass the same validation.
  if (
    fixtureBase &&
    ["example.com", "archive.org", "web.archive.org"].includes(host)
  ) {
    target = new URL(url.pathname + url.search, fixtureBase);
    address = "127.0.0.1";
    family = 4;
  } else {
    let cancelLookup: (() => void) | undefined;
    const addresses = await (async () => {
      try {
        return isIP(host)
          ? [{ address: host, family: isIP(host) }]
          : await Promise.race([
              lookup(host, { all: true, verbatim: true }),
              new Promise<never>((_, reject) => {
                cancelLookup = () =>
                  reject(
                    signal.reason instanceof Error
                      ? signal.reason
                      : new Error("Source operation aborted"),
                  );
                signal.addEventListener("abort", cancelLookup, { once: true });
              }),
            ]);
      } finally {
        if (cancelLookup) signal.removeEventListener("abort", cancelLookup);
      }
    })();
    signal.throwIfAborted();
    if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
      throw new Error("unsafe-destination");
    ({ address, family } = addresses[0]!);
  }
  return () =>
    new Promise<Response>((resolve, reject) => {
      signal.throwIfAborted();
      const request = (
        target.protocol === "https:" ? httpsRequest : httpRequest
      )(
        target,
        {
          agent: false,
          signal,
          method: "GET",
          maxHeaderSize: 32768,
          family,
          headers: {
            accept: "text/html,application/json",
            "accept-encoding": "gzip, deflate, br",
            "user-agent":
              "Source-Taster/0.0.0 (uncalibrated development preview)",
          },
          lookup: (_hostname, _options, callback) =>
            callback(null, address, family),
        },
        (response) => {
          void (async () => {
            const headers = new Headers();
            for (const key of ["content-type", "location", "retry-after"]) {
              const value = response.headers[key];
              if (typeof value === "string") headers.set(key, value);
            }
            if (Number(response.headers["content-length"] ?? 0) > ceiling)
              throw new Error("response-size");
            let wire = 0,
              decoded = 0;
            const chunks: Buffer[] = [];
            const count = new Transform({
              transform(chunk: Buffer, _encoding, done) {
                wire += chunk.length;
                done(wire > ceiling ? new Error("response-size") : null, chunk);
              },
            });
            const collect = new Transform({
              transform(chunk: Buffer, _encoding, done) {
                decoded += chunk.length;
                if (decoded > ceiling) {
                  done(new Error("response-size"));
                  return;
                }
                chunks.push(chunk);
                done();
              },
            });
            const encoding = response.headers["content-encoding"];
            const decoder =
              encoding === "gzip"
                ? createGunzip()
                : encoding === "deflate"
                  ? createInflate()
                  : encoding === "br"
                    ? createBrotliDecompress()
                    : undefined;
            if (encoding && encoding !== "identity" && !decoder)
              throw new Error("unsupported-encoding");
            if (decoder)
              await pipeline(response, count, decoder, collect, { signal });
            else await pipeline(response, count, collect, { signal });
            const status = response.statusCode ?? 500;
            resolve(
              new Response(
                [204, 205, 304].includes(status) ? null : Buffer.concat(chunks),
                { status, headers },
              ),
            );
          })().catch((error) => {
            response.destroy();
            reject(
              error instanceof Error
                ? error
                : new Error("Unreadable HTTP response"),
            );
          });
        },
      );
      request.on("error", reject);
      request.end();
    });
}
