import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

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
