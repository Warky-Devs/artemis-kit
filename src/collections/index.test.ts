import { describe, expect, it } from 'vitest';
import { groupBy, keyBy, partition, uniqueBy } from './index';

describe('collections', () => {
  const rows = Object.freeze([
    Object.freeze({ id: 1, team: 'a' }),
    Object.freeze({ id: 2, team: 'b' }),
    Object.freeze({ id: 3, team: 'a' }),
  ]);

  it('groups in insertion order without changing inputs', () => {
    const grouped = groupBy(rows, row => row.team);
    expect([...grouped]).toEqual([['a', [rows[0], rows[2]]], ['b', [rows[1]]]]);
    expect(grouped.get('a')[0]).toBe(rows[0]);
  });

  it('keeps the last duplicate for keyBy and the first for uniqueBy', () => {
    expect([...keyBy(rows, row => row.team)]).toEqual([['a', rows[2]], ['b', rows[1]]]);
    expect(uniqueBy(rows, row => row.team)).toEqual([rows[0], rows[1]]);
  });

  it('supports object identity, NaN, and prototype-like keys', () => {
    const key = {};
    const keys = [key, {}, key, NaN, NaN, '__proto__', 'constructor'];
    expect(groupBy(keys, value => value).get(key)).toEqual([key, key]);
    expect(keyBy(keys, value => value).has('__proto__')).toBe(true);
    expect(uniqueBy(keys, value => value)).toHaveLength(5);
  });

  it('partitions in order into independent arrays', () => {
    const [matching, remaining] = partition(rows, row => row.team === 'a');
    expect(matching).toEqual([rows[0], rows[2]]);
    expect(remaining).toEqual([rows[1]]);
    expect(partition(rows, () => true)).toEqual([[...rows], []]);
    expect(partition(rows, () => false)).toEqual([[], [...rows]]);
  });

  it('handles empty inputs', () => {
    expect(groupBy([], value => value).size).toBe(0);
    expect(keyBy([], value => value).size).toBe(0);
    expect(uniqueBy([], value => value)).toEqual([]);
    expect(partition([], () => true)).toEqual([[], []]);
  });
});
