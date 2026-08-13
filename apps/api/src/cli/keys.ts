import process from 'node:process'
import { sql } from '../db/client.js'
import { createApiKey, listApiKeys, revokeApiKey } from '../services/apiKeyService.js'

async function main() {
  const [command, arg] = process.argv.slice(2)

  switch (command) {
    case 'create': {
      const key = await createApiKey()
      console.log('\n=== NEW API KEY (shown once — store it safely) ===')
      console.log(key.fullKey)
      console.log('====================================================\n')
      break
    }
    case 'list': {
      const keys = await listApiKeys()
      for (const k of keys) {
        console.log(
          `${k.id}  ${k.keyPrefix}  ${k.status}  created=${k.createdAt.toISOString()}${k.revokedAt ? `  revoked=${k.revokedAt.toISOString()}` : ''}`,
        )
      }
      break
    }
    case 'revoke': {
      if (!arg) {
        console.error('Usage: keys revoke <id|prefix>')
        console.error('Note: revoking a key prefix revokes all keys sharing it')
        process.exit(1)
      }
      const revoked = await revokeApiKey(arg.trim())
      console.log(revoked ? `Key ${arg.trim()} revoked` : `Key ${arg.trim()} not found or already revoked`)
      break
    }
    default:
      console.error('Usage: keys <create|list|revoke>')
      process.exit(1)
  }
}

main()
  .finally(() => sql.end())
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
