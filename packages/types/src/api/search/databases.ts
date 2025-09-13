// ----- Request -----

// packages/types/src/api/search-databases.ts
import z from 'zod'
import { createApiResponseSchema } from '../api'
import { ApiSearchSourceSchema } from './search'

// ----- Request -----

export const ApiSearchDatabaseInfoSchema = z.object({
  name: ApiSearchSourceSchema.describe('Unique name of the database'),
  priority: z.number().int().min(1).describe('Lower number = higher priority'),
  endpoint: z.string().min(1).describe('Endpoint to search the specific database'),
}).strict()
export type ApiSearchDatabaseInfo = z.infer<typeof ApiSearchDatabaseInfoSchema>

export const ApiSearchDatabasesDataSchema = z.object({
  databases: z.array(ApiSearchDatabaseInfoSchema).describe('Available databases with priority'),
  total: z.number().int().min(0).describe('Total count of databases'),
}).strict()
export type ApiSearchDatabasesData = z.infer<typeof ApiSearchDatabasesDataSchema>

// ----- Response -----
export const ApiSearchDatabasesResponseSchema = createApiResponseSchema(ApiSearchDatabasesDataSchema)
export type ApiSearchDatabasesResponse = z.infer<typeof ApiSearchDatabasesResponseSchema>
