// SPDX-License-Identifier: AGPL-3.0-or-later
import type { PlaywrightTestConfig } from "@playwright/test";

type Projects = NonNullable<PlaywrightTestConfig["projects"]>;

/**
 * The CI e2e job runs Chromium only. Firefox and WebKit are an opt-in local
 * run (`pnpm test:e2e:cross-browser`) and do not qualify any browser.
 */
export const browserProjects: Projects = [
  { name: "chromium", use: { browserName: "chromium" } },
  ...(process.env.SOURCE_TASTER_E2E_CROSS_BROWSER === "true"
    ? ([
        { name: "firefox", use: { browserName: "firefox" } },
        { name: "webkit", use: { browserName: "webkit" } },
      ] satisfies Projects)
    : []),
];
