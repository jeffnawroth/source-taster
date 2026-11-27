// SPDX-License-Identifier: AGPL-3.0-or-later
// Build-time configuration and per-browser manifests. Every value is explicit
// development configuration; no public domain, listing or download is implied.
import { readFileSync } from "node:fs";
import {
  storeListing,
  storeMessageKeys,
  type storeLocales,
} from "./store-listing.ts";

export type Target = "chromium" | "firefox";
/** `development` is the default build; `store` is the release build that the
 * browser stores receive (docs/implementation/259-store-submission.md). */
export type Channel = "development" | "store";

/** The one version source: the manifest, the Check client string and the
 * release file names all read this field. */
export const extensionVersion = (
  JSON.parse(
    readFileSync(new URL("./package.json", import.meta.url), "utf8"),
  ) as { version: string }
).version;

/** Permanent Firefox add-on ID of the store build. AMO ties an add-on to this
 * ID at the first upload and it cannot change afterwards. A GUID keeps it
 * independent of any domain; it is public and no secret. Changing it is only
 * possible before the first AMO upload. */
export const storeGeckoId = "{052624ed-a1ee-4aea-9c15-6630ffbef314}";
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

export function parseChannel(env: Record<string, string | undefined>): Channel {
  const channel = env.SOURCE_TASTER_EXTENSION_CHANNEL ?? "development";
  if (channel === "development" || channel === "store") return channel;
  throw new Error(
    "SOURCE_TASTER_EXTENSION_CHANNEL must be development or store",
  );
}

/** The store channel never falls back to a development default: the owner
 * names every origin, each must be public HTTPS, and only a rehearsal
 * (SOURCE_TASTER_EXTENSION_STORE_REHEARSAL=1) may use the reserved `.invalid`
 * host that can never resolve and so can never be uploaded by mistake. */
export function assertStoreConfig(
  env: Record<string, string | undefined>,
  config: ExtensionConfig,
) {
  const rehearsal = env.SOURCE_TASTER_EXTENSION_STORE_REHEARSAL === "1";
  const required = [
    ["SOURCE_TASTER_EXTENSION_API_URL", config.apiUrl],
    ["SOURCE_TASTER_EXTENSION_WEBSITE_URL", config.websiteUrl],
    ...(config.serviceUrl
      ? [["SOURCE_TASTER_EXTENSION_SERVICE_URL", config.serviceUrl]]
      : []),
  ] as const;
  for (const [name, value] of required) {
    if (!env[name]) throw new Error(`The store channel needs ${name}`);
    const host = new URL(value).hostname;
    if (new URL(value).protocol !== "https:")
      throw new Error(`${name} must be HTTPS in the store channel`);
    const reserved =
      host === "invalid" ||
      host.endsWith(".invalid") ||
      host === "example.com" ||
      host.endsWith(".example") ||
      host.endsWith(".test");
    if (reserved && !rehearsal)
      throw new Error(
        `${name} names a reserved host (${host}); the store channel needs the real origin`,
      );
    if (!reserved && rehearsal)
      throw new Error(
        `${name} is a real host (${host}); a rehearsal uses reserved hosts only`,
      );
  }
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

/** Packaged icons, copied unchanged from the committed brand exports
 * (packages/brand). Package icons end in the Chrome Web Store 128 icon (96 px
 * artwork, 16 px margins); toolbar cuts are separate, PNG for both browsers. */
const icons = (prefix: string, sizes: number[]) =>
  Object.fromEntries(
    sizes.map((size) => [size, `icons/${prefix}-${size}.png`]),
  );
const toolbarSizes = [16, 24, 32, 48, 64];
const packageIcons = icons("extension", [16, 24, 32, 48, 64, 96, 128]);
const toolbarIcons = icons("toolbar-default", toolbarSizes);
/** Firefox theme_icons keys name the theme's text colour: `dark` text means a
 * light toolbar (on-light artwork), `light` text a dark one (on-dark). */
const themeIcons = toolbarSizes.map((size) => ({
  dark: `icons/toolbar-on-light-${size}.png`,
  light: `icons/toolbar-on-dark-${size}.png`,
  size,
}));

/** Every packaged icon path a manifest references. */
export function manifestIcons(generated: ReturnType<typeof manifest>) {
  const action = generated.action as {
    default_icon: Record<string, string>;
    theme_icons?: { dark: string; light: string }[];
  };
  const sidebar = (
    generated as { sidebar_action?: { default_icon: Record<string, string> } }
  ).sidebar_action;
  return [
    ...new Set([
      ...Object.values(generated.icons),
      ...Object.values(action.default_icon),
      ...Object.values(sidebar?.default_icon ?? {}),
      ...(action.theme_icons ?? []).flatMap(({ dark, light }) => [dark, light]),
    ]),
  ];
}

export function manifest(
  target: Target,
  config: ExtensionConfig,
  channel: Channel = "development",
) {
  const store = channel === "store";
  const common = {
    manifest_version: 3,
    default_locale: "en",
    // The store listing reads the localised name and description, and Edge
    // finds a package's languages only through these placeholders.
    name: store
      ? `__MSG_${storeMessageKeys.name}__`
      : "Source Taster (development)",
    version: extensionVersion,
    description: store
      ? `__MSG_${storeMessageKeys.description}__`
      : "Development build of the Source Taster check workspace.",
    icons: packageIcons,
    host_permissions: hostPermissions(target, config),
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
  };
  return target === "chromium"
    ? {
        ...common,
        minimum_chrome_version: "116",
        action: { default_title: "Source Taster", default_icon: toolbarIcons },
        side_panel: { default_path: "panel.html" },
        background: { service_worker: "background.js" },
        permissions: ["sidePanel", "storage", "contextMenus"],
      }
    : {
        ...common,
        browser_specific_settings: {
          gecko: {
            id: store ? storeGeckoId : "development@source-taster.invalid",
            // 140 is the first desktop release with the built-in data
            // collection consent prompt; see docs/research/extension-platform.md 5.5.
            strict_min_version: "140.0",
            data_collection_permissions: dataCollectionPermissions,
          },
        },
        action: {
          default_title: "Source Taster",
          default_area: "navbar",
          default_icon: toolbarIcons,
          theme_icons: themeIcons,
        },
        sidebar_action: {
          default_title: "Source Taster",
          default_panel: "panel.html",
          // MDN documents only default_icon for sidebar_action (no
          // theme_icons), so the colour toolbar cuts serve every theme.
          default_icon: toolbarIcons,
          open_at_install: false,
        },
        background: { scripts: ["background.js"] },
        permissions: ["storage", "menus"],
      };
}

/** `_locales/<locale>/messages.json` of the store channel. */
export function storeMessages(
  locale: (typeof storeLocales)[number],
  menuTitle: string,
) {
  return {
    [storeMessageKeys.name]: { message: storeListing[locale].name },
    [storeMessageKeys.description]: {
      message: storeListing[locale].description,
    },
    check_selected_text: { message: menuTitle },
  };
}
