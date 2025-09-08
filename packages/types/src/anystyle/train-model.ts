import z from 'zod'
import { createApiResponseSchema } from '../api'
import { ApiAnystyleTokenSchema } from './parse'

// ----- Request -----
export const ApiAnystyleTrainRequestSchema = z.object({
  tokens: z.array(z.array(ApiAnystyleTokenSchema)).nonempty().describe('Training token sequences'),
}).strict()
export type ApiAnystyleTrainRequest = z.infer<typeof ApiAnystyleTrainRequestSchema>

// ----- Response -----
export const ApiAnystyleTrainDataSchema = z.object({
  modelPath: z.string().describe('Filesystem path or URI to the trained model'),
  modelSizeBytes: z.number().int().nonnegative().describe('Model size in bytes'),
  trainingSequences: z.number().int().nonnegative().describe('Number of sequences used in training'),
  trainingTokens: z.number().int().nonnegative().describe('Number of tokens used in training'),
  trainingMethod: z.string().describe('Description of the training method / pipeline'),
  message: z.string().optional().describe('Informational message about the training result'),
  timestamp: z.string().datetime().describe('Timestamp of training completion (ISO 8601)'),
}).strict()
export type ApiAnystyleTrainData = z.infer<typeof ApiAnystyleTrainDataSchema>

export const ApiAnystyleTrainResponseSchema = createApiResponseSchema(ApiAnystyleTrainDataSchema)
export type ApiAnystyleTrainResponse = z.infer<typeof ApiAnystyleTrainResponseSchema>
