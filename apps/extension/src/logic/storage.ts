import { DEFAULT_UI_SETTINGS } from '@source-taster/types'
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

declare let chrome: any

// Utility to handle storing and retrieving data in chrome.storage

// Fetch the display option from storage
export function getDisplayOption(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('displayOption', (result: { displayOption: string }) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }
      else {
        resolve(result.displayOption || 'sidepanel') // Default to 'sidepanel' if no value is stored
      }
    })
  })
}

// Save the display option to storage
export function setDisplayOption(newValue: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ displayOption: newValue }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }
      else {
        resolve()
      }
    })
  })
}
