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

// API Configuration
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://api.sourcetaster.com'),
  endpoints: {
    extract: '/v1/extract',
    match: '/v1/match',
    search: '/v1/search',
    anystyle: {
      base: '/v1/anystyle',
      parse: '/v1/anystyle/parse',
      convertToCSL: '/v1/anystyle/convert-to-csl',
    },
    user: {
      base: '/v1/user',
      aiSecrets: '/v1/user/ai-secrets',
    },
  },
} as const

export const isFirefox = navigator.userAgent.includes('Firefox')
