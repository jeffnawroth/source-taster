// csl-json.zod.ts
// Zod schema for CSL-JSON (based on schema v1.0: csl-data.json)
// Runtime validation that mirrors the TypeScript types. Uses .strict() to emulate "additionalProperties: false".

import { z } from 'zod'

export const CSLItemTypeSchema = z.enum([
  'article',
  'article-journal',
  'article-magazine',
  'article-newspaper',
  'bill',
  'book',
  'broadcast',
  'chapter',
  'classic',
  'collection',
  'dataset',
  'document',
  'entry',
  'entry-dictionary',
  'entry-encyclopedia',
  'event',
  'figure',
  'graphic',
  'hearing',
  'interview',
  'legal_case',
  'legislation',
  'manuscript',
  'map',
  'motion_picture',
  'musical_score',
  'pamphlet',
  'paper-conference',
  'patent',
  'performance',
  'periodical',
  'personal_communication',
  'post',
  'post-weblog',
  'regulation',
  'report',
  'review',
  'review-book',
  'software',
  'song',
  'speech',
  'standard',
  'thesis',
  'treaty',
  'webpage',
])

const CSLNameSchema = z
  .object({
    'family': z.string().optional(),
    'given': z.string().optional(),
    'dropping-particle': z.string().optional(),
    'non-dropping-particle': z.string().optional(),
    'suffix': z.string().optional(),
    'comma-suffix': z.union([z.string(), z.number(), z.boolean()]).optional(),
    'static-ordering': z.union([z.string(), z.number(), z.boolean()]).optional(),
    'literal': z.string().optional(),
    'parse-names': z.union([z.string(), z.number(), z.boolean()]).optional(),
  })
  .strict()

const CSLDateSchema = z
  .object({
    'date-parts': z
      .array(z.array(z.union([z.string(), z.number()])).min(1).max(3))
      .min(1)
      .max(2)
      .optional(),
    'season': z.union([z.string(), z.number()]).optional(),
    'circa': z.union([z.string(), z.number(), z.boolean()]).optional(),
    'literal': z.string().optional(),
    'raw': z.string().optional(),
  })
  .strict()

// Some processors accept EDTF date strings; allow string OR structured date
const CSLDateValue = z.union([CSLDateSchema, z.string()])

