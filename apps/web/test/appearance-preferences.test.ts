// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AccountPreferences,
  AccountPreferencesPatch,
  AccountPreferencesResponse,
} from "@source-taster/contract-service";
import {
  loadGuestPreferences,
  saveGuestPreferences,
  type PreferenceStorage,
} from "@source-taster/ui/preferences";

await test("appearance upgrades old Preferences without resetting other fields and rejects unsupported values", async () => {
  const values = new Map<string, unknown>([
    [
      "source-taster-guest-preferences-v1",
      { language: "de", citationStyle: "ieee" },
    ],
  ]);
  const storage: PreferenceStorage = {
    read: (key) => Promise.resolve(values.get(key)),
    write: (key, value) => {
      values.set(key, value);
      return Promise.resolve();
    },
  };
  const initial = await loadGuestPreferences(storage, ["en-US"]);
  assert.deepEqual(initial.preferences, {
    language: "de",
    citationStyle: "ieee",
    theme: "system",
  });
  await saveGuestPreferences(storage, {
    ...initial.preferences,
    theme: "dark",
  });
  assert.equal(
    (await loadGuestPreferences(storage, ["en-US"])).preferences.theme,
    "dark",
  );
  values.set("source-taster-guest-preferences-v1", {
    ...initial.preferences,
    theme: "invalid",
  });
  assert.equal(
    (await loadGuestPreferences(storage, ["en-US"])).preferences.theme,
    "system",
  );
  assert.equal(
    AccountPreferences.safeParse({ ...initial.preferences, theme: "invalid" })
      .success,
    false,
  );
});

await test("a language-only Account patch never resets appearance to System", () => {
  assert.deepEqual(AccountPreferencesPatch.parse({ language: "en" }), {
    language: "en",
  });
  assert.deepEqual(AccountPreferencesPatch.parse({ theme: "light" }), {
    theme: "light",
  });
  assert.equal(
    AccountPreferencesPatch.safeParse({ theme: "invalid" }).success,
    false,
  );
  assert.equal(AccountPreferencesPatch.safeParse({}).success, false);
  assert.equal(
    AccountPreferencesResponse.parse({
      data: { language: "en", citationStyle: "apa" },
      quota: { status: "not-implemented" },
    }).data.theme,
    "system",
  );
});
