/**
 * Converts a File object to a Blob object.
 * @param file - The File object to convert
 * @returns Promise that resolves with the Blob
 */
function FileToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      resolve(new Blob([arrayBuffer]))
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}


export { FileToBlob }