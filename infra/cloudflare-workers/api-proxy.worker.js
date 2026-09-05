export default {
  async fetch(request) {
    const url = new URL(request.url)
    url.hostname = 'source-taster-api-1045296191250.europe-west3.run.app'
    url.port = '443'
    url.protocol = 'https:'

    const proxyRequest = new Request(url, request)
    return fetch(proxyRequest)
  },
}
