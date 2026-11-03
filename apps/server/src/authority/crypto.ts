// SPDX-License-Identifier: AGPL-3.0-or-later
// Fixed-algorithm Node/OpenSSL adapter; client JWTs and internal assertions have
// separate keys, types, audiences and purposes. No token chooses its JWKS URL.
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomUUID,
  sign,
  verify,
} from "node:crypto";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { PublicJwks } from "@source-taster/contract-service";
import { fail } from "../http/problems.ts";
export const HostedSettings = z.strictObject({
  serviceOrigin: z.url(),
  serviceIssuer: z.url(),
  verificationAudience: z.string().min(1),
  assertionIssuer: z.url(),
  internalKey: z.strictObject({
    kid: z.string().min(1).max(80),
    pem: z.string().max(8192),
  }),
  serviceInternalJwks: PublicJwks,
});
export type HostedSettings = z.infer<typeof HostedSettings> & {
  peerKeys(): PublicJwks;
};
export function loadHostedSettings(path: string | undefined): HostedSettings {
  if (!path)
    throw new Error(
      "SOURCE_TASTER_AUTH_CONFIG is required for hosted authority",
    );
  const settings = HostedSettings.parse(JSON.parse(readFileSync(path, "utf8")));
  const origin = new URL(settings.serviceOrigin);
  if (
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash ||
    origin.pathname !== "/" ||
    (origin.protocol !== "https:" &&
      !(
        process.env.NODE_ENV !== "production" &&
        origin.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
      ))
  )
    throw new Error(
      "Hosted service requires a trusted HTTPS origin (loopback only in development)",
    );
  if (
    createPrivateKey(settings.internalKey.pem).asymmetricKeyType !== "ed25519"
  )
    throw new Error("Ed25519 assertion key required");
  const own = createPublicKey(
    createPrivateKey(settings.internalKey.pem),
  ).export({ format: "jwk" });
  function peerKeys(document: unknown): PublicJwks {
    const keys = PublicJwks.parse(document);
    if (
      !keys.keys.length ||
      new Set(keys.keys.map((k) => k.kid)).size !== keys.keys.length ||
      keys.keys.some((k) => decodePart(k.x).length !== 32 || k.x === own.x)
    )
      throw new Error(
        "Distinct canonical peer keys and unique key IDs required",
      );
    return keys;
  }
  peerKeys(settings.serviceInternalJwks);
  // Internal trust is configured public material, re-read on every assertion.
  // Atomic file replacement permits overlap/removal without an unbounded cache.
  return Object.assign(settings, {
    peerKeys: () => {
      const file = JSON.parse(readFileSync(path, "utf8")) as {
        serviceInternalJwks: unknown;
      };
      return peerKeys(file.serviceInternalJwks);
    },
  });
}
const header = z.strictObject({
  alg: z.literal("EdDSA"),
  typ: z.string(),
  kid: z.string().min(1).max(80),
});
function decodePart(input: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) throw new Error("invalid-token");
  const bytes = Buffer.from(input, "base64url");
  if (bytes.toString("base64url") !== input) throw new Error("invalid-token");
  return bytes;
}
function unpack(token: string) {
  if (token.length > 4096) throw new Error("invalid-token");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid-token");
  return {
    header: header.parse(JSON.parse(decodePart(parts[0]!).toString())),
    claims: JSON.parse(decodePart(parts[1]!).toString()) as unknown,
    message: Buffer.from(`${parts[0]}.${parts[1]}`),
    signature: decodePart(parts[2]!),
  };
}
const timeClaims = {
  iat: z.number().int().nonnegative(),
  nbf: z.number().int().nonnegative(),
  exp: z.number().int().positive(),
};
const guestClaims = z.strictObject({
  ...timeClaims,
  iss: z.string(),
  aud: z.string(),
  purpose: z.literal("guest-access"),
  sub: z.uuid(),
  ownerId: z.uuid(),
  guestContextId: z.uuid(),
  guestId: z.uuid(),
  client: z.enum(["web", "extension"]),
  jti: z.uuid(),
});
const accountClaims = z.strictObject({
  ...timeClaims,
  iss: z.string(),
  aud: z.string(),
  purpose: z.literal("account-access"),
  sub: z.uuid(),
  ownerId: z.uuid(),
  sessionId: z.uuid(),
  jti: z.uuid(),
});
const accessClaims = z.discriminatedUnion("purpose", [
  guestClaims,
  accountClaims,
]);
export type AccessClaims = z.infer<typeof accessClaims>;
function validTime(
  claims: { iat: number; nbf: number; exp: number },
  now: number,
  lifetime: number,
) {
  const seconds = Math.floor(now / 1000);
  return (
    claims.iat <= seconds &&
    claims.nbf === claims.iat &&
    claims.nbf <= seconds &&
    seconds < claims.exp &&
    claims.exp - claims.iat === lifetime
  );
}
export function requestAssertion(
  settings: HostedSettings,
  body: string,
  now: number,
  path = "/internal/guest-authority",
) {
  const iat = Math.floor(now / 1000);
  const h = Buffer.from(
    JSON.stringify({
      alg: "EdDSA",
      typ: "service+jwt",
      kid: settings.internalKey.kid,
    }),
  ).toString("base64url");
  const p = Buffer.from(
    JSON.stringify({
      iss: settings.assertionIssuer,
      aud: settings.serviceIssuer,
      purpose:
        path === "/internal/data-subject-authority"
          ? "data-subject-authority"
          : path.startsWith("/internal/abuse/")
            ? "abuse-entrance"
            : path.startsWith("/internal/quota/")
              ? "quota"
              : path === "/internal/account-authority"
                ? "account-authority"
                : "guest-authority",
      iat,
      nbf: iat,
      exp: iat + 30,
      jti: randomUUID(),
      method: "POST",
      path,
      bodyHash: createHash("sha256").update(body).digest("base64url"),
    }),
  ).toString("base64url");
  const message = `${h}.${p}`;
  return `${message}.${sign(null, Buffer.from(message), createPrivateKey(settings.internalKey.pem)).toString("base64url")}`;
}
/** What one service-facing mutation accepts: purpose, method and exact path are
 * all bound into the signed assertion, so one route's assertion cannot be replayed
 * against another. */
