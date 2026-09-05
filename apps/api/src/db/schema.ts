import { pgEnum, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const apiKeyStatusEnum = pgEnum('api_key_status', ['active', 'revoked'])

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  keyHash: text('key_hash').notNull().unique(),
  keyPrefix: text('key_prefix').notNull(),
  status: apiKeyStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})

export type ApiKeyRow = typeof apiKeys.$inferSelect
export type NewApiKey = typeof apiKeys.$inferInsert

/**
 * BYOK provider keys (formerly stored as encrypted files under `.keystore/`
 * via `key-file-storage`). Only the AES-256-GCM ciphertext lives here — the
 * MASTER_KEY/KEY_DERIVATION_SALT that decrypts it stays in env vars, never DB.
 * Moved to a table because the serverless/container hosts targeted for this
 * service don't guarantee a persistent filesystem across deploys/instances.
 */
export const userAiSecrets = pgTable('user_ai_secrets', {
  userId: text('user_id').notNull(),
  provider: text('provider').notNull(),
  ciphertext: text('ciphertext').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  primaryKey({ columns: [table.userId, table.provider] }),
])

export type UserAiSecretRow = typeof userAiSecrets.$inferSelect
export type NewUserAiSecret = typeof userAiSecrets.$inferInsert
