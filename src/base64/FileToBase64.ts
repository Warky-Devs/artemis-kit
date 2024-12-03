/**
 * Converts a File object to a base64 encoded string.
 * @param file - The File object to convert
 * @returns Promise that resolves with the base64 encoded string
 */
function FileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const d = reader.result?.toString()
      resolve(btoa(d ?? ''))
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export { FileToBase64 }
