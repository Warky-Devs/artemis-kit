/**
 * Trims specified characters from the left side of a string a specified number of times.
 * @param {string} str - The input string to trim
 * @param {string} [chars=' '] - The characters to trim (if multiple, any of them will be trimmed)
 * @param {number} [times=Infinity] - Number of times to trim. Defaults to all occurrences
 * @returns {string} The trimmed string
 */
export function trimLeft(
  str: string,
  chars: string = " ",
  times: number = Number.POSITIVE_INFINITY
): string {
  if (!str) return str;

  let result = str;
  let count = 0;
  const charArray = [...chars]; // Split into Unicode characters
  const charSet = new Set(charArray);

  while (count < times && result.length > 0) {
    const firstChar = [...result][0]; // Get first Unicode character
    if (!charSet.has(firstChar)) break;
    result = result.slice(firstChar.length); // Skip the entire Unicode character
    count++;
  }

  return result;
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
  chars: string = " ",
  times: number = Number.POSITIVE_INFINITY
): string {
  if (!str) return str;

  let result = str;
  let count = 0;
  const charArray = [...chars]; // Split into Unicode characters
  const charSet = new Set(charArray);

  while (count < times && result.length > 0) {
    const lastChar = [...result].slice(-1)[0]; // Get last Unicode character
    if (!charSet.has(lastChar)) break;
    result = result.slice(0, -lastChar.length); // Remove the entire Unicode character
    count++;
  }

  return result;
}
