export type Comparator<T> = (a: T, b: T) => number;
export type SortValue = string | number | Date | null | undefined;

export interface SortOptions {
  direction?: 'asc' | 'desc';
  /** Empty values stay first/last regardless of direction. Defaults to last. */
  empty?: 'first' | 'last';
  locale?: string | string[];
  collator?: Intl.CollatorOptions;
}

/**
 * Compare strings, numbers, and dates without coercing strings to numbers.
 * Empty means null, undefined, an empty string, NaN, or an invalid Date.
 * Mixed non-empty types sort numbers, then dates, then strings in ascending order.
 */
export function createComparator(options: SortOptions = {}): Comparator<SortValue> {
  const collator = new Intl.Collator(options.locale, { numeric: true, ...options.collator });
  const direction = options.direction === 'desc' ? -1 : 1;
  const emptyOrder = options.empty === 'first' ? -1 : 1;
  const isEmpty = (value: SortValue): boolean => value === null || value === undefined || value === '' ||
    (typeof value === 'number' && Number.isNaN(value)) ||
    (value instanceof Date && Number.isNaN(value.getTime()));
  const rank = (value: SortValue): number => typeof value === 'number' ? 0 : value instanceof Date ? 1 : 2;

  return (a, b) => {
    const aEmpty = isEmpty(a);
    const bEmpty = isEmpty(b);
    if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? emptyOrder : -emptyOrder;
    const typeOrder = rank(a) - rank(b);
    if (typeOrder) return typeOrder * direction;
    if (typeof a === 'string' && typeof b === 'string') return collator.compare(a, b) * direction;
    const left = a instanceof Date ? a.getTime() : a as number;
    const right = b instanceof Date ? b.getTime() : b as number;
    return (left < right ? -1 : left > right ? 1 : 0) * direction;
  };
}

/** Create a row comparator using a selector, including nested properties. */
export function compareBy<T>(selector: (item: T) => SortValue, options?: SortOptions): Comparator<T> {
  const compare = createComparator(options);
  return (a, b) => compare(selector(a), selector(b));
}

/** Apply comparators in order until one breaks the tie. */
export function chainComparators<T>(...comparators: Comparator<T>[]): Comparator<T> {
  return (a, b) => {
    for (const compare of comparators) {
      const result = compare(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}
