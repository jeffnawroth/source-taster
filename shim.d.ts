// eslint-disable-next-line unused-imports/no-unused-imports
import type { ProtocolWithReturn } from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    bibliography: { selectedText: string }
    autoImportText: { text: string }
    updateContextMenuWithLanguage: { locale: string }
  }
}
