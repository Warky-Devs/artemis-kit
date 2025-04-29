/**
 * Convert a string in a given base to a decimal number
 * This implementation targets ES6+ and uses BigInt for large number support
 * 
 * @param str The string to convert
 * @param base The base to convert from (2-36)
 * @returns The decimal number as BigInt
 */
export function fromBaseN(str: string, base: number = 36): bigint {
  // Input validation
  if (base < 2 || base > 36) {
    throw new Error('Base must be between 2 and 36');
  }

  // Convert empty string or null to 0
  if (!str) {
    return BigInt(0);
  }

  // Use standard alphanumeric characters for conversion: 0-9, A-Z
  const lookupString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = BigInt(0);
  let power = BigInt(1);

  // Process string right to left
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i].toUpperCase();
    const digit = lookupString.indexOf(char);
    
    // Check if character is valid
    if (digit === -1) {
      throw new Error(`Invalid character in input string: ${char}`);
    }
    
    // Validate digit is within base range
    if (digit >= base) {
      throw new Error(`Digit ${char} is invalid for base ${base}`);
    }

    result += BigInt(digit) * power;
    power *= BigInt(base);
  }

  return result;
}

/**
 * Convert a decimal number to a string in a given base
 * This implementation targets ES6+ and uses BigInt for large number support
 * 
 * @param num The decimal number to convert
 * @param base The base to convert to (2-36)
 * @returns The string representation in the specified base
 */
export function toBaseN(num: number | bigint, base: number = 36): string {
  // Input validation
  if (base < 2 || base > 36) {
    throw new Error('Base must be between 2 and 36');
  }

  // Handle 0 separately
  if (num === 0 || num === BigInt(0)) {
    return '0';
  }

  // Convert to BigInt to handle large numbers
  const bigNum = typeof num === 'number' ? BigInt(num) : num;
  
  // Use standard alphanumeric characters for conversion: 0-9, A-Z
  const lookupString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  let remaining = bigNum > BigInt(0) ? bigNum : -bigNum; // Handle negative numbers
  const bigBase = BigInt(base);

  while (remaining > BigInt(0)) {
    const digitValue = Number(remaining % bigBase);
    const digitChar = lookupString[digitValue];
    
    result = digitChar + result;
    remaining = remaining / bigBase;
  }

  // Add negative sign if necessary
  return bigNum < BigInt(0) ? '-' + result : result;
}