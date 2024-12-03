/**
 * Converts a Blob object to a string. Defaults to a blank string if the Blob is null.
 * @param blob - The Blob object to convert
 * @returns Promise that resolves with the text
 */
async function blobToString(blob: Blob | string): Promise<string> {
  if (!blob) return ''
  if (typeof blob === 'string') {
    return blob
  }
  return await blob.text()
}

export { blobToString }
