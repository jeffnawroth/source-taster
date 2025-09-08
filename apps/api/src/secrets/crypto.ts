import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import process from 'node:process'

const ALGO = 'aes-256-gcm'
const MASTER = process.env.MASTER_KEY ?? ''
const SALT = process.env.KEY_DERIVATION_SALT ?? ''
if (!MASTER)
  throw new Error('MASTER_KEY missing')
if (!SALT)
  throw new Error('KEY_DERIVATION_SALT missing')

// stable 32-byte key from MASTER+SALT
const KEY = crypto.scryptSync(MASTER, SALT, 32)

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, KEY, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // [IV(12) | TAG(16) | CIPHERTEXT]
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decrypt(b64: string): string {
  const buf = Buffer.from(b64, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const enc = buf.subarray(28)
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(enc), decipher.final()])
  return dec.toString('utf8')
}
