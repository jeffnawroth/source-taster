const STORAGE_KEY = 'source-taster-client-id'

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getClientId(): string {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing)
    return existing
  const id = generateUuid()
  localStorage.setItem(STORAGE_KEY, id)
  return id
}
