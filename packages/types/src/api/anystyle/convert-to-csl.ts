import z from 'zod'
import { CSLItemSchema } from '../../app/csl-json.zod'
import { createApiResponseSchema } from '../api'
import { ApiAnystyleTokenSchema } from './parse'

// ----- Request -----
export const ApiAnystyleConvertRequestSchema = z.object({
  tokens: z.array(z.array(ApiAnystyleTokenSchema)).nonempty().describe('Array of token sequences to convert to CSL'),
}).strict()
export type ApiAnystyleConvertRequest = z.infer<typeof ApiAnystyleConvertRequestSchema>

// ----- Response -----
export const ApiAnystyleConvertDataSchema = z.object({
  csl: z.array(CSLItemSchema).describe('Array of bibliographic items in CSL format'),
}).strict()
export type ApiAnystyleConvertData = z.infer<typeof ApiAnystyleConvertDataSchema>

export const ApiAnystyleConvertResponseSchema = createApiResponseSchema(ApiAnystyleConvertDataSchema)
export type ApiAnystyleConvertResponse = z.infer<typeof ApiAnystyleConvertResponseSchema>
