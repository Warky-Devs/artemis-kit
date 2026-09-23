import { describe, expect, it } from 'vitest';
import { chainComparators, compareBy, createComparator, type SortValue } from './index';

describe('sorting', () => {
  it('sorts numeric strings naturally and accepts collator overrides', () => {
    expect(['item10', 'item2', 'item1'].sort(createComparator({ locale: 'en' })))
      .toEqual(['item1', 'item2', 'item10']);
    expect(['10', '2'].sort(createComparator({ locale: 'en', collator: { numeric: false } })))
      .toEqual(['10', '2']);
    expect(createComparator({ locale: 'en', collator: { sensitivity: 'base' } })('A', 'a')).toBe(0);
  });

  it('respects the chosen locale', () => {
    expect(['ä', 'z'].sort(createComparator({ locale: 'sv' }))).toEqual(['z', 'ä']);
    expect(['ä', 'z'].sort(createComparator({ locale: 'de' }))).toEqual(['ä', 'z']);
  });

  it('compares numbers, infinities, and dates', () => {
    expect([10, -1, 2, Infinity, -Infinity].sort(createComparator()))
      .toEqual([-Infinity, -1, 2, 10, Infinity]);
    expect(createComparator()(Infinity, Infinity)).toBe(0);
    const earlier = new Date('2020-01-01');
    const later = new Date('2021-01-01');
    expect([earlier, later].sort(createComparator({ direction: 'desc' }))).toEqual([later, earlier]);
  });

  it.each(['asc', 'desc'] as const)('keeps empties in the configured position for %s', direction => {
    const empties: SortValue[] = [null, undefined, '', NaN, new Date(NaN)];
    for (const empty of empties) {
      const last = createComparator({ direction });
      const first = createComparator({ direction, empty: 'first' });
      expect(last(empty, 1)).toBeGreaterThan(0);
      expect(last(1, empty)).toBeLessThan(0);
      expect(first(empty, 1)).toBeLessThan(0);
      expect(first(1, empty)).toBeGreaterThan(0);
      for (const other of empties) expect(last(empty, other)).toBe(0);
    }
    const rows = [{ value: undefined }, { value: 2 }, { value: null }, { value: 1 }];
    expect(rows.sort(compareBy(row => row.value, { direction })).map(row => row.value))
      .toEqual(direction === 'asc' ? [1, 2, undefined, null] : [2, 1, undefined, null]);
  });

  it('defines a consistent mixed-type order without numeric coercion', () => {
    const date = new Date(0);
    expect(['1', date, 2].sort(createComparator())).toEqual([2, date, '1']);
    expect(['1', date, 2].sort(createComparator({ direction: 'desc' }))).toEqual(['1', date, 2]);
  });

  it('sorts rows by multiple selectors and preserves ties', () => {
    const rows = [
      { team: 'b', data: { score: 3 } },
      { team: 'a', data: { score: 1 } },
      { team: 'a', data: { score: 5 } },
      { team: 'a', data: { score: 5 } },
    ];
    const compare = chainComparators(
      compareBy<(typeof rows)[number]>(row => row.team, { locale: 'en' }),
      compareBy<(typeof rows)[number]>(row => row.data.score, { direction: 'desc' }),
    );
    expect([...rows].sort(compare)).toEqual([rows[2], rows[3], rows[1], rows[0]]);
    expect(compare(rows[2], rows[3])).toBe(0);
    expect(chainComparators()(1, 2)).toBe(0);
  });
});
