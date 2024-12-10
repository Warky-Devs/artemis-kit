import { describe, it, expect } from 'vitest'
import { FileToBase64 } from './FileToBase64'

describe('FileToBase64', () => {
  it('should convert a File object to a base64 encoded string', async () => {
    const content = 'Hello, world!'
    const file = new File([content], 'hello.txt', { type: 'text/plain' })
    const base64 = await FileToBase64(file)
    expect(base64).toBe('SGVsbG8sIHdvcmxkIQ==')
  })
})