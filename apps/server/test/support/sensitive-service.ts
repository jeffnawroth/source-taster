// SPDX-License-Identifier: AGPL-3.0-or-later
// #102 public phase: a deliberately small stand-in for the PRIVATE Account
// service, used only at its HTTP edge by browser tests. It proves nothing about
// the private implementation of fresh proof, session revocation or Owner
// tombstoning; it only lets the public UI, clients and verification program be
// exercised against the documented contract. Real both-program acceptance is
// listed in docs/implementation/102-sensitive-account-actions.md.
import { bothPrograms, freePort } from "./both-programs.ts";
import { randomUUID } from "node:crypto";
import type {
  AccountIdentity,
  ServiceReply,
  ServiceRequest,
} from "./account-api.ts";

export const proofWindowMs = 300_000;
export const codes = {
  proof: "424242",
  replacement: "515151",
} as const;
const problem = (status: number, code: string): ServiceReply => ({
  status,
  headers: { "content-type": "application/problem+json" },
  body: {
    type: "about:blank",
    title: code,
    status,
    code,
    i18nKey: `problem_${code.replaceAll("-", "_")}`,
  },
});

export interface FakeAccount extends AccountIdentity {
  email: string;
}
type Action = "email-change" | "account-deletion";
export type DeletionBehavior =
  "delete" | "fail" | "unavailable" | "in-progress";

