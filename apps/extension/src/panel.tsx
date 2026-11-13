// SPDX-License-Identifier: AGPL-3.0-or-later
import React from "react";
import { createRoot } from "react-dom/client";
import { AccountWorkspace } from "@source-taster/ui/web-account-workspace";
import { extensionAccountSession } from "./account-session.ts";
import { CheckWorkspace } from "@source-taster/ui/check-workspace";
import { loadGuestPreferences } from "@source-taster/ui/preferences";
import { guestCredentials } from "@source-taster/ui/guest-identity";
import { setLocale } from "@source-taster/i18n/runtime";
import {
  extensionGuestIdentity,
  extensionPreferenceStorage,
  firefoxPreferenceSyncConsent,
  trustedExtensionPage,
  extensionSelectionIntake,
} from "./platform.ts";
import "./style.css";
const config = __SOURCE_TASTER_EXTENSION__;
const platform = trustedExtensionPage();
const { storage } = platform;
const selectionIntake = extensionSelectionIntake(platform);
const preferenceStorage = extensionPreferenceStorage(storage.local);
const initial = await loadGuestPreferences(
  preferenceStorage,
  navigator.languages,
);
void setLocale(initial.preferences.language, { reload: false });
// Tokens, Check input and results stay in this page's memory.
const guest =
  config.mode === "hosted"
    ? guestCredentials({
        storage: extensionGuestIdentity(storage.local),
        client: "extension",
        serviceUrl: config.serviceUrl!,
      })
    : undefined;
const transport = {
  baseUrl: config.apiUrl,
  client: "extension/0.0.0",
  credentials: guest?.credentials,
};
// Firefox only: Preferences sync waits for the data collection permission. The
// panel renders at once; the grant is learned afterwards.
const preferenceSync =
  __SOURCE_TASTER_TARGET__ === "firefox"
    ? firefoxPreferenceSyncConsent(platform)
    : undefined;
const accountClient = config.accountSignIn
  ? extensionAccountSession(
      config.serviceUrl!,
      storage.local,
      storage.onChanged,
      undefined,
      { sensitive: config.sensitiveAccountActions },
    )
  : undefined;
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {accountClient ? (
      <AccountWorkspace
        initial={initial}
        preferenceStorage={preferenceStorage}
        client={accountClient}
        guest={guest!}
        transport={transport}
        siteUrl={config.websiteUrl}
        brandMark="/icons/extension-64.png"
        upgradeUrl={
          config.mode === "hosted"
            ? `${config.serviceUrl!.replace(/\/$/, "")}/plan`
            : undefined
        }
        accountUrl={
          config.sensitiveAccountActions
            ? `${config.serviceUrl!.replace(/\/$/, "")}/account`
            : undefined
        }
        selectionIntake={selectionIntake}
        preferenceSync={preferenceSync}
      />
    ) : (
      <CheckWorkspace
        initial={initial}
        preferenceStorage={preferenceStorage}
        transport={transport}
        siteUrl={config.websiteUrl}
        brandMark="/icons/extension-64.png"
        upgradeUrl={
          config.mode === "hosted"
            ? `${config.serviceUrl!.replace(/\/$/, "")}/plan`
            : undefined
        }
        selectionIntake={selectionIntake}
      />
    )}
  </React.StrictMode>,
);
