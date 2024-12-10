/**
 * Gets a nested value from an object using a path string
 * @param path - Dot notation path (e.g. 'user.contacts[0].email')
 * @param obj - Source object to extract value from
 * @returns Value at path or undefined if path invalid
 */
export function getNestedValue(path: string, obj: Record<string, any>): any {
  if (!path || !obj) return undefined;

  // Check for invalid path patterns
  if (path.includes("..") || path.includes("[]") || /\[\s*\]/.test(path)) {
    return undefined;
  }

  const parts = path
    .replace(/\[(\w+)\]/g, ".$1") // Convert brackets to dot notation
    .split(".")
    .filter(Boolean); // Remove empty segments

  if (parts.length === 0) return undefined;

  return parts.reduce((prev, curr) => {
    if (prev === undefined) return undefined;
    return prev[curr];
  }, obj);
}

/**
 * Sets a nested value in an object using a path string
 * @param path - Dot notation path (e.g. 'user.contacts[0].email')
 * @param value - Value to set at path
 * @param obj - Target object to modify
 * @returns Modified object
 */
export function setNestedValue(
  path: string,
  value: any,
  obj: Record<string, any>
): Record<string, any> {
  if (!path || !obj) return obj;

  const parts = path
    .replace(/\[(\w+)\]/g, ".$1")
    .split(".")
    .filter(Boolean); // Remove empty segments

  if (parts.length === 0) return obj;

  const lastKey = parts.pop()!;
  let current = obj;

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1] || lastKey;
    const shouldBeArray = /^\d+$/.test(nextKey);

    // If current key doesn't exist or needs type conversion
    if (
      !(key in current) ||
      (shouldBeArray && !Array.isArray(current[key])) ||
      (!shouldBeArray && typeof current[key] !== "object")
    ) {
      // Create appropriate container based on next key
      current[key] = shouldBeArray ? [] : {};
    }

    current = current[key];
  }

  // Handle the last key - determine if parent should be an array
  if (/^\d+$/.test(lastKey) && !Array.isArray(current)) {
    const tempObj = current;
    const maxIndex = Math.max(
      ...Object.keys(tempObj)
        .filter((k) => /^\d+$/.test(k))
        .map(Number)
        .concat(-1)
    );
    const arr = new Array(Math.max(maxIndex + 1, Number(lastKey) + 1));

    // Copy existing numeric properties to array
    Object.keys(tempObj)
      .filter((k) => /^\d+$/.test(k))
      .forEach((k) => {
        arr[Number(k)] = tempObj[k];
      });

    // Replace object with array while preserving non-numeric properties
    Object.keys(tempObj).forEach((k) => {
      if (!/^\d+$/.test(k)) {
        arr[k] = tempObj[k];
      }
    });

    Object.keys(tempObj).forEach((k) => delete tempObj[k]);
    Object.assign(tempObj, arr);
    current = tempObj;
  }

  // Set the final value
  current[lastKey] = value;
  return obj;
}
