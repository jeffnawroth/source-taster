import z from 'zod'
import { ApiAIProviderSchema } from './ai'

export const ApiUserAISecretsSchema = z.object({
  provider: ApiAIProviderSchema,
  apiKey: z.string().min(1),
}).strict()

export type ApiUserAISecrets = z.infer<typeof ApiUserAISecretsSchema>
