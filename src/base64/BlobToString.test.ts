import { describe, it, expect } from 'vitest'
import { BlobToString } from './BlobToString'

describe('blobToString', () => {
  it('should convert a Blob object to a string', async () => {
    const content = 'Hello, world!'
    const blob = new Blob([content], { type: 'text/plain' })
    const text = await BlobToString(blob)
    expect(text).toBe(content)
  })

  it('should return the input if it is already a string', async () => {
    const content = 'Hello, world!'
    const text = await BlobToString(content)
    expect(text).toBe(content)
  })

  it('should return an empty string if the Blob is null', async () => {
    const text = await BlobToString(null)
    expect(text).toBe('')
  })
})