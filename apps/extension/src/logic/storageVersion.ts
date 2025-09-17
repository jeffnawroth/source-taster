// src/extension/bootstrap/storageVersion.ts
import { storage } from 'webextension-polyfill'

const STORAGE_VERSION_KEY = 'app:version'

// Falls du bestimmte Keys erhalten willst (z. B. clientId), hier rein:
const PRESERVE_KEYS = ['clientId'] as const

type PreserveKey = typeof PRESERVE_KEYS[number]

export async function ensureStorageVersion(appVersion: string, opts?: {
  preserve?: boolean | PreserveKey[] // true = alle PRESERVE_KEYS beibehalten; Array = selektiv
}) {
  const { [STORAGE_VERSION_KEY]: storedVersion } = await storage.local.get(STORAGE_VERSION_KEY)

  // Erste Installation: nur Version setzen, nicht wipen
  if (!storedVersion) {
    await storage.local.set({ [STORAGE_VERSION_KEY]: appVersion })
    return { reset: false as const, from: null, to: appVersion }
  }

  if (storedVersion === appVersion) {
    return { reset: false as const, from: storedVersion, to: appVersion }
  }

  // Versionswechsel → Reset (hart oder mit Preservation)
  let preserved: Record<string, unknown> = {}

  if (opts?.preserve) {
    const keysToKeep: string[]
      = Array.isArray(opts.preserve) ? opts.preserve : [...PRESERVE_KEYS]

    preserved = await storage.local.get(keysToKeep)
  }

  await storage.local.clear()
  await storage.local.set({
    ...preserved,
    [STORAGE_VERSION_KEY]: appVersion,
  })

  return { reset: true as const, from: storedVersion as string, to: appVersion }
}
