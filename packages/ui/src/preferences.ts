// SPDX-License-Identifier: AGPL-3.0-or-later

export type InterfaceLanguage = "de" | "en";

import { citationStyles } from "@source-taster/contract-service";
export { citationStyles };
export type CitationStyle = (typeof citationStyles)[number]["id"];
export interface Preferences {
  language: InterfaceLanguage;
  citationStyle: CitationStyle;
  /** FA-KON-02 hook only. There is no theme UI yet. */
  theme: "system";
}

/** Origin storage on web; extension-local storage can implement the same port. */
export interface PreferenceStorage {
  read(key: string): Promise<unknown>;
  write(key: string, value: unknown): Promise<void>;
}
const preferencesKey = "source-taster-guest-preferences-v1";
const onboardingKey = "source-taster-onboarding-seen-v1";
const mirroredKey = "source-taster-preferences-mirrored-v1";

export function isInterfaceLanguage(
  value: unknown,
): value is InterfaceLanguage {
  return value === "de" || value === "en";
}
export function isCitationStyle(value: unknown): value is CitationStyle {
  return citationStyles.some((style) => style.id === value);
}
function browserLanguage(languages: readonly string[]): InterfaceLanguage {
  for (const language of languages) {
    const primary = language.toLowerCase().split("-")[0];
    if (isInterfaceLanguage(primary)) return primary;
  }
  return "en";
}

export async function loadGuestPreferences(
  storage: PreferenceStorage,
  languages: readonly string[],
): Promise<{ preferences: Preferences; citationStyleReset: boolean }> {
  const saved = await storage.read(preferencesKey);
  const data =
    saved !== null && typeof saved === "object"
      ? (saved as Record<string, unknown>)
      : {};
  // Keep the language chosen in the walking skeleton when upgrading its store.
  const language =
    data.language ?? (await storage.read("source-taster-language"));
  return {
    preferences: {
      language: isInterfaceLanguage(language)
        ? language
        : browserLanguage(languages),
      citationStyle: isCitationStyle(data.citationStyle)
        ? data.citationStyle
        : "apa",
      theme: "system",
    },
    citationStyleReset:
      data.citationStyle !== undefined && !isCitationStyle(data.citationStyle),
  };
}

/** Keeps the local copy equal to the synced Preferences the user is shown, but
 * only on a host that gates sync on a grant and only while that grant holds
 * (nothing is stored beyond what is already displayed on this device). A
 * withdrawal made while no panel is open then needs no event: the next panel
 * opens on what the user last saw. The stored marker survives the panel, so a
 * later Account deletion knows the local values are the Account's. */
export async function mirrorSyncedPreferences(
  storage: PreferenceStorage,
  consent: { requiresGrant: boolean; granted: () => boolean },
  preferences: Preferences,
): Promise<boolean> {
  if (!consent.requiresGrant || !consent.granted()) return false;
  await saveGuestPreferences(storage, preferences);
  await storage.write(mirroredKey, true);
  return true;
}

/** #102 Account deletion forgets the Account's Preferences. Where the local
 * values are a mirrored copy of them, that copy goes too and the next panel
 * starts from the defaults, as a fresh Guest. Local values the mirror never
 * wrote stay as they were. */
export async function forgetMirroredPreferences(
  storage: PreferenceStorage,
): Promise<void> {
  if ((await storage.read(mirroredKey)) !== true) return;
  await storage.write(preferencesKey, null);
  await storage.write(mirroredKey, null);
}

/** Sign-out or session end: ADR-0023 makes the displayed values the local
 * Guest Preferences, so they are no longer an Account copy. */
export async function releaseMirroredPreferences(
  storage: PreferenceStorage,
): Promise<void> {
  await storage.write(mirroredKey, null);
}

export async function saveGuestPreferences(
  storage: PreferenceStorage,
  preferences: Preferences,
): Promise<void> {
  if (
    !isInterfaceLanguage(preferences.language) ||
    !isCitationStyle(preferences.citationStyle) ||
    preferences.theme !== "system"
  ) {
    throw new TypeError("Invalid Preferences");
  }
  // Store the closed Preference set only, without an Owner/Guest ID or Check content.
  await storage.write(preferencesKey, {
    language: preferences.language,
    citationStyle: preferences.citationStyle,
    theme: preferences.theme,
  });
}

/** FA-KON-30 hook, local even while signed in. */
export async function hasSeenOnboarding(
  storage: PreferenceStorage,
): Promise<boolean> {
  return (await storage.read(onboardingKey)) === true;
}
export async function markOnboardingSeen(
  storage: PreferenceStorage,
): Promise<void> {
  await storage.write(onboardingKey, true);
}

export function webPreferenceStorage(): PreferenceStorage {
  return {
    read: (key) => {
      try {
        const raw = localStorage.getItem(key);
        if (key === "source-taster-language") return Promise.resolve(raw);
        return Promise.resolve(
          raw === null ? null : (JSON.parse(raw) as unknown),
        );
      } catch {
        // Disabled or damaged browser storage must not prevent a Check.
        return Promise.resolve(null);
      }
    },
    write: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // The current tab still applies a requested setting when storage is disabled.
      }
      return Promise.resolve();
    },
  };
}
