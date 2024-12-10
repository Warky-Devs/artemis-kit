/**
 * Converts a Blob object to a string. Defaults to a blank string if the Blob is null.
 * @param blob - The Blob object to convert
 * @returns Promise that resolves with the text
 */
function BlobToString(blob: Blob | string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!blob) return resolve('')
    if (typeof blob === 'string') {
      return resolve(blob)
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string
      resolve(text)
    }
    reader.onerror = reject
    reader.readAsText(blob)
  })
}

export { BlobToString }
