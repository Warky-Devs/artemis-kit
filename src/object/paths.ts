import { hasOwn, isPlainObject, setOwn } from './helpers';
import { assertAcyclic } from './deep';

/**
 * Flatten nested plain objects into slash-prefixed paths. Escape ~ as ~0 and /
 * as ~1. Arrays and other values are leaves; empty nested objects are retained.
 * Only enumerable string keys are traversed. Leaf references are not cloned.
 */
export function flattenObject(object: object): Record<string, unknown> {
  if (!isPlainObject(object)) throw new TypeError('flattenObject requires a plain object');
  assertAcyclic(object, false);
  const result: Record<string, unknown> = {};
  function visit(value: unknown, path: string): void {
    if (isPlainObject(value) && Object.keys(value).length) {
      for (const key of Object.keys(value)) visit(value[key], path + '/' + key.replace(/~/g, '~0').replace(/\//g, '~1'));
    } else setOwn(result, path, value);
  }
  for (const key of Object.keys(object)) visit(object[key], '/' + key.replace(/~/g, '~0').replace(/\//g, '~1'));
  return result;
}

/** Reverse flattenObject. Reject malformed paths and parent/child collisions. */
export function unflattenObject(flat: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const paths = Object.keys(flat).map(path => {
    if (!path.startsWith('/') || /~(?![01])/g.test(path)) throw new TypeError('Invalid flattened path');
    return { path, keys: path.slice(1).split('/').map(key => key.replace(/~1/g, '/').replace(/~0/g, '~')) };
  }).sort((a, b) => a.keys.length - b.keys.length);
  // Track leaf locations separately, including scalar leaves and empty objects.
  const assigned = new Map<object, Set<string>>();
  for (const { path, keys } of paths) {
    let current = result;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (assigned.get(current)?.has(key)) throw new TypeError('Conflicting flattened paths');
      if (i === keys.length - 1) {
        if (hasOwn(current, key)) throw new TypeError('Conflicting flattened paths');
        setOwn(current, key, flat[path]);
        if (!assigned.has(current)) assigned.set(current, new Set());
        assigned.get(current)!.add(key);
      } else {
        if (!hasOwn(current, key)) setOwn(current, key, {});
        current = current[key] as Record<string, unknown>;
      }
    }
  }
  return result;
}

export type ObjectChange =
  | { type: 'added'; path: string[]; after: unknown }
  | { type: 'removed'; path: string[]; before: unknown }
  | { type: 'changed'; path: string[]; before: unknown; after: unknown };

/** Compare nested plain objects. Other values (including arrays) use Object.is. */
export function diffObjects(before: object, after: object): ObjectChange[] {
  if (!isPlainObject(before) || !isPlainObject(after)) throw new TypeError('diffObjects requires plain objects');
  assertAcyclic(before, false);
  assertAcyclic(after, false);
  const changes: ObjectChange[] = [];
  function visit(left: Record<string, unknown>, right: Record<string, unknown>, path: string[]): void {
    for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
      const next = [...path, key];
      if (!hasOwn(right, key)) changes.push({ type: 'removed', path: next, before: left[key] });
      else if (!hasOwn(left, key)) changes.push({ type: 'added', path: next, after: right[key] });
      else if (isPlainObject(left[key]) && isPlainObject(right[key])) visit(left[key], right[key], next);
      else if (!Object.is(left[key], right[key])) changes.push({ type: 'changed', path: next, before: left[key], after: right[key] });
    }
  }
  visit(before, after, []);
  return changes;
}
