import { runtime } from 'webextension-polyfill'

// sidepanelVisibilityListener.ts
export function setupSidepanelVisibilityListener() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Send a message to the background process when the sidepanel is hidden or closed
      void runtime.sendMessage({ type: 'SIDE_PANEL_CLOSED' })
    }
    else if (document.visibilityState === 'visible') {
      void runtime.sendMessage({ type: 'SIDE_PANEL_OPENED' })
    }
  })
}
