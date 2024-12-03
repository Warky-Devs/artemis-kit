/**
 * Trims specified characters from the left side of a string a specified number of times.
 * @param {string} str - The input string to trim
 * @param {string} [chars=' '] - The characters to trim (if multiple, any of them will be trimmed)
 * @param {number} [times=Infinity] - Number of times to trim. Defaults to all occurrences
 * @returns {string} The trimmed string
 */
export function trimLeft(
  str: string,
  // biome-ignore lint: Stupid biome Rule
  chars: string = ' ',
  times: number = Number.POSITIVE_INFINITY
): string {
  if (!str) return str

  let count = 0
  let startIdx = 0
  const charSet = new Set(chars)

  while (startIdx < str.length && charSet.has(str[startIdx]) && count < times) {
    startIdx++
    count++
  }

  return str.slice(startIdx)
}

/**
 * Trims specified characters from the right side of a string a specified number of times.
 * @param {string} str - The input string to trim
 * @param {string} [chars=' '] - The characters to trim (if multiple, any of them will be trimmed)
 * @param {number} [times=Infinity] - Number of times to trim. Defaults to all occurrences
 * @returns {string} The trimmed string
 */
export function trimRight(
  str: string,
  // biome-ignore lint: Stupid biome Rule
  chars: string = ' ',
  times: number = Number.POSITIVE_INFINITY
): string {
  if (!str) return str

  let count = 0
  let endIdx = str.length - 1
  const charSet = new Set(chars)

  while (endIdx >= 0 && charSet.has(str[endIdx]) && count < times) {
    endIdx--
    count++
  }

  return str.slice(0, endIdx + 1)
}
