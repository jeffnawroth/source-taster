import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export const autoImportOption = useWebExtensionStorage('auto-import-option', false)
export const themeOption = useWebExtensionStorage('theme-option', 'system')
export const localeOption = useWebExtensionStorage('locale-option', 'en')
export const aiExtractionOption = useWebExtensionStorage('ai-extraction-option', false)
export const geminiApiKey = useWebExtensionStorage('gemini-api-key', '')
export const requestsMadeToday = useWebExtensionStorage('requests-made-today', 0)
export const requestsMadeThisMinute = useWebExtensionStorage('requests-made-this-minute', 0)
export const tokensUsedThisMintue = useWebExtensionStorage('tokens-used-this-minute', 0)
export const isGeminiApiKeyValid = useWebExtensionStorage<null | boolean>('is-gemini-api-key-valid', null)

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
