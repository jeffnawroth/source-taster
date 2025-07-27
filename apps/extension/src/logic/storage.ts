import { DEFAULT_EXTRACTION_SETTINGS, DEFAULT_MATCHING_SETTINGS } from '@source-taster/types'
import { useWebExtensionStorage } from '@/extension/composables/useWebExtensionStorage'

/**
 * Theme option storage
 */
export const themeOption = useWebExtensionStorage('theme-option', 'system')

/**
 * Locale option storage
 */
export const localeOption = useWebExtensionStorage('locale-option', 'en')

/**
 * Extraction settings storage
 */
export const extractionSettings = useWebExtensionStorage('extraction-settings', { ...DEFAULT_EXTRACTION_SETTINGS })

/**
 * Matching settings storage
 */
export const matchingSettings = useWebExtensionStorage('matching-settings', { ...DEFAULT_MATCHING_SETTINGS })

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
