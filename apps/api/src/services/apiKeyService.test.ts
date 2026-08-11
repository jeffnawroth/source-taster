import { describe, expect, it } from 'vitest'
import { generateApiKey, hashApiKey } from './apiKeyService.js'

describe('apiKeyService', () => {
  it('generates keys with srt_live_ prefix and base64url payload', () => {
    const { fullKey } = generateApiKey()
    expect(fullKey).toMatch(/^srt_live_[\w-]{43}$/)
  })

  it('exposes only a prefix, never the full key', () => {
    const { fullKey, keyPrefix } = generateApiKey()
    expect(keyPrefix).not.toContain(fullKey.slice('srt_live_'.length, -4))
    expect(keyPrefix.endsWith(fullKey.slice(-4))).toBe(true)
  })

  it('hashes deterministically and irreversibly', () => {
    const { fullKey, keyHash } = generateApiKey()
    expect(keyHash).toBe(hashApiKey(fullKey))
    expect(keyHash).toMatch(/^[0-9a-f]{64}$/)
    expect(keyHash).not.toContain(fullKey)
  })

  it('generates unique keys', () => {
    const a = generateApiKey().fullKey
    const b = generateApiKey().fullKey
    expect(a).not.toBe(b)
  })
})
