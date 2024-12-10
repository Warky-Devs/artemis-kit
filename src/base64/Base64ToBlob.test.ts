import { describe, it, expect } from 'vitest'
import { base64ToBlob } from './Base64ToBlob'

describe('base64ToBlob', () => {
  it('should convert a base64 string to a Blob object', () => {
    const base64 = 'SGVsbG8sIHdvcmxkIQ=='
    const blob = base64ToBlob(base64)
    expect(blob).toBeInstanceOf(Blob)
  })
})