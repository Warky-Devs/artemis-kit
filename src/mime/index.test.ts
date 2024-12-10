import { describe, it, expect } from 'vitest'
import { getExtFromMime, getExtFromFilename, getMimeFromExt, isValidExtForMime, getAllExtensionsForMime } from './index'

describe('MIME functions', () => {
  it('should get the correct extension from MIME type', () => {
    expect(getExtFromMime('image/jpeg')).toBe('jpg')
  })

  it('should get the correct extension from filename', () => {
    expect(getExtFromFilename('example.txt')).toBe('txt')
  })

  it('should get the correct MIME type from extension', () => {
    expect(getMimeFromExt('txt')).toBe('text/plain')
  })

  it('should validate if extension is valid for MIME type', () => {
    expect(isValidExtForMime('image/jpeg', 'jpg')).toBe(true)
    expect(isValidExtForMime('image/jpeg', 'png')).toBe(false)
  })

  it('should get all valid extensions for a MIME type', () => {
    expect(getAllExtensionsForMime('image/jpeg')).toEqual(['jpg', 'jpe', 'jpeg','jfif'])
  })
})