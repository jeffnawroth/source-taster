/* eslint-disable no-console */

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[source-taster] Hello world from content script')
})()