export const CSLItemSchema = z
  .object({
    // required
    'type': CSLItemTypeSchema,
    'id': z.union([z.string(), z.number()]),

    // optional common metadata
    'citation-key': z.string().optional(),
    'categories': z.array(z.string()).optional(),
    'language': z.string().optional(),
    'journalAbbreviation': z.string().optional(),
    'shortTitle': z.string().optional(),

    // contributors
    'author': z.array(CSLNameSchema).optional(),
    'chair': z.array(CSLNameSchema).optional(),
    'collection-editor': z.array(CSLNameSchema).optional(),
    'compiler': z.array(CSLNameSchema).optional(),
    'composer': z.array(CSLNameSchema).optional(),
    'container-author': z.array(CSLNameSchema).optional(),
    'contributor': z.array(CSLNameSchema).optional(),
    'curator': z.array(CSLNameSchema).optional(),
    'director': z.array(CSLNameSchema).optional(),
    'editor': z.array(CSLNameSchema).optional(),
    'editorial-director': z.array(CSLNameSchema).optional(),
    'executive-producer': z.array(CSLNameSchema).optional(),
    'guest': z.array(CSLNameSchema).optional(),
    'host': z.array(CSLNameSchema).optional(),
    'interviewer': z.array(CSLNameSchema).optional(),
    'illustrator': z.array(CSLNameSchema).optional(),
    'narrator': z.array(CSLNameSchema).optional(),
    'organizer': z.array(CSLNameSchema).optional(),
    'original-author': z.array(CSLNameSchema).optional(),
    'performer': z.array(CSLNameSchema).optional(),
    'producer': z.array(CSLNameSchema).optional(),
    'recipient': z.array(CSLNameSchema).optional(),
    'reviewed-author': z.array(CSLNameSchema).optional(),
    'script-writer': z.array(CSLNameSchema).optional(),
    'series-creator': z.array(CSLNameSchema).optional(),
    'translator': z.array(CSLNameSchema).optional(),

    // dates
    'accessed': CSLDateValue.optional(),
    'available-date': CSLDateValue.optional(),
    'event-date': CSLDateValue.optional(),
    'issued': CSLDateValue.optional(),
    'original-date': CSLDateValue.optional(),
    'submitted': CSLDateValue.optional(),

    // strings & numbers
    'abstract': z.string().optional(),
    'annote': z.string().optional(),
    'archive': z.string().optional(),
    'archive_collection': z.string().optional(),
    'archive_location': z.string().optional(),
    'archive-place': z.string().optional(),
    'authority': z.string().optional(),
    'call-number': z.string().optional(),
    'chapter-number': z.union([z.string(), z.number()]).optional(),
    'citation-number': z.union([z.string(), z.number()]).optional(),
    'citation-label': z.string().optional(),
    'collection-number': z.union([z.string(), z.number()]).optional(),
    'collection-title': z.string().optional(),
    'container-title': z.string().optional(),
    'container-title-short': z.string().optional(),
    'dimensions': z.string().optional(),
    'division': z.string().optional(),
    'DOI': z.string().optional(),
    'edition': z.union([z.string(), z.number()]).optional(),
    'event': z.string().optional(), // deprecated in schema note
    'event-title': z.string().optional(),
    'event-place': z.string().optional(),
    'first-reference-note-number': z.union([z.string(), z.number()]).optional(),
    'genre': z.string().optional(),
    'ISBN': z.string().optional(),
    'ISSN': z.string().optional(),
    'issue': z.union([z.string(), z.number()]).optional(),
    'jurisdiction': z.string().optional(),
    'keyword': z.string().optional(),
    'locator': z.union([z.string(), z.number()]).optional(),
    'medium': z.string().optional(),
    'note': z.string().optional(),
    'number': z.union([z.string(), z.number()]).optional(),
    'number-of-pages': z.union([z.string(), z.number()]).optional(),
    'number-of-volumes': z.union([z.string(), z.number()]).optional(),
    'original-publisher': z.string().optional(),
    'original-publisher-place': z.string().optional(),
    'original-title': z.string().optional(),
    'page': z.union([z.string(), z.number()]).optional(),
    'page-first': z.union([z.string(), z.number()]).optional(),
    'part': z.union([z.string(), z.number()]).optional(),
    'part-title': z.string().optional(),
    'PMCID': z.string().optional(),
    'PMID': z.string().optional(),
    'printing': z.union([z.string(), z.number()]).optional(),
    'publisher': z.string().optional(),
    'publisher-place': z.string().optional(),
    'references': z.string().optional(),
    'reviewed-genre': z.string().optional(),
    'reviewed-title': z.string().optional(),
    'scale': z.string().optional(),
    'section': z.string().optional(),
    'source': z.string().optional(),
    'status': z.string().optional(),
    'supplement': z.union([z.string(), z.number()]).optional(),
    'title': z.string().optional(),
    'title-short': z.string().optional(),
    'URL': z.string().optional(),
    'version': z.string().optional(),
    'volume': z.union([z.string(), z.number()]).optional(),
    'volume-title': z.string().optional(),
    'volume-title-short': z.string().optional(),
    'year-suffix': z.string().optional(),

    // custom free-form
    'custom': z.record(z.unknown()).optional(),
  })
  .strict()

export const CSLSchema = z.array(CSLItemSchema)

// All keys of the CSL item as a Zod enum
export const CSLVariableSchema = CSLItemSchema.keyof()

export type CSLItemType = z.infer<typeof CSLItemTypeSchema>
export type CSLName = z.infer<typeof CSLNameSchema>
export type CSLDate = z.infer<typeof CSLDateSchema>
export type CSLItem = z.infer<typeof CSLItemSchema>
export type CSL = z.infer<typeof CSLSchema>

// All keys of the CSL item as a Zod enum
export type CSLVariable = z.infer<typeof CSLVariableSchema>
