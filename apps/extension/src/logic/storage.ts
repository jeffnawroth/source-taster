import type { FieldWeights } from '@source-taster/types'
import { useWebExtensionStorage } from '@/extension/composables/useWebExtensionStorage'

export const themeOption = useWebExtensionStorage('theme-option', 'system')
export const localeOption = useWebExtensionStorage('locale-option', 'en')
export const fieldWeights = useWebExtensionStorage('field-weights', {
  title: 30,
  authors: 25,
  year: 8,
  doi: 12,
  containerTitle: 10,
  volume: 2,
  issue: 1,
  pages: 2,
  arxivId: 8,
  pmid: 6,
  pmcid: 6,
  isbn: 4,
  issn: 3,
} as FieldWeights)

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
