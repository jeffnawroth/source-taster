import { DEFAULT_UI_SETTINGS } from '@source-taster/types'
import { storage } from 'webextension-polyfill'
import { useWebExtensionStorage } from '@/extension/composables/useWebExtensionStorage'

export const clientId = useWebExtensionStorage<string>('clientId', () => crypto.randomUUID())

export const settings = useWebExtensionStorage('settings', { ...DEFAULT_UI_SETTINGS })

export const hasCompletedOnboarding = useWebExtensionStorage('onboarding-completed', false)

/**
 * Reset onboarding status (useful for re-running setup)
 */
export function resetOnboarding() {
  hasCompletedOnboarding.value = false
}

// Utility to handle storing and retrieving data in extension storage

// Fetch the display option from storage
export async function getDisplayOption(): Promise<string> {
  const result = await storage.sync.get('displayOption') as { displayOption?: string }
  return result.displayOption ?? 'sidepanel' // Default to 'sidepanel' if no value is stored
}

// Save the display option to storage
export async function setDisplayOption(newValue: string): Promise<void> {
  await storage.sync.set({ displayOption: newValue })
}
