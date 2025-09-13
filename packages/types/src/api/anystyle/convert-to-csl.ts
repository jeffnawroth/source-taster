import z from 'zod'
import { CSLItemWithoutIdSchema } from '../../app/csl-json.zod'
import { createApiResponseSchema } from '../api'
import { ApiAnystyleTokenSchema } from './parse'

// ----- Request -----

export const ApiAnystyleConvertReferenceSchema = z.object({
  id: z.uuid().describe('Unique identifier for the reference'),
  tokens: z.array(ApiAnystyleTokenSchema),
}).strict()
export type ApiAnystyleConvertReference = z.infer<typeof ApiAnystyleConvertReferenceSchema>

export const ApiAnystyleConvertRequestSchema = z.object({
  references: z.array(ApiAnystyleConvertReferenceSchema).nonempty(),
}).strict()
export type ApiAnystyleConvertRequest = z.infer<typeof ApiAnystyleConvertRequestSchema>

// ----- Response -----
export const ApiAnystyleConvertDataSchema = z.object({
  csl: z.array(CSLItemWithoutIdSchema).describe('Array of bibliographic items in CSL format'),
}).strict()
export type ApiAnystyleConvertData = z.infer<typeof ApiAnystyleConvertDataSchema>

export const ApiAnystyleConvertResponseSchema = createApiResponseSchema(ApiAnystyleConvertDataSchema)
export type ApiAnystyleConvertResponse = z.infer<typeof ApiAnystyleConvertResponseSchema>
