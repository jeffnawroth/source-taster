import type { ApiAIProvider } from '@source-taster/types'
// src/secrets/keystore.ts
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { ApiAIProviderSchema } from '@source-taster/types'
import { BadRequest } from '../errors/AppError'
import { decrypt, encrypt } from './crypto'

const require = createRequire(import.meta.url)
const kfsMod = require('key-file-storage')

// Robust fallback: unterstützt CJS und ESM-Default
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

interface Row { ciphertext: string, createdAt: string }
const store = kfs(DIR, true) as Record<string, Row | undefined>

const cache = new Map<string, { key: string, exp: number }>()
const TTL_MS = 60 * 60 * 1000 // 1h

const keyOf = (userId: string, provider: string) => `${userId}:${provider}`

export async function saveApiKey(userId: string, provider: string, apiKey: string) {
  if (!userId)
    throw BadRequest('saveApiKey: userId missing')
  if (!ApiAIProviderSchema.options.includes(provider as ApiAIProvider)) {
    throw BadRequest(`saveApiKey: invalid provider "${provider}"`)
  }
  const id = keyOf(userId, provider)
  store[id] = { ciphertext: encrypt(apiKey), createdAt: new Date().toISOString() }
  cache.set(id, { key: apiKey, exp: Date.now() + TTL_MS })
}

export async function loadApiKey(userId: string, provider: string): Promise<string | null> {
  const id = keyOf(userId, provider)
  const hit = cache.get(id)
  if (hit && hit.exp > Date.now())
    return hit.key
  const row = store[id]
  if (!row)
    return null
  const key = decrypt(row.ciphertext)
  cache.set(id, { key, exp: Date.now() + TTL_MS })
  return key
}

export async function deleteApiKey(userId: string, provider: string) {
  const id = keyOf(userId, provider)
  delete store[id]
  cache.delete(id)
}
