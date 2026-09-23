/** Group items by key, preserving item and first-seen key order. */
export function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/** Index items by key. The last item wins for duplicate keys. */
export function keyBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T> {
  const result = new Map<K, T>();
  for (const item of items) result.set(keyOf(item), item);
  return result;
}

/** Keep the first item for each key, preserving input order. */
export function uniqueBy<T, K>(items: readonly T[], keyOf: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter(item => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Split items into [matching, non-matching], preserving order. */
export function partition<T>(items: readonly T[], predicate: (item: T) => boolean): [T[], T[]] {
  const matching: T[] = [];
  const remaining: T[] = [];
  for (const item of items) (predicate(item) ? matching : remaining).push(item);
  return [matching, remaining];
}
