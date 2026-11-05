// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  firefoxPreferenceSyncConsent,
  type DataCollectionType,
} from "./platform.ts";

type DataType = DataCollectionType;
type DataCollection = { data_collection?: DataType[] };
const dataType = "technicalAndInteraction";
/** The seam answers synchronously and learns the grant afterwards. */
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));
async function seam(api: ReturnType<typeof fakePermissions>["api"]) {
  const consent = firefoxPreferenceSyncConsent(api);
  await settle();
  return consent;
}

/** The Firefox permissions API as the browser edge: a granted set, a prompt
 * answer, and listeners fired the way about:addons or the prompt would. */
function fakePermissions(initial: DataType[] = []) {
  let granted = [...initial];
  let lookup: Promise<DataCollection> | undefined;
  let answer: boolean | Error = true;
  const requests: DataCollection[] = [];
  const added = new Set<(p: DataCollection) => void>();
  const removed = new Set<(p: DataCollection) => void>();
  const api = {
    permissions: {
      getAll: (): Promise<DataCollection> =>
        lookup ?? Promise.resolve({ data_collection: [...granted] }),
      request: (request: DataCollection) => {
        requests.push(request);
        if (answer instanceof Error) return Promise.reject(answer);
        if (answer) granted = [...(request.data_collection ?? [])];
        for (const l of added) if (answer) l(request);
        return Promise.resolve(answer);
      },
      onAdded: {
        addListener: (l: (p: DataCollection) => void) => added.add(l),
        removeListener: (l: (p: DataCollection) => void) => added.delete(l),
      },
      onRemoved: {
        addListener: (l: (p: DataCollection) => void) => removed.add(l),
        removeListener: (l: (p: DataCollection) => void) => removed.delete(l),
      },
    },
  };
  return {
    api,
    requests,
    listeners: () => added.size + removed.size,
    answer: (value: boolean | Error) => (answer = value),
    /** The next getAll() answers only when the test says so. */
    holdLookup: () => {
      let release!: () => void;
      lookup = new Promise<DataCollection>((resolve) => {
        release = () => resolve({ data_collection: [...granted] });
      });
      return release;
    },
    revoke: (type: DataType[] = [dataType]) => {
      granted = granted.filter((entry) => !type.includes(entry));
      for (const l of removed) l({ data_collection: type });
    },
  };
}

await test("an already granted data collection permission is the starting state", async () => {
  const fake = fakePermissions([dataType]);
  const consent = await seam(fake.api);
  assert.equal(consent.granted(), true);
});

await test("without a grant sync is off and nothing is requested on its own", async () => {
  const fake = fakePermissions();
  const consent = await seam(fake.api);
  assert.equal(consent.granted(), false);
  assert.deepEqual(fake.requests, []);
});

await test("a permission API that cannot answer means no grant", async () => {
  const consent = await seam({
    permissions: {
      ...fakePermissions().api.permissions,
      getAll: () => Promise.reject(new Error("unavailable")),
    },
  });
  assert.equal(consent.granted(), false);
});

await test("a granted request asks only for technicalAndInteraction and notifies subscribers", async () => {
  const fake = fakePermissions();
  const consent = await seam(fake.api);
  let notified = 0;
  consent.subscribe(() => notified++);
  assert.equal(await consent.request(), true);
  assert.deepEqual(fake.requests, [{ data_collection: [dataType] }]);
  assert.equal(consent.granted(), true);
  assert.ok(notified > 0);
});

await test("the prompt is opened in the same turn as the user gesture, before any await", () => {
  const fake = fakePermissions();
  const consent = firefoxPreferenceSyncConsent(fake.api);
  void consent.request();
  assert.equal(fake.requests.length, 1);
});

await test("a denied or failed request leaves sync off", async () => {
  const fake = fakePermissions();
  const consent = await seam(fake.api);
  fake.answer(false);
  assert.equal(await consent.request(), false);
  assert.equal(consent.granted(), false);
  fake.answer(new Error("not in a user action handler"));
  assert.equal(await consent.request(), false);
  assert.equal(consent.granted(), false);
});

await test("revoking the permission turns sync off and notifies subscribers", async () => {
  const fake = fakePermissions([dataType]);
  const consent = await seam(fake.api);
  let notified = 0;
  consent.subscribe(() => notified++);
  fake.revoke();
  assert.equal(consent.granted(), false);
  assert.ok(notified > 0);
});

await test("a grant made outside the panel, for example in the add-on settings, turns sync on", async () => {
  const fake = fakePermissions();
  const consent = await seam(fake.api);
  await fake.api.permissions.request({ data_collection: [dataType] });
  assert.equal(consent.granted(), true);
});

await test("revoking another data type does not change the state", async () => {
  const fake = fakePermissions([dataType]);
  const consent = await seam(fake.api);
  fake.revoke(["browsingActivity"]);
  assert.equal(consent.granted(), true);
});

await test("unsubscribing stops notifications", async () => {
  const fake = fakePermissions([dataType]);
  const consent = await seam(fake.api);
  let notified = 0;
  const stop = consent.subscribe(() => notified++);
  stop();
  fake.revoke();
  assert.equal(notified, 0);
});

await test("a lookup that never answers does not block the seam: it is usable at once and not granted", () => {
  const fake = fakePermissions([dataType]);
  fake.holdLookup();
  const consent = firefoxPreferenceSyncConsent(fake.api);
  assert.equal(consent.granted(), false);
  assert.equal(consent.requiresGrant, true);
});

await test("a late answer from the lookup updates the state and notifies subscribers", async () => {
  const fake = fakePermissions([dataType]);
  const release = fake.holdLookup();
  const consent = firefoxPreferenceSyncConsent(fake.api);
  let notified = 0;
  consent.subscribe(() => notified++);
  assert.equal(consent.granted(), false);
  release();
  await settle();
  assert.equal(consent.granted(), true);
  assert.ok(notified > 0);
});

await test("a late lookup does not overwrite a newer grant or revocation", async () => {
  const fake = fakePermissions();
  const release = fake.holdLookup();
  const consent = firefoxPreferenceSyncConsent(fake.api);
  assert.equal(await consent.request(), true);
  fake.revoke();
  release();
  await settle();
  assert.equal(consent.granted(), false);
});
