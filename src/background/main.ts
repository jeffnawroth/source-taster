import { sendMessage } from 'webext-bridge/background'
// import type { Tabs } from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

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
      browser.sidePanel.open({ windowId: tab.windowId })
    sendMessage('bibliography', { selectedText: info.selectionText }, { context: 'popup', tabId: tab!.id! })
  }
})
