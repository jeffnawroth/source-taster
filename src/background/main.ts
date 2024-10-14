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
    title: 'Check Bibliography',
    contexts: ['selection'],
  })

  // Create the "Open side panel" context menu item
  browser.contextMenus.create({
    id: 'openSidePanel',
    title: 'Open side panel',
    contexts: ['all'],
  })
})

// Handle context menu click
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'check-bibliography' && info.selectionText) {
    if (USE_SIDE_PANEL)
      // @ts-expect-error missing types
      browser.sidePanel.open({ windowId: tab.windowId })
    sendMessage('bibliography', { selectedText: info.selectionText }, { context: 'popup', tabId: tab!.id! })
  }
})

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel') {
    // @ts-expect-error missing types
    browser.sidePanel.open({ windowId: tab.windowId })
  }
})

// New logic to handle Popup vs Sidepanel based on the saved user option
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
getDisplayOption()
  .then(displayOption => initializeView(displayOption))
  .catch(error => console.error('Failed to load display option:', error))

// Listen for changes in chrome.storage.sync and update the view based on the new selection
chrome.storage.onChanged.addListener((changes: { displayOption: { newValue: string } }, area: string) => {
  if (area === 'sync' && changes.displayOption) {
    // eslint-disable-next-line no-console
    console.log('Display option changed:', changes.displayOption.newValue)
    initializeView(changes.displayOption.newValue)
  }
})