export async function sensitiveService(options: {
  prefix: "/v1" | "/v1/extension";
  account: FakeAccount;
  /** Web: the cookie value. Extension: the opaque session credential. */
  secret: string;
  deleteOwner(ownerId: string): Promise<{ status: number }>;
  /** The service now answers `allowed: false` for this Account's sessions. */
  revoke(): void;
}) {
  // Preferences now cross the real private-service boundary, including PostgreSQL.
  // Sensitive-action fault injection below remains an explicitly isolated UI fixture.
  const real = await bothPrograms({
    accounts: true,
    apiPort: await freePort(),
    servicePort: await freePort(),
  });
  const accountSession = await real.signIn(
    `preferences-${randomUUID()}@example.invalid`,
  );
  let initialized = false;
  const state = {
    email: options.account.email,
    live: true,
    offset: 0,
    behavior: "delete" as DeletionBehavior,
    /** Everything the client asked of the service, in order. */
    calls: [] as string[],
    mail: [] as { to: string; kind: "proof" | "replacement"; code: string }[],
    deleteStatus: undefined as number | undefined,
  };
  const now = () => Date.now() + state.offset;
  const proofs = new Map<Action, number>();
  const challenges = new Map<
    string,
    {
      kind: "proof" | "replacement";
      action?: Action;
      to: string;
      failures: number;
    }
  >();
  const account = () => ({
    accountId: options.account.accountId,
    ownerId: options.account.ownerId,
    email: state.email,
  });
  const ok = (data: unknown): ServiceReply => ({
    status: 200,
    headers: { "content-type": "application/json" },
    body: { data, quota: { status: "not-implemented" } },
  });
  const fresh = (action: Action) => {
    const at = proofs.get(action);
    return at !== undefined && now() - at <= proofWindowMs;
  };
  function authenticated(request: ServiceRequest) {
    if (!state.live) return false;
    return options.prefix === "/v1"
      ? String(request.headers.cookie ?? "").includes(
          `st-fake=${options.secret}`,
        )
      : request.headers.authorization === `Bearer ${options.secret}`;
  }
  async function handle(
    request: ServiceRequest,
    api: { token(account: AccountIdentity): string },
  ): Promise<ServiceReply | undefined> {
    const origin = request.headers.origin;
    const cors: Record<string, string> =
      typeof origin === "string"
        ? {
            "access-control-allow-origin": origin,
            "access-control-allow-credentials": "true",
            "access-control-allow-headers": "content-type, authorization",
            "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
            vary: "origin",
          }
        : {};
    const reply = await route(request, api);
    if (!reply) return undefined;
    return { ...reply, headers: { ...reply.headers, ...cors } };
  }
  async function route(
    request: ServiceRequest,
    api: { token(account: AccountIdentity): string },
  ): Promise<ServiceReply | undefined> {
    const path = request.url;
    if (!path.startsWith(options.prefix + "/")) return undefined;
    if (request.method === "OPTIONS") return { status: 204 };
    const tail = path.slice(options.prefix.length);
    state.calls.push(`${request.method} ${tail}`);
    if (!authenticated(request)) return problem(401, "unauthenticated");
    if (tail === "/session" || tail === "/session/activity")
      return ok(account());
    if (tail === "/account-tokens")
      return ok({
        accessToken: api.token(options.account),
        tokenType: "Bearer",
        expiresIn: 300,
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
      });
    if (tail === "/sign-out") {
      state.live = false;
      return ok({ signedOut: true });
    }
    const body = request.body;
    if (tail === "/preferences") {
      if (!initialized) {
        const language = String(request.headers["accept-language"] ?? "")
          .toLowerCase()
          .startsWith("de")
          ? "de"
          : "en";
        const setup = await fetch(real.serviceUrl + "/v1/preferences", {
          method: "PATCH",
          headers: {
            origin: "https://web.test.invalid",
            cookie: accountSession.cookie,
            "content-type": "application/json",
          },
          body: JSON.stringify({ language, citationStyle: "apa" }),
        });
        if (!setup.ok)
          throw new Error("real-preferences-initialization-failed");
        initialized = true;
      }
      const response = await fetch(real.serviceUrl + "/v1/preferences", {
        method: request.method,
        headers: {
          origin: "https://web.test.invalid",
          cookie: accountSession.cookie,
          ...(request.method === "PATCH"
            ? { "content-type": "application/json" }
            : {}),
        },
        ...(request.method === "PATCH" ? { body: JSON.stringify(body) } : {}),
      });
      return {
        status: response.status,
        headers: {
          "content-type":
            response.headers.get("content-type") ?? "application/json",
        },
        body: (await response.json()) as unknown,
      };
    }
    if (tail === "/account/fresh-proof/challenges") {
      if (state.behavior === "unavailable")
        return problem(501, "not-implemented");
      const id = randomUUID();
      challenges.set(id, {
        kind: "proof",
        action: body.action as Action,
        to: state.email,
        failures: 0,
      });
      state.mail.push({ to: state.email, kind: "proof", code: codes.proof });
      return ok({
        challengeId: id,
        action: body.action,
        expiresIn: 300,
        resendAfter: 60,
      });
    }
    if (tail === "/account/fresh-proof/confirm") {
      const challenge = challenges.get(String(body.challengeId));
      if (!challenge || challenge.kind !== "proof")
        return problem(400, "fresh-proof-invalid");
      if (challenge.failures >= 3) return problem(429, "fresh-proof-exhausted");
      if (body.code !== codes.proof) {
        challenge.failures += 1;
        return challenge.failures >= 3
          ? problem(429, "fresh-proof-exhausted")
          : problem(400, "fresh-proof-invalid");
      }
      challenges.delete(String(body.challengeId));
      proofs.set(challenge.action!, now());
      return ok({
        action: challenge.action,
        expiresAt: new Date(Date.now() + proofWindowMs).toISOString(),
        expiresIn: 300,
      });
    }
    if (tail === "/account/email-change/challenges") {
      if (!fresh("email-change")) return problem(403, "fresh-proof-required");
      const id = randomUUID();
      // Same answer for every address; only the code's delivery differs.
      challenges.set(id, {
        kind: "replacement",
        to: String(body.newEmail),
        failures: 0,
      });
      if (!String(body.newEmail).startsWith("taken@"))
        state.mail.push({
          to: String(body.newEmail),
          kind: "replacement",
          code: codes.replacement,
        });
      return ok({ challengeId: id, expiresIn: 300, resendAfter: 60 });
    }
    if (tail === "/account/email-change/confirm") {
      if (!fresh("email-change")) return problem(403, "fresh-proof-required");
      const challenge = challenges.get(String(body.challengeId));
      const delivered =
        challenge &&
        challenge.kind === "replacement" &&
        !challenge.to.startsWith("taken@");
      if (!delivered || body.code !== codes.replacement)
        return problem(400, "email-change-invalid");
      challenges.delete(String(body.challengeId));
      proofs.delete("email-change");
      state.email = challenge.to;
      return ok(account());
    }
    if (tail === "/account/deletion") {
      if (state.behavior === "unavailable")
        return problem(501, "not-implemented");
      if (!fresh("account-deletion"))
        return problem(403, "fresh-proof-required");
      if (state.behavior === "fail")
        return problem(503, "authority-unavailable");
      proofs.delete("account-deletion");
      const deleted = await options.deleteOwner(options.account.ownerId);
      state.deleteStatus = deleted.status;
      if (deleted.status !== 200) return problem(503, "authority-unavailable");
      state.live = false;
      options.revoke();
      return ok({
        status: state.behavior === "in-progress" ? "in-progress" : "deleted",
      });
    }
    return undefined;
  }
  return {
    stop: () => real.stop(),
    setPreferences: async (preferences: {
      language: "de" | "en";
      citationStyle: string;
    }) => {
      const r = await fetch(real.serviceUrl + "/v1/preferences", {
        method: "PATCH",
        headers: {
          origin: "https://web.test.invalid",
          cookie: accountSession.cookie,
          "content-type": "application/json",
        },
        body: JSON.stringify(preferences),
      });
      if (!r.ok) throw new Error("real-preferences-update-failed");
      initialized = true;
    },
    state,
    handle,
    /** Fresh session, no proof, default behavior; the mail outbox is emptied. */
    reset: () => {
      state.email = options.account.email;
      state.live = true;
      state.offset = 0;
      state.behavior = "delete";
      state.calls.length = 0;
      state.mail.length = 0;
      initialized = false;
      proofs.clear();
      challenges.clear();
    },
    /** Let the service's own clock run on without waiting. */
    advance: (ms: number) => {
      state.offset += ms;
    },
  };
}
