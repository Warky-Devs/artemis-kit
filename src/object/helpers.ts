/** Check own properties without consulting the object's prototype. */
export function hasOwn<K extends PropertyKey>(object: object, key: K): object is object & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(object, key);
}

/** Plain objects from this realm, including objects with a null prototype. */
export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

export function ownKeys<T extends object>(object: T): (keyof T)[] {
  return Reflect.ownKeys(object).filter(key => Object.prototype.propertyIsEnumerable.call(object, key)) as (keyof T)[];
}

export function setOwn(object: object, key: PropertyKey, value: unknown): void {
  Object.defineProperty(object, key, { value, enumerable: true, writable: true, configurable: true });
}

/** Select own properties. Values are not cloned. */
export function pick<T extends object, const K extends readonly (keyof T)[]>(object: T, keys: K): Pick<T, K[number]> {
  const result = {} as Pick<T, K[number]>;
  for (const key of keys) if (hasOwn(object, key)) setOwn(result, key, object[key]);
  return result;
}

/** Exclude keys from the object's own enumerable properties. */
export function omit<T extends object, const K extends readonly (keyof T)[]>(object: T, keys: K): Omit<T, K[number]> {
  // JavaScript stores numeric property keys as strings.
  const excluded = new Set<PropertyKey>(keys.map(key => typeof key === 'number' ? String(key) : key));
  const result = {} as Omit<T, K[number]>;
  for (const key of ownKeys(object)) if (!excluded.has(key)) setOwn(result, key, object[key]);
  return result;
}

export function pickBy<T extends object>(object: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T> {
  const result: Partial<T> = {};
  for (const key of ownKeys(object)) if (predicate(object[key], key)) setOwn(result, key, object[key]);
  return result;
}

export function omitBy<T extends object>(object: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T> {
  return pickBy(object, (value, key) => !predicate(value, key));
}

export function mapValues<T extends object, V>(object: T, mapper: (value: T[keyof T], key: keyof T) => V): { [K in keyof T]: V } {
  const result = {} as { [K in keyof T]: V };
  for (const key of ownKeys(object)) setOwn(result, key, mapper(object[key], key));
  return result;
}

/** Rename keys; the last enumerated property wins on a collision. */
export function mapKeys<T extends object, K extends PropertyKey>(object: T, mapper: (key: keyof T, value: T[keyof T]) => K): Partial<Record<K, T[keyof T]>> {
  const result: Partial<Record<K, T[keyof T]>> = {};
  for (const key of ownKeys(object)) setOwn(result, mapper(key, object[key]), object[key]);
  return result;
}

/** Remove null and undefined values, keeping all other values. */
export function compactObject<T extends object>(object: T): Partial<T> {
  return pickBy(object, value => value !== null && value !== undefined);
}

/** Group original keys by value, using Map equality and preserving key order. */
export function invert<T extends object>(object: T): Map<T[keyof T], (keyof T)[]> {
  const result = new Map<T[keyof T], (keyof T)[]>();
  for (const key of ownKeys(object)) {
    const value = object[key];
    const keys = result.get(value);
    if (keys) keys.push(key);
    else result.set(value, [key]);
  }
  return result;
}
