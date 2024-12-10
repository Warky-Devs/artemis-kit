import { describe, it, expect } from 'vitest'
import { blobToBase64 } from './BlobToBase64'

describe('blobToBase64', () => {
  it('should convert a Blob object to a base64 encoded string', async () => {
    const content = 'Hello, world!'
    const blob = new Blob([content], { type: 'text/plain' })
    const base64 = await blobToBase64(blob)
    expect(base64).toBe('SGVsbG8sIHdvcmxkIQ==')
  })
})