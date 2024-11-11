export function setupSidepanelVisibilityListener() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Send a message to the background process when the sidepanel is hidden or closed
      // @ts-expect-error missing types
      chrome.runtime.sendMessage({ type: 'SIDE_PANEL_CLOSED' })
    }
  })
}
