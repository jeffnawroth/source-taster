const forbiddenProtocols = [
  'chrome-extension://',
  'chrome-search://',
  'chrome://',
  'devtools://',
  'edge://',
  'https://chrome.google.com/webstore',
]

export function isForbiddenUrl(url: string): boolean {
  return forbiddenProtocols.some(protocol => url.startsWith(protocol))
}

const viteEnv
  = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_EXTENSION !== undefined
    ? import.meta.env
    // eslint-disable-next-line node/prefer-global/process
    : process.env

export const VITE_EXTENSION = viteEnv.VITE_EXTENSION || ''
export const isFirefox = VITE_EXTENSION === 'firefox'
export const isChrome = VITE_EXTENSION === 'chrome'
