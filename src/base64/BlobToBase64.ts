/**
 * Converts a Blob object to a base64 encoded string.
 * @param blob - The Blob object to convert
 * @returns Promise that resolves with the base64 encoded string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = (reader.result ?? '') as string
      const base64 = dataUrl?.split?.(',')?.[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export { blobToBase64 }
