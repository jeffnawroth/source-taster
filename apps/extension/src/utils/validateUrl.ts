// Checks via a HEAD request if a URL is reachable
export async function isUrlReachable(url: string): Promise<boolean> {
  try {
    const resp = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    })
    return resp.ok
  }
  catch {
    return false
  }
}
