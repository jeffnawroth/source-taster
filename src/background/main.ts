/* eslint-disable no-console */
// import type { Tabs } from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

let currentWindowId: number | null = null
const USE_SIDE_PANEL = true

// Function to initialize the view based on the selected option (Popup or Sidepanel)
function initializeView(displayOption: string) {
  console.log('Initializing view with option:', displayOption)

  // 1. Close the current popup window if it is open
  if (currentWindowId !== null) {
    console.log('Closing current popup window')
    chrome.windows.remove(currentWindowId, () => {
      if (chrome.runtime.lastError) {
        console.error('Error closing popup:', chrome.runtime.lastError)
      }
      else {
        currentWindowId = null // Popup successfully closed
        console.log('Popup window closed')
      }
    })
  }

  if (displayOption === 'popup') {
    console.log('Popup option selected')

    // 2. Set the popup as the action for the extension icon
    chrome.action.setPopup({ popup: './dist/popup/index.html' }) // Path to your popup
    console.log('Popup set as action popup')

    // 3. Try to disable the side panel by changing its behavior
    if (chrome.sidePanel) {
      console.log('Disabling Sidepanel behavior')
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch((error: any) => {
        console.error('Error disabling Sidepanel:', error)
      })

      // Note: There is no direct way to close the side panel, we only disable its behavior
    }

    // Popup will only open by clicking the extension icon
  }
  else if (displayOption === 'sidepanel' && USE_SIDE_PANEL) {
    console.log('Sidepanel option selected')

    // 4. Remove the popup if the side panel is selected
    chrome.action.setPopup({ popup: '' })
    console.log('Popup removed from action')

    // 5. Enable the side panel to open when the extension icon is clicked
    if (chrome.sidePanel) {
      console.log('Setting Sidepanel to open on icon click')
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: any) => {
        console.error('Error setting Sidepanel behavior:', error)
      })
    }

    // 6. Close the popup window if it is still open
    if (currentWindowId !== null) {
      chrome.windows.remove(currentWindowId, () => {
        if (chrome.runtime.lastError) {
          console.error('Error closing popup:', chrome.runtime.lastError)
        }
        else {
          currentWindowId = null
          console.log('Popup window closed for sidepanel')
        }
      })
    }
  }
}

// Load the initial user options from storage
chrome.storage.sync.get('displayOption', (result: { displayOption: string }) => {
  const displayOption = result.displayOption || 'popup' // Default to 'popup' if nothing is stored
  initializeView(displayOption)
})

// Listen for changes in chrome.storage.sync and update the view based on the new selection
chrome.storage.onChanged.addListener((changes: { displayOption: { newValue: string } }, area: string) => {
  if (area === 'sync' && changes.displayOption) {
    console.log('Display option changed:', changes.displayOption.newValue)
    // Reinitialize the view based on the new selection
    initializeView(changes.displayOption.newValue)
  }
})
