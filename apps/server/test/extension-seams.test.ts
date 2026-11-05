// SPDX-License-Identifier: AGPL-3.0-or-later
// FA-ERW-02 / FA-ERW-03 / FA-ERW-05: documented simulations of the public
// program's extension seams (docs/implementation/70-launch-integration-log.md).
//
// The public program only knows an opaque Owner key, named permissions and an
// `Entitlements.resolve` port. Memberships, the role -> permission policy and
// issuer/subject identity linking belong to the private service. The tables
// below are TEST-DEFINED stand-ins for that private policy, so these tests show
// what the public seams accept; they do not show that the private service's
// join, role mapping or identity linking works, and they are no federation,
// organization or qualification evidence.
import { randomUUID } from "node:crypto";
import pg from "pg";
import { afterAll, beforeAll, expect, it } from "vitest";
import { createParser } from "@source-taster/core";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { createApp } from "../src/http/app.ts";
import { createPrisma } from "../src/db/prisma.ts";
import { createQueue } from "../src/checks/queue.ts";
import { createCheckStore } from "../src/checks/store.ts";
import { listenForEvents } from "../src/checks/events.ts";
import type { Permission, Principal } from "../src/entitlements.ts";
import { setupDatabase } from "../scripts/db-setup.ts";
import { testDatabase } from "./support/processes.ts";

const PERMISSIONS: readonly Permission[] = [
  "structuring:create",
  "check:create",
  "check:read",
  "check:cancel",
  "check:renew",
];

// --- Test-defined stand-ins for private-service policy -----------------------
/** Role -> named permissions. Adding a role means adding a row here only. */
const ROLES: Record<string, ReadonlySet<Permission>> = {
  user: new Set(PERMISSIONS),
  // Simulated NEW role (FA-ERW-03): introduced by this row alone.
  "read-only-reviewer": new Set<Permission>(["check:read"]),
};
/** Issuer/subject -> stable Account (FA-ERW-05). Never an Owner or a session. */
const IDENTITIES = new Map<string, string>();
/** Account -> Owner it is acting for: personal at launch, organization later. */
const personalOwner = new Map<string, string>();
/** Account + organization Owner -> role: a membership (FA-ERW-02). */
const memberships = new Map<string, { owner: string; role: string }>();

const identityKey = (issuer: string, subject: string) =>
  `${issuer}\u0000${subject}`;

function resolvePrincipal(request: Request): Principal | null {
  const headers = request.headers;
  if (headers.get("Test-Anonymous")) return null;
  const issuer = headers.get("Test-Issuer");
  const subject = headers.get("Test-Subject");
  const account =
    issuer && subject
      ? IDENTITIES.get(identityKey(issuer, subject))
      : (headers.get("Test-Account") ?? undefined);
  if (!account) return null;
  const organization = headers.get("Test-Organization");
  const membership = organization
    ? memberships.get(`${account}\u0000${organization}`)
    : undefined;
  if (organization && !membership) return null;
  const role = membership?.role ?? headers.get("Test-Role") ?? "user";
  const permissions = ROLES[role];
  if (!permissions) return null;
  return {
    ownerId: membership?.owner ?? personalOwner.get(account) ?? account,
    actorId: account,
    // A fresh session per sign-in; ownership never keys on it.
    sessionId: headers.get("Test-Session") ?? `session-${randomUUID()}`,
    can: (permission) =>
      !headers.get("Test-Without")?.split(",").includes(permission) &&
      permissions.has(permission),
    quota: null,
  };
}

const quota = (remaining: number) => ({
  consumed: 0,
  remaining,
  granted: 1000,
  reserved: 1000 - remaining,
  warning: "none" as const,
  grants: [],
  features: ["verification-report"],
});

