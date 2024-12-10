import { describe, it, expect } from 'vitest'
import { b64EncodeUnicode } from './base64-encode-unicode'

describe('b64EncodeUnicode', () => {
  it('should encode a Unicode string to base64', () => {
    const str = '✓ à la mode'
    const encoded = b64EncodeUnicode(str)
    expect(encoded).toBe('4pyTIMOgIGxhIG1vZGU=')
  })
})