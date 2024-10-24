/* eslint-disable no-console */
import { createApp } from 'vue'
import { sendMessage } from 'webext-bridge/content-script'
import { setupApp } from '~/logic/common-setup'
import App from './views/App.vue'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[source-taster] Hello world from content script')

  const pageText = document.body.innerHTML
  console.log('pageText:', pageText)
  sendMessage('autoImportBibliography', { selectedText: pageText! }, { context: 'popup', tabId: 0 })

  const root = document.createElement('div')
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
})()
