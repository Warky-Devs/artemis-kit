// biome-rule-off

// biome-disable lint/style/noInferrableTypes
/**
 * Replaces a specific occurrence of a substring in a string
 * @param {string} str - The input string
 * @param {string} search - The string to search for
 * @param {string} replacement - The string to replace with
 * @param {number} [occurrence=1] - Which occurrence to replace (1-based). Defaults to first occurrence
 * @returns {string} The string with the specified occurrence replaced
 */
export function replaceStr(
  str: string,
  search: string,
  replacement: string,
  // biome-ignore lint: Stupid biome Rule
  occurrence: number = 1
): string {
  if (!str || !search || occurrence < 1) return str

  let currentIndex = 0
  let currentOccurrence = 0

  while (currentIndex < str.length) {
    const index = str.indexOf(search, currentIndex)
    if (index === -1) break

    currentOccurrence++
    if (currentOccurrence === occurrence) {
      return (
        str.slice(0, index) + replacement + str.slice(index + search.length)
      )
    }

    currentIndex = index + 1
  }

  return str
}

/**
 * Replaces multiple occurrences of a substring in a string
 * @param {string} str - The input string
 * @param {string} search - The string to search for
 * @param {string} replacement - The string to replace with
 * @param {number} [times=Infinity] - Maximum number of replacements to make. Defaults to all occurrences
 * @returns {string} The string with the specified number of occurrences replaced
 */
export function replaceStrAll(
  str: string,
  search: string,
  replacement: string,
  times: number = Number.POSITIVE_INFINITY
): string {
  if (!str || !search || times < 1) return str

  let result = str
  let currentIndex = 0
  let count = 0

  while (currentIndex < result.length && count < times) {
    const index = result.indexOf(search, currentIndex)
    if (index === -1) break

    result =
      result.slice(0, index) + replacement + result.slice(index + search.length)
    currentIndex = index + replacement.length
    count++
  }

  return result
}
