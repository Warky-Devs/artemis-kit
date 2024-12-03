/**
 * Converts a base64 string to a Blob object.
 * @param base64 - The base64 encoded string to convert
 * @returns A Blob containing the decoded binary data
 */
export function base64ToBlob(base64: string): Blob {
  const byteString = atob(base64)
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const uint8Array = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i)
  }

  return new Blob([arrayBuffer])
}
