import { ensureStorageVersion } from './storageVersion'

declare const __APP_VERSION__: string

export async function bootstrapStorage() {
  await ensureStorageVersion(__APP_VERSION__, {
    preserve: true,
  })
}
