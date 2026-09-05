import type { ApiAIProvider } from '@source-taster/types'
import { ApiAIProviderSchema } from '@source-taster/types'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { userAiSecrets } from '../db/schema.js'
import { httpBadRequest } from '../errors/http.js'
import { decrypt, encrypt } from './crypto.js'

const TTL_MS = 60 * 60 * 1000 // 1h
const cache = new Map<string, { key: string, exp: number }>()

const keyOf = (userId: string, provider: string) => `${userId}:${provider}`

export async function saveApiKey(userId: string, provider: string, apiKey: string) {
  if (!userId)
    throw httpBadRequest('saveApiKey: userId missing')
  if (!ApiAIProviderSchema.options.includes(provider as ApiAIProvider))
    throw httpBadRequest(`saveApiKey: invalid provider "${provider}"`)

  const ciphertext = encrypt(apiKey)

  await db
    .insert(userAiSecrets)
    .values({ userId, provider, ciphertext })
    .onConflictDoUpdate({
      target: [userAiSecrets.userId, userAiSecrets.provider],
      set: { ciphertext, createdAt: new Date() },
    })

  cache.set(keyOf(userId, provider), { key: apiKey, exp: Date.now() + TTL_MS })
}

export async function loadApiKey(userId: string, provider: string): Promise<string | null> {
  const id = keyOf(userId, provider)

  const hit = cache.get(id)
  if (hit && hit.exp > Date.now())
    return hit.key

  const [row] = await db
    .select({ ciphertext: userAiSecrets.ciphertext })
    .from(userAiSecrets)
    .where(and(eq(userAiSecrets.userId, userId), eq(userAiSecrets.provider, provider)))
    .limit(1)

  if (!row)
    return null

  const key = decrypt(row.ciphertext)
  cache.set(id, { key, exp: Date.now() + TTL_MS })
  return key
}

export async function deleteApiKey(userId: string, provider: string): Promise<boolean> {
  const deleted = await db
    .delete(userAiSecrets)
    .where(and(eq(userAiSecrets.userId, userId), eq(userAiSecrets.provider, provider)))
    .returning({ userId: userAiSecrets.userId })

  cache.delete(keyOf(userId, provider))

  return deleted.length > 0
}
