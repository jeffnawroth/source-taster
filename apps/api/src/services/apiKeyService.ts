import type { ApiKeyRow } from '../db/schema.js'
import { createHash, randomBytes } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { apiKeys } from '../db/schema.js'
import { httpBadRequest } from '../errors/http.js'

const PREFIX = 'srt_live_'

export function generateApiKey(): { fullKey: string, keyHash: string, keyPrefix: string } {
  const payload = randomBytes(32).toString('base64url')
  const fullKey = `${PREFIX}${payload}`
  return { fullKey, keyHash: hashApiKey(fullKey), keyPrefix: `${PREFIX}…${fullKey.slice(-4)}` }
}

export function hashApiKey(fullKey: string): string {
  return createHash('sha256').update(fullKey).digest('hex')
}

export async function createApiKey(): Promise<{ id: string, fullKey: string, keyPrefix: string }> {
  const { fullKey, keyHash, keyPrefix } = generateApiKey()
  const rows = await db.insert(apiKeys).values({ keyHash, keyPrefix }).returning({ id: apiKeys.id })
  return { id: rows[0]!.id, fullKey, keyPrefix }
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt))
}

export async function revokeApiKey(id: string): Promise<boolean> {
  if (!id)
    throw httpBadRequest('revokeApiKey: id is required')
  const rows = await db.update(apiKeys)
    .set({ status: 'revoked', revokedAt: new Date() })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.status, 'active')))
    .returning({ id: apiKeys.id })
  return rows.length > 0
}

export async function findApiKeyByHash(hash: string): Promise<ApiKeyRow | null> {
  const rows = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, hash)).limit(1)
  return rows[0] ?? null
}
