/// <reference types="vite/client" />

/** The browser this bundle is built for; fixed at build time, never detected. */
declare const __SOURCE_TASTER_TARGET__: "chromium" | "firefox";

/** The extension version from package.json, the one version source. */
declare const __SOURCE_TASTER_VERSION__: string;

/** Build-time development configuration, validated in extension-config.ts. */
declare const __SOURCE_TASTER_EXTENSION__: {
  apiUrl: string;
  mode: "standalone" | "hosted";
  serviceUrl?: string;
  websiteUrl: string;
  accountSignIn: boolean;
  sensitiveAccountActions: boolean;
};
