/**
 * Converts an object or array into an array of key-value pairs with customizable property names.
 * Commonly used for transforming data into a format suitable for select/dropdown components.
 * 
 * @param obj - The input object or array to be transformed
 * @param options - Configuration options for the transformation
 * @param options.labelKey - The key name to use for the label property (default: 'label')
 * @param options.valueKey - The key name to use for the value property (default: 'value')
 * @returns An array of objects with the specified label and value properties, or an empty array if input is invalid
 * 
 * @example
 * // Basic usage
 * createSelectOptions({ key1: "Label 1", key2: "Label 2" })
 * // Returns: [{ label: "Label 1", value: "key1" }, { label: "Label 2", value: "key2" }]
 * 
 * // Custom key names
 * createSelectOptions(
 *   { key1: "Label 1", key2: "Label 2" },
 *   { labelKey: 'text', valueKey: 'id' }
 * )
 * // Returns: [{ text: "Label 1", id: "key1" }, { text: "Label 2", id: "key2" }]
 */
export function createSelectOptions<T = string>(
    obj: Record<string, T> | T[] | null | undefined,
    options: {
        labelKey?: string;
        valueKey?: string;
    } = {}
): Array<Record<string, T | string>> {
    const {
        labelKey = 'label',
        valueKey = 'value'
    } = options;

    // Return empty array for null or undefined input
    if (!obj) return [];

    // Return the original array if input is already an array
    if (Array.isArray(obj)) return obj as Array<Record<string, T | string>>;

    // Return empty array for non-object inputs (like numbers or strings)
    if (typeof obj !== 'object') return [];

    // Transform object into array of key-value pairs with custom property names
    return Object.keys(obj).map((key) => ({
        [labelKey]: obj[key],
        [valueKey]: key
    }));
}