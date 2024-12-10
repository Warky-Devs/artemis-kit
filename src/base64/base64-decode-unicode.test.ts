import { describe, it, expect } from 'vitest'
import { b64DecodeUnicode } from './base64-decode-unicode'

describe('b64DecodeUnicode', () => {
  it('should decode a base64 encoded Unicode string', () => {
    const encoded = '4pyTIMOgIGxhIG1vZGU='
    const decoded = b64DecodeUnicode(encoded)
    expect(decoded).toBe('✓ à la mode')
  })
})