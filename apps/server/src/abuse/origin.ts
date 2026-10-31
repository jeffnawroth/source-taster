// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash, createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { isIP } from "node:net";
import { z } from "zod";
import { fail } from "../http/problems.ts";
/** No qualified numeric defaults: these are explicit deployment operating settings. */
export const OriginSettings = z.strictObject({
  ipv4Prefix: z.number().int().min(1).max(32),
  ipv6Prefix: z.number().int().min(1).max(128),
  keys: z
    .array(
      z
        .strictObject({
          id: z.string().min(1).max(80),
          secret: z.string().regex(/^[a-f0-9]{64}$/),
          from: z.number().int().nonnegative().safe(),
          until: z.number().int().positive().safe(),
        })
        .refine((v) => v.from < v.until),
    )
    .min(1)
    .max(32),
});
export type OriginSettings = z.infer<typeof OriginSettings>;
function prefix(address: string, settings: OriginSettings) {
  // Node commonly supplies IPv4-mapped IPv6 peers; normalize before truncation.
  if (
    address.toLowerCase().startsWith("::ffff:") &&
    isIP(address.slice(7)) === 4
  )
    address = address.slice(7);
  const family = isIP(address);
  if (!family) fail("abuse-unavailable");
  let bytes: number[];
  if (family === 4) bytes = address.split(".").map(Number);
  else {
    // WHATWG canonicalization expands embedded IPv4 into hexadecimal groups.
    const canonical = new URL(`http://[${address}]/`).hostname.slice(1, -1);
    const halves = canonical.split("::").map((p) => (p ? p.split(":") : []));
    const groups =
      halves.length === 1
        ? halves[0]!
        : [
            ...halves[0]!,
            ...Array<string>(8 - halves[0]!.length - halves[1]!.length).fill(
              "0",
            ),
            ...halves[1]!,
          ];
    bytes = groups.flatMap((g) => {
      const n = parseInt(g, 16);
      return [n >> 8, n & 255];
    });
  }
  const bits = family === 4 ? settings.ipv4Prefix : settings.ipv6Prefix;
  const truncated = bytes.map(
    (b, index) =>
      b & (index * 8 >= bits ? 0 : 255 << Math.max(0, 8 - (bits - index * 8))),
  );
  return `${family}/${bits}/${Buffer.from(truncated).toString("hex")}`;
}
export function originForWindow(
  address: string | undefined,
  settings: OriginSettings,
  now: number,
  windowMs: number,
) {
  if (!address) fail("abuse-unavailable");
  const windowStart = Math.floor(now / windowMs) * windowMs;
  // Key selection is pinned to the counter window, never to request time.
  const keys = settings.keys.filter(
    (k) => k.from <= windowStart && windowStart < k.until,
  );
  if (keys.length !== 1) fail("abuse-unavailable");
  const key = keys[0]!;
  const hash = createHmac("sha256", Buffer.from(key.secret, "hex"))
    .update(`${windowMs}/${windowStart}/${prefix(address, settings)}`)
    .digest("hex");
  const configuration = createHash("sha256")
    .update(
      `${key.id}/${key.secret}/${settings.ipv4Prefix}/${settings.ipv6Prefix}`,
    )
    .digest("hex");
  return { windowMs, windowStart, keyId: key.id, hash, configuration };
}

/** Restricted Operator-owned key file, reloaded by a rolling process restart.
 * Retain old scheduled material until every window selected by it has expired. */
export function loadOriginSettings(path: string | undefined): OriginSettings {
  if (!path) throw new Error("SOURCE_TASTER_ABUSE_ORIGIN_CONFIG is required");
  return OriginSettings.parse(JSON.parse(readFileSync(path, "utf8")));
}
