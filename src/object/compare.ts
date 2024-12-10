/**
 * Performs object comparison with optional deep comparison
 * @param obj First object to compare
 * @param objToCompare Second object to compare
 * @param deep Enable deep comparison for nested objects/arrays
 */
export function objectCompare<T extends Record<string, unknown>>(
  obj: T | any,
  objToCompare: T | any,
  deep = false
): boolean {
  if (!obj || !objToCompare) return false;

  return (
    Object.keys(obj).length === Object.keys(objToCompare).length &&
    Object.keys(obj).every((key) => {
      if (!Object.prototype.hasOwnProperty.call(objToCompare, key))
        return false;

      const val1 = obj[key];
      const val2 = objToCompare[key];

      if (!deep) return val1 === val2;

      if (Array.isArray(val1) && Array.isArray(val2)) {
        return (
          val1.length === val2.length &&
          val1.every((item, i) =>
            typeof item === "object" && item !== null
              ? objectCompare(
                  item as Record<string, unknown>,
                  val2[i] as Record<string, unknown>,
                  true
                )
              : item === val2[i]
          )
        );
      }

      if (
        typeof val1 === "object" &&
        typeof val2 === "object" &&
        val1 !== null &&
        val2 !== null
      ) {
        return objectCompare(
          val1 as Record<string, unknown>,
          val2 as Record<string, unknown>,
          true
        );
      }

      return val1 === val2;
    })
  );
}
