// SPDX-License-Identifier: AGPL-3.0-or-later
// Build-time configuration and per-browser manifests. Every value is explicit
// development configuration; no public domain, listing or download is implied.
export type Target = "chromium" | "firefox";
export interface ExtensionConfig {
  apiUrl: string;
  mode: "standalone" | "hosted";
  serviceUrl?: string;
  websiteUrl: string;
  accountSignIn: boolean;
  sensitiveAccountActions: boolean;
}

const loopback = new Set(["127.0.0.1", "localhost", "[::1]"]);
function origin(name: string, value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL`);
  }
  if (!(
    url.protocol === "https:" ||
    (url.protocol === "http:" && loopback.has(url.hostname))
  ))
    throw new Error(`${name} must use HTTPS, or HTTP on loopback only`);
  if (url.origin !== value.replace(/\/$/, ""))
    throw new Error(`${name} must be an origin without path, query or user`);
  return url.origin;
}

export function parseTarget(mode: string): Target {
  if (mode === "chromium" || mode === "firefox") return mode;
  throw new Error(`Extension target must be chromium or firefox, not ${mode}`);
}

export function extensionConfig(
  env: Record<string, string | undefined>,
): ExtensionConfig {
  const mode = env.SOURCE_TASTER_EXTENSION_MODE ?? "standalone";
  if (mode !== "standalone" && mode !== "hosted")
    throw new Error(
      "SOURCE_TASTER_EXTENSION_MODE must be standalone or hosted",
    );
  if (mode === "hosted" && !env.SOURCE_TASTER_EXTENSION_SERVICE_URL)
    throw new Error("Hosted mode needs SOURCE_TASTER_EXTENSION_SERVICE_URL");
  const signIn = env.SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN;
  if (signIn !== undefined && signIn !== "enabled" && signIn !== "disabled")
    throw new Error(
      "SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN must be enabled or disabled",
    );
  const sensitive = env.SOURCE_TASTER_EXTENSION_SENSITIVE_ACCOUNT_ACTIONS;
  if (
    sensitive !== undefined &&
    sensitive !== "enabled" &&
    sensitive !== "disabled"
  )
    throw new Error(
      "SOURCE_TASTER_EXTENSION_SENSITIVE_ACCOUNT_ACTIONS must be enabled or disabled",
    );
  if (sensitive === "enabled" && !(mode === "hosted" && signIn === "enabled"))
    throw new Error(
      "Sensitive Account actions need hosted mode with Account sign-in enabled",
    );
  return {
    // Private #102 implementation and both-program acceptance must precede activation.
    sensitiveAccountActions: sensitive === "enabled",
    // Private #98 implementation and both-program acceptance must precede activation.
    accountSignIn: mode === "hosted" && signIn === "enabled",
    // Defaults match the local web development API and Vite origin.
    apiUrl: origin(
      "SOURCE_TASTER_EXTENSION_API_URL",
      env.SOURCE_TASTER_EXTENSION_API_URL ?? "http://127.0.0.1:3100",
    ),
    mode,
    serviceUrl:
      mode === "hosted"
        ? origin(
            "SOURCE_TASTER_EXTENSION_SERVICE_URL",
            env.SOURCE_TASTER_EXTENSION_SERVICE_URL!,
          )
        : undefined,
    websiteUrl: origin(
      "SOURCE_TASTER_EXTENSION_WEBSITE_URL",
      env.SOURCE_TASTER_EXTENSION_WEBSITE_URL ?? "http://127.0.0.1:5173",
    ),
  };
}

/** Host access only for the verification API, which has no CORS. Guest token
 * issuance answers CORS for configured extension origins and needs none. */
export function hostPermissions(target: Target, config: ExtensionConfig) {
  const api = new URL(config.apiUrl);
  // Firefox match patterns cannot carry a port; Chromium's can.
  return [
    target === "chromium"
      ? `${api.origin}/*`
      : `${api.protocol}//${api.hostname}/*`,
  ];
}

/** Firefox built-in data collection consent (desktop 140+, Android 142+).
 * Required, because the Check and sign-in flows cannot run without sending:
 * - websiteContent: the text the user selects or submits for checking;
 * - authenticationInfo and personallyIdentifyingInfo: the e-mail address and
 *   one-time code for Account sign-in.
 * Optional, requested from a user action before Account Preferences sync:
 * - technicalAndInteraction: Mozilla lists "extension usage and settings data"
 *   here, and this type may only be declared as optional.
 * Declared statically for every Firefox build, including standalone builds
 * without sign-in, so the declaration never under-reports. Sources:
 * https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings */
const dataCollectionPermissions = {
  required: [
    "authenticationInfo",
    "personallyIdentifyingInfo",
    "websiteContent",
  ],
  optional: ["technicalAndInteraction"],
};

export function manifest(target: Target, config: ExtensionConfig) {
  const common = {
    manifest_version: 3,
    default_locale: "en",
    name: "Source Taster (development)",
    version: "0.0.0",
    description: "Development build of the Source Taster check workspace.",
    host_permissions: hostPermissions(target, config),
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
  };
  return target === "chromium"
    ? {
        ...common,
        minimum_chrome_version: "116",
        action: { default_title: "Source Taster" },
        side_panel: { default_path: "panel.html" },
        background: { service_worker: "background.js" },
        permissions: ["sidePanel", "storage", "contextMenus"],
      }
    : {
        ...common,
        browser_specific_settings: {
          gecko: {
            id: "development@source-taster.invalid",
            // 140 is the first desktop release with the built-in data
            // collection consent prompt; see docs/research/extension-platform.md 5.5.
            strict_min_version: "140.0",
            data_collection_permissions: dataCollectionPermissions,
          },
        },
        action: { default_title: "Source Taster", default_area: "navbar" },
        sidebar_action: {
          default_title: "Source Taster",
          default_panel: "panel.html",
          open_at_install: false,
        },
        background: { scripts: ["background.js"] },
        permissions: ["storage", "menus"],
      };
}
