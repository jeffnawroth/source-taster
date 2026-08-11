import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, sql } from './client.js'

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url))

// eslint-disable-next-line antfu/no-top-level-await
await migrate(db, { migrationsFolder })
// eslint-disable-next-line antfu/no-top-level-await
await sql.end()
// eslint-disable-next-line no-console
console.log('Migrations applied')
