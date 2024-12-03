/**
 * Encodes a Unicode string to base64.
 * This function handles Unicode characters correctly by:
 * 1. Converting Unicode to UTF-8 percent-encoding
 * 2. Converting percent-encoded bytes to binary
 * 3. Converting binary to base64
 *
 * @param str - The Unicode string to encode
 * @returns The base64 encoded string
 */
export function b64EncodeUnicode(str: any): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(Number.parseInt(p1, 16))
    )
  )
}
