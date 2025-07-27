/**
 * Field definitions for metadata extraction
 * Controls which metadata fields should be extracted by the AI
 */
import z from 'zod'
import { ReferenceMetadataFieldsSchema } from '../reference'

export const ExtractionConfigSchema = z.object({
  fields: z.array(ReferenceMetadataFieldsSchema).describe('Metadata fields to extract'),
})

export enum FieldCategory {
  ESSENTIAL = 'essential',
  CORE = 'core',
  IDENTIFIER = 'identifier',
  DATE = 'date',
  PUBLICATION = 'publication',
  ACADEMIC = 'academic',
  TECHNICAL = 'technical',
}

export type ExtractionConfig = z.infer<typeof ExtractionConfigSchema>
