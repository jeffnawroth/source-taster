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
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  endpoints: {
    extract: '/api/extract',
    match: '/api/match',
    search: '/api/search',
    anystyle: {
      base: '/api/anystyle',
      parse: '/api/anystyle/parse',
      convertToCSL: '/api/anystyle/convert-to-csl',
      train: '/api/anystyle/train-model',
    },
    user: {
      base: '/api/user',
      aiSecrets: '/api/user/ai-secrets',
    },
  },
} as const

export const isFirefox = navigator.userAgent.includes('Firefox')
