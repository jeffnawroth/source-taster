// eslint-disable-next-line unused-imports/no-unused-imports
import type { ProtocolWithReturn } from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    bibliography: { selectedText: string }
    autoImportBibliography: { selectedText: string, url: string, type: string }
    autoImportPDFText: { url: string, type: string }
    updateContextMenuWithLanguage: { locale: string }
  }
}
