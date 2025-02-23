import { isFirefox } from '@/extension/env'
import { getDisplayOption } from '@/extension/logic/storage'
import { onMessage, sendMessage } from 'webext-bridge/background'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

// declare let chrome: any
const USE_SIDE_PANEL = true
let cachedDisplayOption: string = 'sidepanel'
let isSidePanelOpen = false // Track Sidepanel open status
let currentLocale: string

// to toggle the sidepanel with the action button in chromium:
if (USE_SIDE_PANEL) {
  if (!isFirefox) {
    // Chromium: sidePanel API
    // @ts-expect-error missing types
    browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error: unknown) => console.error('sidePanel error:', error))
  }
  else {
    // @ts-expect-error missing types
    if (!globalThis._sidepanelListenerAdded) {
      browser.action.onClicked.addListener(() => {
        browser.sidebarAction.toggle().catch((error: any) => {
          console.error('sidebarAction.toggle error:', error)
        })
      })
      // @ts-expect-error missing types
      globalThis._sidepanelListenerAdded = true
    }
  }
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')

  // Create the "Check Bibliography" context menu item
  browser.contextMenus.create({
    id: 'check-bibliography',
    title: browser.i18n.getMessage('checkSelectedText'),
    contexts: ['selection'],
  })

  // Create the "Open side panel" context menu item
  browser.contextMenus.create({
    id: 'openSidePanel',
    title: browser.i18n.getMessage('openSidePanel'),
    contexts: ['all'],
  })

  // Update context menu state initially
  updateContextMenuState()
})

// Call this function initially after setting the locale to set the language correctly
async function updateContextMenuState() {
  const translations = await getTranslations(currentLocale || 'en')
  const title = translations.openSidePanel?.message || 'Open Side Panel'
  // eslint-disable-next-line no-console
  console.log('Setting menu title for openSidePanel:', title)
  browser.contextMenus.update('openSidePanel', {
    title, // Dynamically set the title based on the language
    enabled: !isSidePanelOpen,
  }).catch((error) => {
    if (error.message.includes('Cannot find menu item with id openSidePanel')) {
      console.warn('Context menu item "openSidePanel" not found. It might not be created yet.')
    }
    else {
      console.warn('Failed to update context menu item:', error)
    }
  })

  // Update "check-bibliography" context menu item
  const bibliographyTitle = translations.checkSelectedText.message
  // eslint-disable-next-line no-console
  console.log('Setting menu title for check-bibliography:', bibliographyTitle)
  browser.contextMenus.update('check-bibliography', {
    title: bibliographyTitle,
  }).catch((error) => {
    if (error.message.includes('Cannot find menu item with id check-bibliography')) {
      console.warn('Context menu item "check-bibliography" not found. It might not be created yet.')
    }
    else {
      console.warn('Failed to update context menu item:', error)
    }
  })
}

// Global error-catcher for unhandled Promise rejections
// eslint-disable-next-line no-restricted-globals
self.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('No window with id: -1')) {
    console.warn('Encountered `No window with id: -1` but proceeding without disruption.')
    event.preventDefault() // Suppresses the error display in the console
  }
})

