/// <reference types="vite/client" />

/** Build-time development configuration, validated in extension-config.ts. */
declare const __SOURCE_TASTER_EXTENSION__: {
  apiUrl: string;
  mode: "standalone" | "hosted";
  serviceUrl?: string;
  websiteUrl: string;
};
