import { hasOwn, isPlainObject, ownKeys, setOwn } from './helpers';
import type { DeepReadonly } from './types';

/**
 * Clone primitives, plain objects, arrays, Date, RegExp, Map, Set, ArrayBuffer,
 * and buffer views. Preserve cycles and shared references. Reject other objects
 * and functions. Copy enumerable own values on plain objects/arrays, not descriptors.
 */
export function deepClone<T>(value: T): T {
  const seen = new WeakMap<object, any>();
  function clone(input: any): any {
    if (typeof input === 'function') throw new TypeError('Cannot clone functions');
    if (input === null || typeof input !== 'object') return input;
    if (seen.has(input)) return seen.get(input);
    let result: any;
    if (Array.isArray(input)) result = new Array(input.length);
    else if (isPlainObject(input)) result = Object.create(Object.getPrototypeOf(input));
    else if (input instanceof Date) result = new Date(input.getTime());
    else if (input instanceof RegExp) {
      result = new RegExp(input.source, input.flags);
      result.lastIndex = input.lastIndex;
    } else if (input instanceof Map) result = new Map();
    else if (input instanceof Set) result = new Set();
    else if (input instanceof ArrayBuffer) result = input.slice(0);
    else if (ArrayBuffer.isView(input)) {
      const buffer = clone(input.buffer);
      result = input instanceof DataView
        ? new DataView(buffer, input.byteOffset, input.byteLength)
        : new (input.constructor as any)(buffer, input.byteOffset, (input as any).length);
    } else throw new TypeError('Unsupported object in deepClone');
    seen.set(input, result);
    if (input instanceof Map) input.forEach((v, k) => result.set(clone(k), clone(v)));
    else if (input instanceof Set) input.forEach(v => result.add(clone(v)));
    else if (Array.isArray(input) || isPlainObject(input)) {
      for (const key of ownKeys(input)) setOwn(result, key, clone(input[key]));
    }
    return result;
  }
  return clone(value);
}

export interface DeepMergeOptions {
  /** Replace arrays by default, or concatenate target then source. */
  arrays?: 'replace' | 'concat';
}

/** Reject cycles among the containers traversed by the operation. */
export function assertAcyclic(value: unknown, arrays: boolean, ancestors = new Set<object>()): void {
  if (!isPlainObject(value) && !(arrays && Array.isArray(value))) return;
  if (ancestors.has(value as object)) throw new TypeError('Circular containers are not supported');
  ancestors.add(value as object);
  for (const key of ownKeys(value as object)) assertAcyclic(value[key], arrays, ancestors);
  ancestors.delete(value as object);
}

/** Merge plain-object roots without mutating inputs; source values win. */
export function deepMerge<T extends object, U extends object>(target: T, source: U, options: DeepMergeOptions = {}): Record<PropertyKey, unknown> {
  if (!isPlainObject(target) || !isPlainObject(source)) throw new TypeError('deepMerge requires plain objects');
  assertAcyclic(target, true);
  assertAcyclic(source, true);
  function merge(left: any, right: any): any {
    if (Array.isArray(left) && Array.isArray(right) && options.arrays === 'concat') return deepClone([...left, ...right]);
    if (!isPlainObject(left) || !isPlainObject(right)) return deepClone(right);
    const result = deepClone(left);
    for (const key of ownKeys(right)) {
      setOwn(result, key, hasOwn(left, key) ? merge(left[key], right[key]) : deepClone(right[key]));
    }
    return result;
  }
  return merge(target, source);
}

/** Freeze a graph of plain objects and arrays in place; cycles are supported. */
export function deepFreeze<T>(object: T): DeepReadonly<T> {
  const seen = new Set<object>();
  function visit(value: any): void {
    if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return;
    if (seen.has(value)) return;
    if (!Array.isArray(value) && !isPlainObject(value)) throw new TypeError('deepFreeze supports only plain objects and arrays');
    seen.add(value);
    for (const key of Reflect.ownKeys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
      if (!('value' in descriptor)) throw new TypeError('deepFreeze does not support accessors');
      visit(descriptor.value);
    }
  }
  visit(object);
  for (const value of seen) Object.freeze(value);
  return object as DeepReadonly<T>;
}
