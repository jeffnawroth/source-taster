// SPDX-License-Identifier: AGPL-3.0-or-later
import React from "react";
import { createRoot } from "react-dom/client";
import { CheckWorkspace } from "@source-taster/ui/check-workspace";
import { loadGuestPreferences } from "@source-taster/ui/preferences";
import { guestCredentials } from "@source-taster/ui/guest-identity";
import { setLocale } from "@source-taster/i18n/runtime";
import {
  extensionGuestIdentity,
  extensionPreferenceStorage,
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
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CheckWorkspace
      initial={initial}
      preferenceStorage={preferenceStorage}
      transport={transport}
      siteUrl={config.websiteUrl}
      selectionIntake={selectionIntake}
    />
  </React.StrictMode>,
);
