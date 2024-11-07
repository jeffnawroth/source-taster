import { onMessage, sendMessage } from 'webext-bridge/background'
import { getDisplayOption } from '~/logic/storage'

// import type { Tabs } from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

declare let chrome: any
const USE_SIDE_PANEL = true
let cachedDisplayOption: string = 'sidepanel'

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  // @ts-expect-error missing types
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error(error))
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')

  // Create the "Check Bibliography" context menu item
  browser.contextMenus.create({
    id: 'check-bibliography',
    title: chrome.i18n.getMessage('checkSelectedText'),
    contexts: ['selection'],
  })

  // Create the "Open side panel" context menu item
  browser.contextMenus.create({
    id: 'openSidePanel',
    title: chrome.i18n.getMessage('openSidePanel'),
    contexts: ['all'],
  })
})

// Global error-catcher for unhandled Promise rejections
// eslint-disable-next-line no-restricted-globals
self.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('No window with id: -1')) {
    console.warn('Encountered `No window with id: -1` but proceeding without disruption.')
    event.preventDefault() // Suppresses the error display in the console
  }
})

// Helper function to open the sidepanel with specific validation and fallback
// @ts-expect-error missing types
function attemptSidePanelOpen(windowId: number | null, selectedText?: string, tab?: chrome.tabs.Tab) {
  if (windowId !== null && windowId !== -1) {
    // eslint-disable-next-line no-console
    console.log(`Performing sidepanel open with validated windowId: ${windowId}`)

    try {
      // @ts-expect-error missing types
      browser.sidePanel.open({ windowId }).then(() => {
        // eslint-disable-next-line no-console
        console.log('Sidepanel opened with validated `windowId`...')
        if (selectedText) {
          sendMessage('bibliography', { selectedText }, { context: 'popup', tabId: tab!.id! })
        }
      }).catch((error: any) => {
        console.error('Failed to open sidepanel due to unexpected error:', error)
      })
    }
    catch (error) {
      console.error('Error during sidepanel open attempt:', error)
    }
  }
  else {
    console.warn('Invalid `windowId`, fetching last focused window...')
    chrome.windows.getLastFocused((lastFocusedWindow: { id: number | null }) => {
      if (lastFocusedWindow && lastFocusedWindow.id && lastFocusedWindow.id !== -1) {
        // eslint-disable-next-line no-console
        console.log(`Fallback windowId obtained from last focused window: ${lastFocusedWindow.id}`)
        attemptSidePanelOpen(lastFocusedWindow.id, selectedText, tab) // Retry with valid `windowId`
      }
      else {
        console.error('No valid windowId available for sidepanel open.')
      }
    })
  }
}

// Context menu listener for `check-bibliography` and `openSidePanel` items separately
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'check-bibliography' && info.selectionText) {
    if (cachedDisplayOption === 'popup') {
      // eslint-disable-next-line no-console
      console.log('Opening popup...')
      chrome.action.openPopup().then(() => {
        // @ts-expect-error missing types
        sendMessage('bibliography', { selectedText: info.selectionText }, { context: 'popup', tabId: tab!.id! })
      }).catch((error: any) => {
        console.error('Failed to open the popup:', error)
      })
    }
    else if (cachedDisplayOption === 'sidepanel') {
      // @ts-expect-error missing types
      attemptSidePanelOpen(tab?.windowId, info.selectionText, tab) // Uses fallback logic for sidepanel opening
    }
  }
  else if (info.menuItemId === 'openSidePanel') {
    // @ts-expect-error missing types
    attemptSidePanelOpen(tab?.windowId) // Applies fallback logic specifically for openSidePanel
  }
})

// Logic to handle Popup vs Sidepanel based on the saved user option
function initializeView(displayOption: string) {
  // eslint-disable-next-line no-console
  console.log('Initializing view with option:', displayOption)

  // If 'popup' is selected, set the popup and disable the sidepanel behavior
  if (displayOption === 'popup') {
    // eslint-disable-next-line no-console
    console.log('Popup option selected')
    chrome.action.setPopup({ popup: './dist/popup/index.html' })
    if (chrome.sidePanel) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch((error: any) => {
        console.error('Error disabling side panel:', error)
      })
    }
  }
  // If 'sidepanel' is selected, remove the popup and enable the sidepanel behavior
  else if (displayOption === 'sidepanel' && USE_SIDE_PANEL) {
    browser.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'openSidePanel') {
        // @ts-expect-error missing types
        browser.sidePanel.open({ windowId: tab.windowId })
      }
    })
    // eslint-disable-next-line no-console
    console.log('Side panel option selected')
    chrome.action.setPopup({ popup: '' })
    if (chrome.sidePanel) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: any) => {
        console.error('Error setting side panel behavior:', error)
      })
    }
  }
}

// Load initial user option from storage using the storage utility
getDisplayOption().then((option) => {
  cachedDisplayOption = option
  initializeView(cachedDisplayOption)
}).catch((error) => {
  console.error('Failed to load display option:', error)
})

let currentLocale: string

// Listen for changes in chrome.storage.sync and update the view based on the new selection
chrome.storage.onChanged.addListener((changes: { displayOption?: { newValue: string } }, area: string) => {
  // eslint-disable-next-line no-console
  console.log('chrome.storage.onChanged triggered:', changes)

  if (area === 'sync' && changes.displayOption) {
    const newDisplayOption = changes.displayOption.newValue

    if (newDisplayOption) {
      // eslint-disable-next-line no-console
      console.log('Display option changed:', newDisplayOption)
      cachedDisplayOption = newDisplayOption
      initializeView(newDisplayOption)
    }
    else {
      console.warn('No relevant displayOption change detected, or newValue is undefined.')
    }

    // Remove or create the "Open Sidepanel" context menu item based on the new display option
    if (newDisplayOption === 'popup') {
      // Remove the sidepanel menu item if Popup is active
      browser.contextMenus.remove('openSidePanel').catch((error) => {
        console.warn('Failed to remove openSidePanel menu item:', error)
      })
    }
    else if (newDisplayOption === 'sidepanel') {
      // Re-add the sidepanel menu item if Sidepanel is active
      browser.contextMenus.create({
        id: 'openSidePanel',
        title: chrome.i18n.getMessage('openSidePanel'),
        contexts: ['all'],
      }, async () => {
        const translations = await getTranslations(currentLocale)
        updateContexMenu('openSidePanel', translations.openSidePanel.message)
        if (chrome.runtime.lastError) {
          console.warn('Failed to create openSidePanel menu item:', chrome.runtime.lastError.message)
        }
      })
    }
  }
})

// Listen for messages from the popup to update the context menu with the current language
onMessage('updateContextMenuWithLanguage', async ({ data }) => {
  try {
    currentLocale = data.locale
    const translations = await getTranslations(currentLocale)
    updateContexMenu('openSidePanel', translations.openSidePanel.message)
    updateContexMenu('check-bibliography', translations.checkSelectedText.message)
  }
  catch (error) {
    console.error('Failed to update context menu with language:', error)
  }
})

// Helper function to update the context menu with the current language
function updateContexMenu(id: string, title: string) {
  browser.contextMenus.update(id, { title })
}

// Helper function to fetch translations for the current locale
async function getTranslations(locale: string) {
  try {
    const response = await fetch(`/_locales/${locale}/messages.json`)
    return await response.json()
  }
  catch (error) {
    console.error('Failed to fetch translations:', error)
  }
}