// Function to open Sidepanel and update state
// @ts-expect-error missing types
function attemptSidePanelOpen(windowId: number | null, selectedText?: string, tab?: browser.tabs.Tab) {
  if (windowId && windowId !== -1) {
    // eslint-disable-next-line no-console
    console.log(`Performing sidepanel open with validated windowId: ${windowId}`)
    // @ts-expect-error missing types

    browser.sidePanel.open({ windowId }).then(() => {
      isSidePanelOpen = true
      updateContextMenuState()
      // eslint-disable-next-line no-console
      console.log('Sidepanel opened with validated `windowId`...')
      if (selectedText && tab) {
        sendMessage('selectedText', { text: selectedText }, { context: 'popup', tabId: tab.id! })
      }
    }).catch((error: any) => {
      console.error('Failed to open sidepanel:', error)
    })
  }
  else {
    console.warn('Invalid `windowId`, attempting fallback to last focused window...')
    browser.windows.getLastFocused({ populate: true })
      .then((lastFocusedWindow) => {
        const windowId = lastFocusedWindow.id ?? null
        if (windowId !== null && windowId !== -1) {
          // eslint-disable-next-line no-console
          console.log(`Fallback windowId obtained: ${windowId}`)
          attemptSidePanelOpen(windowId, selectedText, tab)
        }
        else {
          console.error('No valid windowId available. Sidepanel cannot be opened.')
        }
      })
      .catch((error) => {
        console.error('Error getting last focused window:', error)
      })
  }
}

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'check-bibliography' && info.selectionText) {
    // Check display option and open appropriate UI
    if (cachedDisplayOption === 'popup') {
      // eslint-disable-next-line no-console
      console.log('Opening popup...')
      browser.action.openPopup().then(() => {
        // @ts-expect-error missing types
        sendMessage('selectedText', { text: info.selectionText }, { context: 'popup', tabId: tab!.id! })
      }).catch((error: any) => {
        console.error('Failed to open the popup:', error)
      })
    }
    else if (cachedDisplayOption === 'sidepanel') {
      // @ts-expect-error missing types
      attemptSidePanelOpen(tab?.windowId, info.selectionText, tab)
    }
  }
  else if (info.menuItemId === 'openSidePanel' && !isSidePanelOpen) {
    if (isFirefox) {
      browser.sidebarAction.toggle().then(() => {
        isSidePanelOpen = true
        updateContextMenuState()
      }).catch((error: any) => {
        console.error('Failed to toggle sidebar:', error)
      })
    }
    else {
      // @ts-expect-error missing types
      attemptSidePanelOpen(tab?.windowId)
    }
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
    browser.action.setPopup({ popup: './dist/popup/index.html' })
    // @ts-expect-error missing types
    if (browser.sidePanel) {
      // @ts-expect-error missing types
      browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch((error: any) => {
        console.error('Error disabling side panel:', error)
      })
    }
  }
  // If 'sidepanel' is selected, remove the popup and enable the sidepanel behavior
  else if (displayOption === 'sidepanel' && USE_SIDE_PANEL) {
    // eslint-disable-next-line no-console
    console.log('Side panel option selected')
    browser.action.setPopup({ popup: '' })
    if (isFirefox) {
      // Listener to toggle the view in firefox
      // @ts-expect-error missing types
      if (!globalThis._sidepanelListenerAdded) {
        browser.action.onClicked.addListener(() => {
          browser.sidebarAction.toggle().catch((error: any) => {
            console.error('Error toggling sidebar:', error)
          })
        })
        // @ts-expect-error missing types
        globalThis._sidepanelListenerAdded = true
      }
    }
    else
    // @ts-expect-error missing types
      if (browser.sidePanel) {
      // @ts-expect-error missing types
        browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: any) => {
          console.error('Error setting side panel behavior:', error)
        })
      }
      else {
        console.warn('sidePanel API not available in this browser.')
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

// Listen for changes in browser.storage.sync and update the view based on the new selection
browser.storage.onChanged.addListener((changes: { displayOption?: { newValue: string } }, area: string) => {
  // eslint-disable-next-line no-console
  console.log('browser.storage.onChanged triggered:', changes)

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
        title: browser.i18n.getMessage('openSidePanel'),
        contexts: ['all'],
      }, async () => {
        const translations = await getTranslations(currentLocale)
        updateContexMenu('openSidePanel', translations.openSidePanel.message)
        if (browser.runtime.lastError) {
          console.warn('Failed to create openSidePanel menu item:', browser.runtime.lastError.message)
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
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    return await response.json()
  }
  catch (error) {
    console.error('Failed to fetch translations:', error)
    return {}
  }
}

// Listen for messages from the sidepanel about visibility changes
// @ts-expect-error missing types
browser.runtime.onMessage.addListener((message) => {
  // @ts-expect-error missing types
  if (message.type === 'SIDE_PANEL_CLOSED') {
    isSidePanelOpen = false
    updateContextMenuState()
  }
  // @ts-expect-error missing types
  else if (message.type === 'SIDE_PANEL_OPENED') {
    isSidePanelOpen = true
    updateContextMenuState()
  }
})
