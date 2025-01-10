/* eslint-disable no-console */
import { sendMessage } from 'webext-bridge/content-script'
import { extractPdfTextFromUrl } from '~/utils/pdfUtils'

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
  oReq.addEventListener('load', async function () {
    if (isPdfFile(this, url)) {
      console.log('pdf')
      const pdfText = await extractPdfTextFromUrl(url)
      sendMessage('autoImportText', { text: pdfText }, { context: 'popup', tabId: 0 })
    }
    else {
      console.log('html')
      const pageText = document.body.innerHTML
      sendMessage('autoImportText', { text: pageText! }, { context: 'popup', tabId: 0 })
    }
  })
  oReq.open('GET', url)
  oReq.send()
})()
