/**
 * Shared AI settings schemas for API requests
 */

import type { z } from 'zod'

// Re-export the schema for backward compatibility
export { UserAISettingsSchema } from './ai'

export type UserAISettingsSchemaType = z.infer<typeof import('./ai').UserAISettingsSchema>
