import type { AIModel } from '../types'
import { useWebExtensionStorage } from '@/extension/composables/useWebExtensionStorage'

export const useAutoImport = useWebExtensionStorage('auto-import-option', false)
export const themeOption = useWebExtensionStorage('theme-option', 'system')
export const localeOption = useWebExtensionStorage('locale-option', 'en')
export const useAiExtraction = useWebExtensionStorage('ai-extraction-option', false)
export const selectedAiModel = useWebExtensionStorage('selected-ai-model', { model: 'gemini-2.5-flash', service: 'gemini' } as AIModel)
export const useAutoCheckReferences = useWebExtensionStorage('auto-check-references', false)

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
