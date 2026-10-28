// SPDX-License-Identifier: AGPL-3.0-or-later
import React from "react";
import { createRoot } from "react-dom/client";
import { CheckWorkspace } from "@source-taster/ui/check-workspace";
import {
  loadGuestPreferences,
  webPreferenceStorage,
} from "@source-taster/ui/preferences";
import {
  guestCredentials,
  webGuestIdentityStorage,
} from "@source-taster/ui/guest-identity";
import { setLocale } from "@source-taster/i18n/runtime";
import "./style.css";
const preferenceStorage = webPreferenceStorage();
const initial = await loadGuestPreferences(
  preferenceStorage,
  navigator.languages,
);
void setLocale(initial.preferences.language, { reload: false });
const mode = import.meta.env.VITE_SOURCE_TASTER_MODE ?? "standalone";
if (mode !== "standalone" && mode !== "hosted")
  throw new Error("Choose standalone or hosted client mode");
const serviceUrl = import.meta.env.VITE_SOURCE_TASTER_SERVICE_URL;
if (mode === "hosted" && !serviceUrl)
  throw new Error("Hosted client requires a service URL");
const guest =
  mode === "hosted"
    ? guestCredentials({
        storage: webGuestIdentityStorage(),
        client: "web",
        serviceUrl: serviceUrl!,
      })
    : undefined;
const transport = { client: "web/0.0.0", credentials: guest?.credentials };
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CheckWorkspace
      initial={initial}
      preferenceStorage={preferenceStorage}
      transport={transport}
      siteUrl={import.meta.env.VITE_SOURCE_TASTER_WEBSITE_URL}
    />
  </React.StrictMode>,
);
