/**
 * Shared crypto utilities for API key encryption/decryption
 */
import CryptoJS from 'crypto-js'

const ENCRYPTION_SALT = 'source-taster-v1-2025'

/**
 * Generate encryption key from Extension ID
 * Used by both frontend and backend for consistent encryption/decryption
 */
export function generateEncryptionKey(extensionId: string): string {
  const combined = `${extensionId}:${ENCRYPTION_SALT}`
  return CryptoJS.SHA256(combined).toString()
}