const database = testDatabase();
const db = createPrisma(database.appUrl);
let handle: (request: Request) => Promise<Response>;
let stop: () => Promise<void>;
beforeAll(async () => {
  await setupDatabase(database.adminUrl, database.appUrl);
  const boss = await createQueue(database.appUrl);
  const events = await listenForEvents(database.appUrl);
  const app = createApp({
    structuring: createParser(),
    checks: createCheckStore(db, boss),
    events,
    heartbeatMs: 100,
    referenceLimit: 1000,
    entitlements: {
      resolve: (request) => Promise.resolve(resolvePrincipal(request)),
      // Grants the report feature so report routes reach their permission check.
      quota: {
        snapshot: () => Promise.resolve(quota(1000)),
        reserve: (_owner, _checkId, _key, slots) =>
          Promise.resolve({
            free: [],
            reserved: slots.length,
            quota: quota(1000 - slots.length),
          }),
        release: async () => {},
        settle: async () => {},
      },
    },
  });
  handle = async (request) => app.fetch(request);
  routes = app.routes
    .filter((route) => route.method !== "ALL")
    .map((route) => `${route.method} ${route.path}`);
  stop = async () => {
    await events.close();
    await boss.stop();
    await db.$disconnect();
    const admin = new pg.Client({ connectionString: database.adminUrl });
    await admin.connect();
    const owned = new URL(database.appUrl);
    await admin.query(
      `DROP DATABASE ${admin.escapeIdentifier(owned.pathname.slice(1))} WITH (FORCE)`,
    );
    await admin.query(`DROP ROLE ${admin.escapeIdentifier(owned.username)}`);
    await admin.end();
  };
});
afterAll(async () => {
  await stop?.();
});
let routes: string[] = [];

