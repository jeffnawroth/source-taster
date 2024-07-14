import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export const autoImportOption = useWebExtensionStorage('auto-import-option', false)
