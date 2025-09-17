/**
 * Crypto utilities for API key decryption
 */
import { generateEncryptionKey } from '@source-taster/types'
import CryptoJS from 'crypto-js'

/**
 * Decrypt API key using AES decryption with Extension ID
 */
export function decryptApiKey(encryptedApiKey: string, extensionId: string): string {
  const encryptionKey = generateEncryptionKey(extensionId)
  const decrypted = CryptoJS.AES.decrypt(encryptedApiKey, encryptionKey).toString(CryptoJS.enc.Utf8)

  if (!decrypted) {
    throw new Error('Failed to decrypt API key')
  }

  return decrypted
}
