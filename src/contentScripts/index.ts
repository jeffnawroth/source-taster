/* eslint-disable no-console */
import { createApp } from 'vue'
import { sendMessage } from 'webext-bridge/content-script'
import { setupApp } from '~/logic/common-setup'
import App from './views/App.vue'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[source-taster] Hello world from content script')

  interface Response {
    getResponseHeader: (header: string) => string | null
  }

  function isPdfFile(response: Response, url: string): boolean {
    const header = response.getResponseHeader('content-type')
    if (header) {
      const headerValue = header.toLowerCase().split(';', 1)[0].trim()
      return (
        headerValue === 'application/pdf'
        || (headerValue === 'application/octet-stream' && url.toLowerCase().indexOf('.pdf') > 0)
      )
    }
    return false
  }

  const oReq = new XMLHttpRequest()
  const url = window.location.toString()
  oReq.addEventListener('load', function () {
    if (isPdfFile(this, url)) {
      console.log('pdf')
      sendMessage('autoImportPDFText', { url, type: 'pdf' }, { context: 'popup', tabId: 0 })
    }
    else {
      console.log('html')
      const pageText = document.body.innerHTML
      sendMessage('autoImportBibliography', { selectedText: pageText!, url, type: 'html' }, { context: 'popup', tabId: 0 })
    }
  })
  oReq.open('GET', url)
  oReq.send()

  const root = document.createElement('div')
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
})()
