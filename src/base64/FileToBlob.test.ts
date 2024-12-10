import { describe, it, expect } from 'vitest'
import { FileToBlob } from './FileToBlob'
import { BlobToString  } from './BlobToString'


// FILE: src/base64/FileToBlob.test.ts

describe('FileToBlob', () => {
  it('should convert a File object to a Blob object', async () => {
    const content = 'Hello, world!'
    const file = new File([content], 'hello.txt', { type: 'text/plain' })
    const blob = await FileToBlob(file)
    
    expect(blob).toBeInstanceOf(Blob)
    const text = await BlobToString(blob)
    expect(text).toBe(content)
  })


})