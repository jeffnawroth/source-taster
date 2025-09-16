import type { ApiAIProvider } from '@source-taster/types'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { ApiAIProviderSchema } from '@source-taster/types'
import { httpBadRequest } from '../errors/http.js'
import { decrypt, encrypt } from './crypto.js'

const require = createRequire(import.meta.url)
const kfsMod = require('key-file-storage')

// robustes Import-Handling für CJS/ESM
const kfs: (dir: string, caching?: boolean | number) => any
  = typeof kfsMod === 'function'
    ? kfsMod
    : typeof kfsMod?.default === 'function'
      ? kfsMod.default
      : (() => {
          throw new Error(
            `Unexpected export shape from 'key-file-storage': ${Object.keys(kfsMod || {}).join(', ')}`,
          )
        }) as any

const DIR = process.env.KEYSTORE_DIR || path.resolve('.keystore')
fs.mkdirSync(DIR, { recursive: true })

/**
 * ACHTUNG: KFS-Cache AUS (false)!
 * So lesen/löschen wir zuverlässig von Disk und vermeiden „Geisterwerte“.
 */
const Store = kfs(DIR, false)

interface Row { ciphertext: string, createdAt: string }

const TTL_MS = 60 * 60 * 1000 // 1h
const cache = new Map<string, { key: string, exp: number }>()

const keyOf = (userId: string, provider: string) => `${userId}:${provider}`

// --- Helpers für asynchrones Lesen/Schreiben/Löschen (um KFS-API sauber zu nutzen) ---

/** Lies synchron (Objekt-API), aber mit caching=false ist das von Disk. */
function readSync(id: string): Row | undefined {
  try {
    return Store[id] as Row | undefined
  }
  catch {
    return undefined
  }
}

/** Schreib synchron. */
function writeSync(id: string, row: Row) {
  Store[id] = row
}

/** Lösch synchron. */
function deleteSync(id: string) {
  delete Store[id]
}

/** Async-Existenzcheck (KFS-Promise-API) – geht an die Platte. */
async function existsAsync(id: string): Promise<boolean> {
  try {
    const v = await Store(id) // lesen (promise-api)
    return v != null
  }
  catch {
    return false
  }
}

/** Async-Reset/Entfernen (KFS-Promise-API) – löscht Datei. */
async function resetAsync(id: string) {
  await new Store(id)
}

// --- Öffentliche API ---

export async function saveApiKey(userId: string, provider: string, apiKey: string) {
  if (!userId)
    throw httpBadRequest('saveApiKey: userId missing')
  if (!ApiAIProviderSchema.options.includes(provider as ApiAIProvider))
    throw httpBadRequest(`saveApiKey: invalid provider "${provider}"`)

  const id = keyOf(userId, provider)
  const row: Row = { ciphertext: encrypt(apiKey), createdAt: new Date().toISOString() }

  // Schreiben
  writeSync(id, row)

  // In-Memory-Cache setzen
  cache.set(id, { key: apiKey, exp: Date.now() + TTL_MS })
}

export async function loadApiKey(userId: string, provider: string): Promise<string | null> {
  const id = keyOf(userId, provider)

  // 1) eigener Cache
  const hit = cache.get(id)
  if (hit && hit.exp > Date.now())
    return hit.key

  // 2) von Disk lesen (caching=false => „frisch“)
  const row = readSync(id)
  if (!row)
    return null

  const key = decrypt(row.ciphertext)

  // 3) Cache auffüllen
  cache.set(id, { key, exp: Date.now() + TTL_MS })
  return key
}

export async function deleteApiKey(userId: string, provider: string): Promise<boolean> {
  const id = keyOf(userId, provider)

  // Existenz checken – async von Disk
  const existed = await existsAsync(id)

  // 1) Datei löschen (beide Varianten: sync + async reset als „Gürtel & Hosenträger“)
  deleteSync(id)
  await resetAsync(id).catch(() => {}) // falls Datei schon weg ist

  // 2) In-Memory-Cache invalidieren
  cache.delete(id)

  return existed
}
