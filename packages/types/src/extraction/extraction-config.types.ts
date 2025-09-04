/**
 * Field definitions for metadata extraction
 * Controls which metadata fields should be extracted by the AI
 */
import z from 'zod'
import { CSLVariableSchema } from '../reference'

export const ExtractionConfigSchema = z.object({
  variables: z.array(CSLVariableSchema).describe('CSL variables to extract'),
})

export type ExtractionConfig = z.infer<typeof ExtractionConfigSchema>
