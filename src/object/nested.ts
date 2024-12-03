/**
 * Gets a nested value from an object using a path string
 * @param path - Dot notation path (e.g. 'user.contacts[0].email')
 * @param obj - Source object to extract value from
 * @returns Value at path or undefined if path invalid
 */
export function getNestedValue(path: string, obj: Record<string, any>): any {
  return path
    .replace(/\[(\w+)\]/g, ".$1") // Convert brackets to dot notation
    .split(".") // Split path into parts
    .reduce((prev, curr) => prev?.[curr], obj); // Traverse object
}



/**
* Sets a nested value in an object using a path string
* @param path - Dot notation path (e.g. 'user.contacts[0].email')
* @param value - Value to set at path
* @param obj - Target object to modify
* @returns Modified object
*/
/**
 * Sets a nested value, creating objects and arrays if needed
 */
export function setNestedValue(path: string, value: any, obj: Record<string, any>): Record<string, any> {
  const parts = path.replace(/\[(\w+)\]/g, ".$1").split(".");
  const lastKey = parts.pop()!;
  
  const target = parts.reduce((prev, curr) => {
    // Handle array indices
    if (/^\d+$/.test(curr)) {
      if (!Array.isArray(prev[curr])) {
        prev[curr] = [];
      }
    }
    // Create missing objects
    else if (!prev[curr]) {
      prev[curr] = {};
    }
    return prev[curr];
  }, obj);

  target[lastKey] = value;
  return obj;
}