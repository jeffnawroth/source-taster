import { sendMessage } from 'webext-bridge/background'
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
    title: 'Check Selected Text',
    contexts: ['selection'],
  })

  // Create the "Open side panel" context menu item
  browser.contextMenus.create({
    id: 'openSidePanel',
    title: 'Open Side Panel',
    contexts: ['all'],
  })
})

// Handle context menu click
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
      // Check if windowId is valid
      let windowId = tab?.windowId && tab.windowId !== -1 ? tab.windowId : null

      if (windowId === null) {
        // Use the last focused window as fallback if windowId is invalid
        chrome.windows.getLastFocused((lastFocusedWindow: { id: number | null }) => {
          if (lastFocusedWindow && lastFocusedWindow.id) {
            windowId = lastFocusedWindow.id
            try {
              // @ts-expect-error missing types
              browser.sidePanel.open({ windowId }).then(() => {
                // eslint-disable-next-line no-console
                console.log('Performing bibliography check in sidepanel...')
                // @ts-expect-error missing types
                sendMessage('bibliography', { selectedText: info.selectionText }, { context: 'popup', tabId: tab!.id! })
              }).catch((error: any) => {
                console.error('Failed to open sidepanel with fallback windowId:', error)
              })
            }
            catch (error) {
              console.error('Error opening sidepanel with fallback windowId:', error)
            }
          }
          else {
            console.warn('Unable to open sidepanel: No valid windowId detected.')
          }
        })
      }
      else {
        // Open sidepanel if a valid windowId is found
        // @ts-expect-error missing types
        browser.sidePanel.open({ windowId }).then(() => {
          // eslint-disable-next-line no-console
          console.log('Performing bibliography check in sidepanel...')
          // @ts-expect-error missing types
          sendMessage('bibliography', { selectedText: info.selectionText }, { context: 'popup', tabId: tab!.id! })
        }).catch((error: any) => {
          console.error('Failed to open sidepanel:', error)
        })
      }
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
    chrome.action.setPopup({ popup: './dist/popup/index.html' })
    if (chrome.sidePanel) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch((error: any) => {
        console.error('Error disabling Sidepanel:', error)
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
    console.log('Sidepanel option selected')
    chrome.action.setPopup({ popup: '' })
    if (chrome.sidePanel) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: any) => {
        console.error('Error setting Sidepanel behavior:', error)
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
        title: 'Open side panel',
        contexts: ['all'],
      }, () => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to create openSidePanel menu item:', chrome.runtime.lastError.message)
        }
      })
    }
  }
})
