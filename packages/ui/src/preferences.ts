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
