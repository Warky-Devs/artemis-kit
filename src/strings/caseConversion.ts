
/**
 * Capitalizes the first letter of each word in a sentence
 * @param sentence - Input string to transform
 * @returns Transformed string with initial capitals
 */
export const initCaps = (sentence: string): string => {
  if (!sentence) return sentence;
  return sentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};

/**
 * Converts text to title case, following standard title capitalization rules
 * Keeps articles, conjunctions, and prepositions in lowercase unless they start the title
 * @param sentence - Input string to transform
 * @returns Transformed string in title case
 */
export const titleCase = (sentence: string): string => {
  if (!sentence) return sentence;
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
  
  return sentence.toLowerCase().replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (word, index, title) => {
    if (index > 0 && index + word.length !== title.length &&
      word.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
      (title.charAt(index + word.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.substr(1);
  });
};

/**
 * Converts text to camelCase format
 * @param sentence - Input string to transform
 * @returns Transformed string in camelCase
 */
export const camelCase = (sentence: string): string => {
  if (!sentence) return sentence;
  return sentence
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => 
      index === 0 ? letter.toLowerCase() : letter.toUpperCase())
    .replace(/\s+/g, '');
};

/**
 * Converts text to snake_case format
 * @param sentence - Input string to transform
 * @returns Transformed string in snake_case
 */
export const snakeCase = (sentence: string): string => {
  if (!sentence) return sentence;
  return sentence
    .replace(/\s+/g, '_')
    .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    .replace(/^_/, '')
    .toLowerCase();
};

/**
 * Converts snake_case to camelCase
 * @param sentence - Input string in snake_case
 * @returns Transformed string in camelCase
 */
export const reverseSnakeCase = (sentence: string): string => {
  if (!sentence) return sentence;
  return sentence
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Splits camelCase text into space-separated words
 * @param sentence - Input string in camelCase
 * @returns Space-separated string
 */
export const splitCamelCase = (sentence: string): string => {
  if (!sentence) return sentence;
  return sentence
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim();
};