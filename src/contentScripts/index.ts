/* eslint-disable no-console */
import { createApp } from 'vue'
import App from './views/App.vue'
import { setupApp } from '~/logic/common-setup'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  const root = document.createElement('div')
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
})()
