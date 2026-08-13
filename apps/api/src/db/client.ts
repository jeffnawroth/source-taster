import process from 'node:process'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
if (!connectionString)
  throw new Error('DATABASE_URL is not set')

export const sql = postgres(connectionString, {
  max: 10,
  connect_timeout: 10,
  idle_timeout: 60,
  max_lifetime: 30 * 60,
  connection: {
    application_name: 'source-taster-api',
    options: '-c statement_timeout=30000 -c lock_timeout=10000',
  },
})
export const db = drizzle(sql)
