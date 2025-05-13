/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_BASE_URL: string
  readonly VITE_USER_AGENT: string
  readonly VITE_MAILTO: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
