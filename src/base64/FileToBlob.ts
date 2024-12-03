/**
 * Converts a File object to a Blob object.
 * @param file - The File object to convert
 * @returns Promise that resolves with the Blob
 */
function FileToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(new Blob([reader.result as ArrayBuffer]))
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export { FileToBlob }