const base = "http://localhost";
const call = (
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body?: unknown,
) =>
  handle(
    new Request(base + path, {
      method,
      headers: {
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
  );
const createCheck = async (headers: Record<string, string>) => {
  const response = await call("POST", "/v2/checks", headers, {
    references: [{ originalText: "Simulated reference", fields: {} }],
  });
  expect(response.status).toBe(201);
  return CheckResponse.parse(await response.json()).data;
};
const read = (id: string, headers: Record<string, string>) =>
  call("GET", `/v2/checks/${id}`, headers);
const row = async (id: string) => {
  const client = new pg.Client({ connectionString: database.appUrl });
  await client.connect();
  try {
    return (await client.query(`SELECT * FROM checks WHERE id = $1`, [id]))
      .rows[0] as Record<string, unknown>;
  } finally {
    await client.end();
  }
};

// --- FA-ERW-03: every protected action checks a named permission -------------
const id = "00000000-0000-4000-8000-000000000001";
const text = { text: "Doe (2020). Exact maps." };
const style = "chicago";
const newCheck = { references: [{ originalText: "x", fields: {} }] };
type Entry = { permission: Permission; body?: unknown };
/** The named permission each protected route demands, reviewed route by route. */
const PROTECTED: Record<string, Entry> = {
  "POST /v1/structurings": { permission: "structuring:create", body: text },
  "POST /v1/checks": { permission: "check:create", body: newCheck },
  "GET /v1/checks/:checkId": { permission: "check:read" },
  "POST /v1/checks/:checkId/cancel": { permission: "check:cancel" },
  "POST /v1/checks/:checkId/lease": { permission: "check:renew" },
  "GET /v1/checks/:checkId/events": { permission: "check:read" },
  "POST /v2/structurings": { permission: "structuring:create", body: text },
  "GET /v2/document-settings": { permission: "structuring:create" },
  "POST /v2/document-structurings": {
    permission: "structuring:create",
    body: {},
  },
  "GET /v2/history": { permission: "check:read" },
  "PUT /v2/history": { permission: "check:create", body: { enabled: true } },
  "DELETE /v2/history/:checkId": { permission: "check:create" },
  "POST /v2/history/:checkId/restart": { permission: "check:create" },
  "GET /v2/quota": { permission: "check:read" },
  "POST /v2/imports": {
    permission: "structuring:create",
    body: { format: "bibtex", text: "@article{a, title={T}}" },
  },
  "POST /v2/checks": { permission: "check:create", body: newCheck },
  "POST /v2/checks/:checkId/references/:slot/revisions": {
    permission: "check:create",
    body: { expectedRevision: 1, fields: {}, recheck: false },
  },
  "POST /v2/checks/:checkId/references/:slot/manual-override": {
    permission: "check:create",
    body: {
      expectedRevision: 1,
      resultId: id,
      expectedOverrideId: null,
      verdict: "correct",
    },
  },
  "POST /v2/checks/:checkId/selection/preview": {
    permission: "check:create",
    body: { expectedEventSeq: 0, regions: [] },
  },
  "POST /v2/checks/:checkId/selection": {
    permission: "check:create",
    body: { expectedEventSeq: 0, regions: [] },
  },
  "POST /v2/checks/:checkId/references/:slot/recheck": {
    permission: "check:create",
    body: { expectedRevision: 1 },
  },
  "POST /v2/checks/:checkId/references": {
    permission: "check:create",
    body: { expectedEventSeq: 0, add: [], remove: [] },
  },
  "POST /v2/checks/:checkId/bibliography": {
    permission: "check:read",
    body: { style },
  },
  "POST /v2/checks/:checkId/export": {
    permission: "check:read",
    body: { format: "csl-json", mode: "original" },
  },
  "POST /v2/checks/:checkId/reports": {
    permission: "check:read",
    body: { language: "en", style },
  },
  "GET /v2/checks/:checkId/reports/:reportId": { permission: "check:read" },
  "DELETE /v2/checks/:checkId/reports/:reportId": { permission: "check:read" },
  "GET /v2/checks/:checkId/reports/:reportId/file": {
    permission: "check:read",
  },
  "GET /v2/checks/:checkId": { permission: "check:read" },
  "POST /v2/checks/:checkId/cancel": { permission: "check:cancel" },
  "POST /v2/checks/:checkId/lease": { permission: "check:renew" },
  "GET /v2/checks/:checkId/events": { permission: "check:read" },
};
const request = (key: string, headers: Record<string, string>) => {
  const [method, template] = key.split(" ") as [string, string];
  const path = template
    .replace(":checkId", id)
    .replace(":reportId", id)
    .replace(":slot", "1");
  return call(method, path, headers, PROTECTED[key]!.body);
};
const keys = Object.keys(PROTECTED);
/** Neither authentication nor authorization stopped the request. */
const reachedHandler = (status: number) => status !== 401 && status !== 403;

it("classifies every business route of both API versions; a new unclassified route fails here", () => {
  const registered = [...new Set(routes)]
    .filter((route) => route !== "GET /health")
    .filter((route) => !route.endsWith("/openapi.json"))
    .sort();
  expect(registered).toEqual([...keys].sort());
});

it("each route checks exactly its named permission, and refuses an anonymous request", async () => {
  const account = randomUUID();
  for (const key of keys) {
    for (const permission of PERMISSIONS) {
      const response = await request(key, {
        "Test-Account": account,
        "Test-Without": permission,
      });
      await response.body?.cancel();
      const required = PROTECTED[key]!.permission === permission;
      expect(
        required ? response.status : reachedHandler(response.status),
        `${key} without ${permission}`,
      ).toBe(required ? 403 : true);
    }
    const anonymous = await request(key, { "Test-Anonymous": "1" });
    await anonymous.body?.cancel();
    expect(anonymous.status, `${key} anonymous`).toBe(401);
  }
});

it("a simulated new role takes effect through the role table alone: only its permissions pass, with no change to any route", async () => {
  const account = randomUUID();
  for (const key of keys) {
    const response = await request(key, {
      "Test-Account": account,
      "Test-Role": "read-only-reviewer",
    });
    await response.body?.cancel();
    const allowed = PROTECTED[key]!.permission === "check:read";
    expect(
      allowed ? reachedHandler(response.status) : response.status,
      `${key} as read-only-reviewer`,
    ).toBe(allowed ? true : 403);
  }
  // An unknown role grants nothing: the resolver refuses to authenticate it.
  const unknown = await request("GET /v2/checks/:checkId", {
    "Test-Account": account,
    "Test-Role": "not-a-role",
  });
  expect(unknown.status).toBe(401);
});

// --- FA-ERW-02: an existing Account joins an organization --------------------
it("joining an organization adds a membership only: same Account and session, personal Owner and Checks unchanged, Owners isolated, role per membership", async () => {
  const account = randomUUID();
  const personal = randomUUID();
  const organization = randomUUID();
  personalOwner.set(account, personal);
  const asPersonal = {
    "Test-Account": account,
    "Test-Session": "same-session",
  };

  const history = await createCheck(asPersonal);
  const before = await row(history.id);
  expect(before).toMatchObject({ owner_id: personal, actor_id: account });

  // The join: one membership row (Account, organization Owner, role) in the
  // test-defined stand-in for the private service. No Check, quota, plan or
  // session row is rewritten, and the Account does not re-register.
  memberships.set(`${account}\u0000${organization}`, {
    owner: organization,
    role: "user",
  });
  const asMember = { ...asPersonal, "Test-Organization": organization };
  expect(await row(history.id)).toEqual(before);
  expect((await read(history.id, asPersonal)).status).toBe(200);

  const shared = await createCheck(asMember);
  expect(await row(shared.id)).toMatchObject({
    owner_id: organization,
    actor_id: account,
  });
  // The personal Check is not exposed to the organization Owner, and the other
  // way round (ADR-0013: institutions never see personal History).
  expect((await read(history.id, asMember)).status).toBe(404);
  expect((await read(shared.id, asPersonal)).status).toBe(404);
  expect((await read(shared.id, asMember)).status).toBe(200);
  expect(await row(history.id)).toEqual(before);

  // Roles belong to the membership: a read-only membership cannot create under
  // the organization while the personal Owner keeps full use.
  const readOnlyOrganization = randomUUID();
  memberships.set(`${account}\u0000${readOnlyOrganization}`, {
    owner: readOnlyOrganization,
    role: "read-only-reviewer",
  });
  const asReviewer = {
    ...asPersonal,
    "Test-Organization": readOnlyOrganization,
  };
  expect((await call("POST", "/v2/checks", asReviewer, newCheck)).status).toBe(
    403,
  );
  expect((await createCheck(asPersonal)).id).toBeTruthy();

  // Not a member: the same Account cannot act for an unrelated organization.
  expect(
    (
      await read(shared.id, {
        ...asPersonal,
        "Test-Organization": randomUUID(),
      })
    ).status,
  ).toBe(401);
});

// --- FA-ERW-05: a further sign-in method maps to the same Account ------------
it("a simulated further provider identity maps to the existing Account: Owner, Checks and rows are untouched and no identity column exists", async () => {
  const account = randomUUID();
  const owner = randomUUID();
  personalOwner.set(account, owner);
  IDENTITIES.set(identityKey("email-otp", "person@example.invalid"), account);
  const viaOtp = {
    "Test-Issuer": "email-otp",
    "Test-Subject": "person@example.invalid",
    "Test-Session": "otp-session",
  };
  const created = await createCheck(viaOtp);
  const before = await row(created.id);
  expect(before).toMatchObject({ owner_id: owner, actor_id: account });

  // Simulated outcome of the private linking step (after proof of both
  // accesses): one issuer/subject -> Account entry. Nothing here reaches Owner,
  // Plan, History or the stored Check.
  const university = "https://idp.university.invalid";
  const viaUniversity = {
    "Test-Issuer": university,
    "Test-Subject": "opaque-subject-123",
    "Test-Session": "university-session",
  };
  expect((await read(created.id, viaUniversity)).status).toBe(401);
  IDENTITIES.set(identityKey(university, "opaque-subject-123"), account);
  expect(await row(created.id)).toEqual(before);

  const seen = CheckResponse.parse(
    await (await read(created.id, viaUniversity)).json(),
  ).data;
  expect(seen.id).toBe(created.id);
  const second = await createCheck(viaUniversity);
  expect(await row(second.id)).toMatchObject({
    owner_id: owner,
    actor_id: account,
  });
  expect((await read(second.id, viaOtp)).status).toBe(200);

  // A different Account's identity never sees these Checks.
  const stranger = randomUUID();
  IDENTITIES.set(identityKey(university, "someone-else"), stranger);
  expect(
    (
      await read(created.id, {
        "Test-Issuer": university,
        "Test-Subject": "someone-else",
      })
    ).status,
  ).toBe(404);

  // Ownership is structurally independent of the sign-in method.
  const client = new pg.Client({ connectionString: database.appUrl });
  await client.connect();
  try {
    const columns = (
      await client.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'verification' AND table_name = 'checks'`,
      )
    ).rows.map((column) => column.column_name);
    expect(columns).toEqual(expect.arrayContaining(["owner_id", "actor_id"]));
    expect(
      columns.filter((name) =>
        /issuer|subject|provider|session|identity|email/u.test(name),
      ),
    ).toEqual([]);
  } finally {
    await client.end();
  }
});
