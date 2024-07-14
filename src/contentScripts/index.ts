/* eslint-disable no-console */
import { createApp } from 'vue'
import { sendMessage } from 'webext-bridge/content-script'
import App from './views/App.vue'
import { setupApp } from '~/logic/common-setup'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[source-taster] Hello world from content script')

  const pageText = document.body.textContent
  sendMessage('autoImportBibliography', { selectedText: pageText! }, { context: 'popup', tabId: 0 })

  const root = document.createElement('div')
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
})()
