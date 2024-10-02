/* eslint-disable no-console */
import { sendMessage } from 'webext-bridge/background'
// import type { Tabs } from 'webextension-polyfill'
import browser from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

declare let chrome: any

let USE_SIDE_PANEL = true

// Function to retrieve the tabId and windowId of the currently active tab
async function getTabAndWindowId() {
  // Query for the currently active tab in the current window
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })

  // If no active tab is found, throw an error
  if (tabs.length === 0)
    throw new Error('No active tab found')

  // Extract the tabId and windowId from the active tab
  const tabId = tabs[0].id
  const windowId = tabs[0].windowId

  // If tabId or windowId is undefined, throw an error to avoid proceeding with undefined values
  if (tabId === undefined || windowId === undefined) {
    throw new Error('tabId or windowId is undefined')
  }

  // Return both tabId and windowId for further operations
  return { tabId, windowId }
}

// Function to open the SidePanel in the current tab
async function openSidePanel() {
  try {
    // Retrieve the tabId and windowId for the current active tab
    const { tabId, windowId } = await getTabAndWindowId()
    console.log(`Opening SidePanel with tabId: ${tabId}, windowId: ${windowId}`)

    // Enable the SidePanel for the current tab and set the content path
    await chrome.sidePanel.setOptions({ enabled: true, tabId, path: 'dist/sidepanel/index.html' })
    // Open the SidePanel for the specified tab and window
    await chrome.sidePanel.open({ tabId, windowId })
    console.log('SidePanel opened')
  }
  catch (error) {
    // Log any errors encountered while trying to open the SidePanel
    console.error('Error opening side panel:', error)
  }
}

// Function to open the Popup while disabling the SidePanel in the current tab
async function openPopup() {
  try {
    // Retrieve the tabId for the current active tab
    const { tabId } = await getTabAndWindowId()

    // Disable the SidePanel for the current tab by setting its enabled option to false
    await chrome.sidePanel.setOptions({ enabled: false, tabId })

    // Set the Popup for the action button and open it
    browser.action.setPopup({ popup: './dist/popup/index.html' })
    await browser.action.openPopup()
    console.log('Popup opened')
  }
  catch (error) {
    // Log any errors encountered while trying to open the Popup
    console.error('Error opening popup:', error)
  }
}

// Function to toggle between SidePanel and Popup based on USE_SIDE_PANEL state
async function updateAction() {
  console.log('Updating action, USE_SIDE_PANEL:', USE_SIDE_PANEL)

  try {
    if (USE_SIDE_PANEL) {
      // If USE_SIDE_PANEL is true, attempt to open the SidePanel
      console.log('Attempting to open side panel')
      await openSidePanel()

      // Disable the Popup by setting its path to an empty string
      browser.action.setPopup({ popup: '' })
    }
    else {
      // If USE_SIDE_PANEL is false, open the Popup instead
      console.log('Attempting to open popup')
      await openPopup()
    }
  }
  catch (error) {
    // Log any errors encountered while trying to update the action (SidePanel/Popup)
    console.error('Error updating action:', error)
  }
}

// Listener to handle the creation of new tabs
browser.tabs.onCreated.addListener(async (tab) => {
  const tabId = tab.id
  if (tabId === undefined)
    return // Exit if the tabId is undefined

  try {
    // Disable the SidePanel for newly created tabs to avoid automatic SidePanel activation
    await chrome.sidePanel.setOptions({ enabled: false, tabId })
    console.log(`SidePanel disabled for newly created tabId: ${tabId}`)
  }
  catch (error) {
    // Log any errors encountered while disabling the SidePanel for the new tab
    console.error(`Error disabling SidePanel for tabId ${tabId}:`, error)
  }
})

// Listener to handle incoming runtime messages (toggle view or get state)
browser.runtime.onMessage.addListener(async (message: any, sender: browser.Runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log('Received message:', message)

  try {
    switch (message.action) {
      case 'toggleView':
        // Toggle the USE_SIDE_PANEL state and update the UI accordingly
        console.log('Toggling view...')
        USE_SIDE_PANEL = !USE_SIDE_PANEL
        await updateAction()
        sendResponse({})
        break
      case 'getState':
        // Return the current state of USE_SIDE_PANEL to the sender
        console.log('Returning current state:', USE_SIDE_PANEL)
        sendResponse({ useSidePanel: USE_SIDE_PANEL })
        break
      default:
        sendResponse({})
    }
  }
  catch (error) {
    // Log any errors encountered while handling the message
    console.error('Error handling message:', error)
    sendResponse({})
  }

  return true
})

// Initialize the action (SidePanel or Popup) based on the default state of USE_SIDE_PANEL
updateAction()

// Listener for when the extension is first installed
browser.runtime.onInstalled.addListener((): void => {
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

// Listener for when the context menu item is clicked
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'check-bibliography' && info.selectionText) {
    sendMessage('bibliography', { selectedText: info.selectionText }, { context: 'popup', tabId: tab!.id! })
  }
})
