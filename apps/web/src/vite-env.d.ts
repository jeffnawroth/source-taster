/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOURCE_TASTER_MODE?: "standalone" | "hosted";
  readonly VITE_SOURCE_TASTER_SERVICE_URL?: string;
  /** Origin of the public website for help, contact and legal links (#115). */
  readonly VITE_SOURCE_TASTER_WEBSITE_URL?: string;
}
