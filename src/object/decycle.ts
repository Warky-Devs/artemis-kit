/**
 * Interface for an object with a $ref property pointing to a path
 */
export interface RefObject {
    $ref: string;
}

/**
 * Makes a deep copy of an object or array, replacing circular references
 * with objects of the form {"$ref": PATH} where PATH is a JSONPath string
 * that locates the first occurrence.
 * 
 * @param object - The object to decycle
 * @param replacer - Optional function to replace values during the process
 * @returns A decycled copy of the object
 */
export function decycle<T=any>(
    object: T, 
    replacer?: (value: any) => any
): any {
    "use strict";

    // Object to path mappings
    const objects = new WeakMap<object, string>();     

    return (function derez(value: any, path: string): any {
        // The path of an earlier occurrence of value
        let old_path: string | undefined;   
        // The new object or array
        let nu: any;         

        // If a replacer function was provided, then call it to get a replacement value.
        if (replacer !== undefined) {
            value = replacer(value);
        }

        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.
        if (
            typeof value === "object"
            && value !== null
            && !(value instanceof Boolean)
            && !(value instanceof Date)
            && !(value instanceof Number)
            && !(value instanceof RegExp)
            && !(value instanceof String)
        ) {
            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.
            old_path = objects.get(value);
            if (old_path !== undefined) {
                return {$ref: old_path};
            }

            // Otherwise, accumulate the unique value and its path.
            objects.set(value, path);

            // If it is an array, replicate the array.
            if (Array.isArray(value)) {
                nu = [];
                value.forEach(function (element, i) {
                    nu[i] = derez(element, path + "[" + i + "]");
                });
            } else {
                // If it is an object, replicate the object.
                nu = {};
                Object.keys(value).forEach(function (name) {
                    nu[name] = derez(
                        value[name],
                        path + "[" + JSON.stringify(name) + "]"
                    );
                });
            }
            return nu;
        }
        return value;
    }(object, "$"));
}

/**
 * Restores an object that was reduced by decycle. Members whose values are
 * objects of the form {$ref: PATH} are replaced with references to the value
 * found by the PATH. This will restore cycles.
 * 
 * @param $ - The object to restore cycles in
 * @returns The object with restored cycles
 */
export function retrocycle<T>($: T): T {
    "use strict";

    // Regular expression to validate JSONPath format
    // eslint-disable-next-line no-control-regex
    const px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"/bfnrt]|u[0-9a-fA-F]{4}))*")\])*$/;

    // Paths contain only bracketed array indices or JSON-encoded property names.
    // Decode each component and walk from the root without executing JavaScript.
    function resolvePath(path: string): any {
        const components = path.match(/\[(?:\d+|"(?:[^"\\]|\\.)*")\]/g) ?? [];
        let value: any = $;
        for (const component of components) {
            const key = component.slice(1, -1);
            value = value[key.startsWith('"') ? JSON.parse(key) : Number(key)];
        }
        return value;
    }

    (function rez(value: any): void {
        // The rez function walks recursively through the object looking for $ref
        // properties. When it finds one that has a value that is a path, then it
        // replaces the $ref object with a reference to the value that is found by
        // the path.
        if (value && typeof value === "object") {
            if (Array.isArray(value)) {
                value.forEach(function (element, i) {
                    if (typeof element === "object" && element !== null) {
                        const path = element.$ref;
                        if (typeof path === "string" && px.test(path)) {
                            value[i] = resolvePath(path);
                        } else {
                            rez(element);
                        }
                    }
                });
            } else {
                Object.keys(value).forEach(function (name) {
                    const item = value[name];
                    if (typeof item === "object" && item !== null) {
                        const path = item.$ref;
                        if (typeof path === "string" && px.test(path)) {
                            value[name] = resolvePath(path);
                        } else {
                            rez(item);
                        }
                    }
                });
            }
        }
    }($));
    return $;
}

/**
 * 
 * @description Converts a object with circular references to JSON
 * @param json 
 * @param object 
 * @returns 
 */
export function stringify_json<T=any>(
    object: T, 
) {
    return JSON.stringify(retrocycle(object))
}