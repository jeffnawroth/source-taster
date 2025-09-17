/**
 * Crypto utilities for secure API key transmission
 */
import { generateEncryptionKey } from '@source-taster/types'
import CryptoJS from 'crypto-js'
import { runtime } from 'webextension-polyfill'

/**
 * Encrypt API key using AES encryption with Extension ID
 */
export function encryptApiKey(apiKey: string): string {
  const extensionId = runtime.id
  const encryptionKey = generateEncryptionKey(extensionId)
  return CryptoJS.AES.encrypt(apiKey, encryptionKey).toString()
}
