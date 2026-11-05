// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { firefoxPreferenceSyncConsent } from "./platform.ts";

type DataCollection = { data_collection?: string[] };
const dataType = "technicalAndInteraction";

/** The Firefox permissions API as the browser edge: a granted set, a prompt
 * answer, and listeners fired the way about:addons or the prompt would. */
function fakePermissions(initial: string[] = []) {
  let granted = [...initial];
  let answer: boolean | Error = true;
  const requests: DataCollection[] = [];
  const added = new Set<(p: DataCollection) => void>();
  const removed = new Set<(p: DataCollection) => void>();
  const api = {
    permissions: {
      getAll: (): Promise<DataCollection> =>
        Promise.resolve({ data_collection: [...granted] }),
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
    revoke: (type: string[] = [dataType]) => {
      granted = granted.filter((entry) => !type.includes(entry));
      for (const l of removed) l({ data_collection: type });
    },
  };
}

await test("an already granted data collection permission is the starting state", async () => {
  const fake = fakePermissions([dataType]);
  const consent = await firefoxPreferenceSyncConsent(fake.api);
  assert.equal(consent.granted(), true);
});

await test("without a grant sync is off and nothing is requested on its own", async () => {
  const fake = fakePermissions();
  const consent = await firefoxPreferenceSyncConsent(fake.api);
  assert.equal(consent.granted(), false);
  assert.deepEqual(fake.requests, []);
});

await test("a permission API that cannot answer means no grant", async () => {
  const consent = await firefoxPreferenceSyncConsent({
    permissions: {
      ...fakePermissions().api.permissions,
      getAll: () => Promise.reject(new Error("unavailable")),
    },
  });
  assert.equal(consent.granted(), false);
});

await test("a granted request asks only for technicalAndInteraction and notifies subscribers", async () => {
  const fake = fakePermissions();
  const consent = await firefoxPreferenceSyncConsent(fake.api);
  let notified = 0;
  consent.subscribe(() => notified++);
  assert.equal(await consent.request(), true);
  assert.deepEqual(fake.requests, [{ data_collection: [dataType] }]);
  assert.equal(consent.granted(), true);
  assert.ok(notified > 0);
});

await test("the prompt is opened in the same turn as the user gesture, before any await", () => {
  const fake = fakePermissions();
  // The seam is built first, as the panel does at load.
  return firefoxPreferenceSyncConsent(fake.api).then((consent) => {
    void consent.request();
    assert.equal(fake.requests.length, 1);
  });
});

await test("a denied or failed request leaves sync off", async () => {
  const fake = fakePermissions();
  const consent = await firefoxPreferenceSyncConsent(fake.api);
  fake.answer(false);
  assert.equal(await consent.request(), false);
  assert.equal(consent.granted(), false);
  fake.answer(new Error("not in a user action handler"));
  assert.equal(await consent.request(), false);
  assert.equal(consent.granted(), false);
});

await test("revoking the permission turns sync off and notifies subscribers", async () => {
  const fake = fakePermissions([dataType]);
  const consent = await firefoxPreferenceSyncConsent(fake.api);
  let notified = 0;
  consent.subscribe(() => notified++);
  fake.revoke();
  assert.equal(consent.granted(), false);
  assert.ok(notified > 0);
});

await test("a grant made outside the panel, for example in the add-on settings, turns sync on", async () => {
  const fake = fakePermissions();
  const consent = await firefoxPreferenceSyncConsent(fake.api);
  await fake.api.permissions.request({ data_collection: [dataType] });
  assert.equal(consent.granted(), true);
});

await test("revoking another data type does not change the state", async () => {
  const fake = fakePermissions([dataType]);
  const consent = await firefoxPreferenceSyncConsent(fake.api);
  fake.revoke(["browsingActivity"]);
  assert.equal(consent.granted(), true);
});

await test("unsubscribing stops notifications", async () => {
  const fake = fakePermissions([dataType]);
  const consent = await firefoxPreferenceSyncConsent(fake.api);
  let notified = 0;
  const stop = consent.subscribe(() => notified++);
  stop();
  fake.revoke();
  assert.equal(notified, 0);
});