function serviceAssertion(binding: {
  purpose: string;
  method: string;
  path: string;
}) {
  const claims = z.strictObject({
    ...timeClaims,
    iss: z.string(),
    aud: z.string(),
    purpose: z.literal(binding.purpose),
    jti: z.uuid(),
    method: z.literal(binding.method),
    path: z.literal(binding.path),
    bodyHash: z.string(),
  });
  return (
    settings: HostedSettings,
    token: string,
    body: string,
    now: number,
  ) => {
    try {
      const data = unpack(token);
      const parsed = claims.parse(data.claims);
      const key = settings
        .peerKeys()
        .keys.find((k) => k.kid === data.header.kid);
      if (
        !key ||
        data.header.typ !== "service+jwt" ||
        !validTime(parsed, now, 30) ||
        parsed.iss !== settings.serviceIssuer ||
        parsed.aud !== settings.verificationAudience ||
        parsed.bodyHash !==
          createHash("sha256").update(body).digest("base64url") ||
        !verify(
          null,
          data.message,
          createPublicKey({ key, format: "jwk" }),
          data.signature,
        )
      )
        fail("unauthenticated");
    } catch {
      fail("unauthenticated");
    }
  };
}
export const verifyInvalidation = serviceAssertion({
  purpose: "authority-invalidation",
  method: "POST",
  path: "/internal/guest-authority/invalidate",
});
/** The private service's Owner-deletion call (ADR-0003); the path carries the Owner. */
export const verifyOwnerDeletion = (
  settings: HostedSettings,
  token: string,
  ownerId: string,
  now: number,
) =>
  serviceAssertion({
    purpose: "owner-deletion",
    method: "DELETE",
    path: `/internal/owners/${ownerId}`,
  })(settings, token, "", now);
/** 30s key cache, 1s global refresh cooldown, one flight, 2s timeout, 16KiB
 * maximum document and five keys. Refresh failure never extends old key lifetime. */
export function guestAccessTokens(
  settings: HostedSettings,
  clock = { now: Date.now },
) {
  let cached: PublicJwks | undefined,
    until = 0,
    nextRefresh = 0;
  let pending: Promise<void> | undefined;
  async function refresh() {
    if (pending) return pending;
    if (clock.now() < nextRefresh) return;
    nextRefresh = clock.now() + 1000;
    pending = (async () => {
      try {
        const response = await fetch(
          `${settings.serviceOrigin}/.well-known/jwks.json`,
          {
            signal: AbortSignal.timeout(2000),
            redirect: "error",
            cache: "no-store",
          },
        );
        if (!response.ok || !response.body) throw new Error();
        const reader = response.body.getReader();
        let raw = "",
          length = 0;
        const decoder = new TextDecoder();
        try {
          for (;;) {
            const item = await reader.read();
            if (item.done) break;
            length += item.value.length;
            if (length > 16384) throw new Error();
            raw += decoder.decode(item.value, { stream: true });
          }
        } finally {
          await reader.cancel();
        }
        const keys = PublicJwks.parse(JSON.parse(raw));
        if (new Set(keys.keys.map((k) => k.kid)).size !== keys.keys.length)
          throw new Error();
        cached = keys;
        until = clock.now() + 30_000;
      } catch {
        cached = undefined;
        until = 0;
        fail("authority-unavailable");
      }
    })().finally(() => {
      pending = undefined;
    });
    return pending;
  }
  return {
    async verify(token: string): Promise<AccessClaims> {
      let data: ReturnType<typeof unpack>;
      let claims: AccessClaims;
      try {
        data = unpack(token);
        claims = accessClaims.parse(data.claims);
      } catch {
        fail("unauthenticated");
      }
      if (
        data.header.typ !== "at+jwt" ||
        !validTime(claims, clock.now(), 300) ||
        claims.iss !== settings.serviceIssuer ||
        claims.aud !== settings.verificationAudience
      )
        fail("unauthenticated");
      if (
        clock.now() >= until ||
        !cached?.keys.some((k) => k.kid === data.header.kid)
      )
        await refresh();
      const key =
        clock.now() < until
          ? cached?.keys.find((k) => k.kid === data.header.kid)
          : undefined;
      if (!key) fail("unauthenticated");
      try {
        if (
          !verify(
            null,
            data.message,
            createPublicKey({ key, format: "jwk" }),
            data.signature,
          )
        )
          fail("unauthenticated");
      } catch {
        fail("unauthenticated");
      }
      if (!validTime(claims, clock.now(), 300)) fail("unauthenticated");
      return claims;
    },
  };
}
