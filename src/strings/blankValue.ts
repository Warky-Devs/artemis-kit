/**
 * Returns the first non-blank value from the provided arguments.
 * A value is considered blank if it's:
 * - undefined or null
 * - number 0
 * - empty string
 * - empty array
 * - empty object
 * If all values are blank, returns the last argument.
 *
 * @returns The first non-blank value or the last argument if all are blank
 */
export function blankValue<T = any>(...args: any[]): T | undefined {
  // Handle case where no arguments are provided
  if (args.length === 0) return undefined;

  for (let i = 0; i < args.length; i++) {
    const value = args[i];
    const valueType = typeof value;

    // Skip blank values based on type
    if (value === undefined || value === null) continue;

    // Check numbers - consider 0 as blank
    if (valueType === "number" && value === 0) continue;

    // Check strings - consider empty string as blank
    if (valueType === "string" && value === "") continue;

    // Check arrays - consider empty arrays as blank
    if (Array.isArray(value) && value.length === 0) continue;

    // Check objects - consider empty objects as blank
    if (
      valueType === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    )
      continue;

    // If we reach here, we've found a non-blank value
    return value;
  }

  // If all values are blank, return the last one
  return args[args.length - 1];
}
