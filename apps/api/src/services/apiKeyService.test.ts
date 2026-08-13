import { describe, expect, it } from 'vitest'
import { InvariantError } from '../errors/domain.js'
import { generateApiKey, hashApiKey, isApiKeyId, revokeApiKey } from './apiKeyService.js'

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

  describe('isApiKeyId', () => {
    it('accepts a lowercase UUID', () => {
      expect(isApiKeyId('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('accepts an uppercase UUID', () => {
      expect(isApiKeyId('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    })

    it('rejects a UUID-like string with a non-hex character', () => {
      expect(isApiKeyId('550e8400-e29b-41d4-a716-44665544000g')).toBe(false)
    })

    it('rejects a key prefix', () => {
      expect(isApiKeyId('srt_live_…abcd')).toBe(false)
    })

    it('rejects an empty string', () => {
      expect(isApiKeyId('')).toBe(false)
    })
  })

  it('revokeApiKey rejects an empty argument with InvariantError', async () => {
    const promise = revokeApiKey('')
    await expect(promise).rejects.toBeInstanceOf(InvariantError)
    await expect(promise).rejects.toThrow('revokeApiKey: id or key prefix is required')
  })
})
