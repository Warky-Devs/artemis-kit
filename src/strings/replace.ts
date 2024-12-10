/**
 * Replaces a specific occurrence of a substring in a string
 * @param {string} str - The input string
 * @param {string} search - The string to search for
 * @param {string} replacement - The string to replace with
 * @param {number} [occurrence=1] - Which occurrence to replace (1-based). Defaults to first occurrence
 * @param {boolean} [ignoreCase=false] - Whether to ignore case when matching
 * @returns {string} The string with the specified occurrence replaced
 */
export function replaceStr(
  str: string,
  search: string,
  replacement: string,
  occurrence: number = 1,
  ignoreCase: boolean = false
): string {
  if (!str || !search || occurrence < 1) return str;

  let currentIndex = 0;
  let currentOccurrence = 0;

  const workingStr = ignoreCase ? str.toLowerCase() : str;
  const workingSearch = ignoreCase ? search.toLowerCase() : search;

  while (currentIndex < str.length) {
    const index = workingStr.indexOf(workingSearch, currentIndex);
    if (index === -1) break;
    currentOccurrence++;
    if (currentOccurrence === occurrence) {
      return (
        str.slice(0, index) + replacement + str.slice(index + search.length)
      );
    }
    currentIndex = index + 1;
  }
  return str;
}

/**
 * Replaces multiple occurrences of a substring in a string
 * @param {string} str - The input string
 * @param {string} search - The string to search for
 * @param {string} replacement - The string to replace with
 * @param {number} [times=Infinity] - Maximum number of replacements to make. Defaults to all occurrences
 * @param {boolean} [ignoreCase=false] - Whether to ignore case when matching
 * @returns {string} The string with the specified number of occurrences replaced
 */
export function replaceStrAll(
  str: string,
  search: string,
  replacement: string,
  times: number = Number.POSITIVE_INFINITY,
  ignoreCase: boolean = false
): string {
  if (!str || !search || times < 1) return str;

  let result = str;
  let currentIndex = 0;
  let count = 0;

  let workingResult = ignoreCase ? result.toLowerCase() : result;
  const workingSearch = ignoreCase ? search.toLowerCase() : search;

  while (currentIndex < result.length && count < times) {
    const index = workingResult.indexOf(workingSearch, currentIndex);
    if (index === -1) break;

    result =
      result.slice(0, index) +
      replacement +
      result.slice(index + search.length);
    workingResult = ignoreCase ? result.toLowerCase() : result;

    currentIndex = index + replacement.length;
    count++;
  }
  return result;
}
