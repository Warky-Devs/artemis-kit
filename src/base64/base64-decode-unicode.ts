/**
 * Decodes a base64 string that contains Unicode characters.
 * This function handles Unicode characters correctly by:
 * 1. Converting base64 to binary
 * 2. Converting each byte to a hex representation
 * 3. Converting hex-encoded UTF-8 sequences back to Unicode characters
 *
 * @param str - The base64 encoded string to decode
 * @returns The decoded Unicode string
 */
export function b64DecodeUnicode(str: string): any {
  return decodeURIComponent(
    Array.prototype.map
      .call(
        atob(str),
        (c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`
      )
      .join('')
  )
}
