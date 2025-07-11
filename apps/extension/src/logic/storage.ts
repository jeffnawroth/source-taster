import type { FieldWeights } from '@source-taster/types'
import { useWebExtensionStorage } from '@/extension/composables/useWebExtensionStorage'

export const themeOption = useWebExtensionStorage('theme-option', 'system')
export const localeOption = useWebExtensionStorage('locale-option', 'en')
export const fieldWeights = useWebExtensionStorage('field-weights', {
  title: 25,
  authors: 20,
  year: 5,
  doi: 15,
  containerTitle: 10,
  volume: 5,
  issue: 3,
  pages: 2,
  arxivId: 8,
  pmid: 3,
  pmcid: 2,
  isbn: 1,
  issn: 1,
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
