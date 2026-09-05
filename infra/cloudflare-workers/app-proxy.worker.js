export default {
  async fetch(request) {
    const url = new URL(request.url)
    url.hostname = 'sourcetaster-web.pages.dev'
    url.pathname = url.pathname.replace(/^\/app/, '') || '/'

    const proxyRequest = new Request(url, request)
    return fetch(proxyRequest)
  },
}
