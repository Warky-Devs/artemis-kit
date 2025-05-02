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
    if (prev === null || prev === undefined) return undefined;
    if (typeof prev !== "object") return undefined;
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
export function findObjectByKeyValues(
  obj: Record<string, any>,
  criteria: Record<string, any>,
  options: {
    partialMatch?: boolean;
    maxDepth?: number;
    returnFirstMatch?: boolean;
    caseSensitive?: boolean;
    customCompare?: (a: any, b: any) => boolean;
  } = {}
): string[] {
  // Handle invalid inputs
  if (!obj || typeof obj !== 'object') {
    return [];
  }
  
  // Handle empty criteria
  if (!criteria || typeof criteria !== 'object' || Object.keys(criteria).length === 0) {
    return [];
  }
  
  const {
    partialMatch = false,
    maxDepth = Infinity,
    returnFirstMatch = false,
    caseSensitive = true,
    customCompare
  } = options;

  const results: string[] = [];

  // Helper function for comparing values
  const compareValues = (a: any, b: any): boolean => {
    if (customCompare) {
      return customCompare(a, b);
    }
    
    // Handle string comparison with case sensitivity option
    if (typeof a === 'string' && typeof b === 'string' && !caseSensitive) {
      return a.toLowerCase() === b.toLowerCase();
    }
    
    return a === b;
  };

  // Recursive search function
  const search = (
    currentObj: Record<string, any>,
    currentPath: string = '',
    depth: number = 0
  ): void => {
    // Check depth first - don't process objects beyond max depth
    if (depth > maxDepth) {
      return;
    }
    
    // Skip if not a valid object
    if (!currentObj || typeof currentObj !== 'object') {
      return;
    }
    
    // Check if current object matches criteria
    let matchCount = 0;
    const criteriaKeys = Object.keys(criteria);
    
    for (const key of criteriaKeys) {
      if (key in currentObj && compareValues(currentObj[key], criteria[key])) {
        matchCount++;
      }
    }

    const isMatch = partialMatch
      ? matchCount > 0
      : matchCount === criteriaKeys.length;

    // If matched, add to results
    if (isMatch && criteriaKeys.length > 0) {
      results.push(currentPath);
      if (returnFirstMatch) {
        return;
      }
    }

    // Recursively search nested objects and arrays
    if (Array.isArray(currentObj)) {
      for (let i = 0; i < currentObj.length; i++) {
        const item = currentObj[i];
        if (item && typeof item === 'object') {
          const nextPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
          search(item, nextPath, depth + 1);
          if (returnFirstMatch && results.length > 0) {
            return;
          }
        }
      }
    } else {
      for (const [key, value] of Object.entries(currentObj)) {
        if (value && typeof value === 'object') {
          const nextPath = currentPath ? `${currentPath}.${key}` : key;
          search(value, nextPath, depth + 1);
          if (returnFirstMatch && results.length > 0) {
            return;
          }
        }
      }
    }
  };

  search(obj);
  return results;
}



/**
 * Finds objects in a nested structure that match specified key-value pairs
 * Returns paths compatible with setNestedValue function
 * @param obj - Source object to search within
 * @param criteria - Object with key-value pairs to match against
 * @returns Array of paths where matching objects were found
 */
export function findObjectPath(
  obj: Record<string, any>,
  criteria: Record<string, any>
): string[] {
  const results: string[] = [];
  
  // Handle invalid inputs
  if (!obj || typeof obj !== 'object') {
    return results;
  }
  
  // Handle empty criteria - should return empty array
  if (!criteria || typeof criteria !== 'object' || Object.keys(criteria).length === 0) {
    return results;
  }
  
  const search = (currentObj: any, path: string = '') => {
    // Skip if not an object or is null
    if (!currentObj || typeof currentObj !== 'object') {
      return;
    }
    
    // Check if current object matches all criteria
    let matches = true;
    for (const [key, value] of Object.entries(criteria)) {
      if (!(key in currentObj) || currentObj[key] !== value) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      results.push(path);
    }
    
    // Continue searching in nested properties
    if (Array.isArray(currentObj)) {
      for (let i = 0; i < currentObj.length; i++) {
        const newPath = path ? `${path}[${i}]` : `[${i}]`;
        search(currentObj[i], newPath);
      }
    } else {
      for (const [key, value] of Object.entries(currentObj)) {
        const newPath = path ? `${path}.${key}` : key;
        search(value, newPath);
      }
    }
  };
  
  search(obj);
  return results;
}