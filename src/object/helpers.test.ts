import { describe, expect, it, expectTypeOf } from 'vitest';
import {
  pick, omit, pickBy, omitBy, mapValues, mapKeys, isPlainObject, hasOwn, compactObject,
  invert, deepClone, deepMerge, deepFreeze, flattenObject, unflattenObject, diffObjects,
} from './index';
import type { DeepPartial, DeepReadonly, DeepRequired, Mutable, KeysOfType, Prettify } from './index';

describe('object helpers', () => {
  it('selects and omits own keys, including symbols and numeric keys', () => {
    const symbol = Symbol('key');
    const object = { a: 1, b: 2, 0: 3, [symbol]: 4 };
    expect(pick(object, ['a', symbol])).toEqual({ a: 1, [symbol]: 4 });
    expect(omit(object, ['b', 0])).toEqual({ a: 1, [symbol]: 4 });
    expect(pick(Object.create({ a: 1 }), ['a'])).toEqual({});
    expect(omit(object, [])).not.toBe(object);
    expect(pickBy(object, value => value > 2)).toEqual({ 0: 3, [symbol]: 4 });
    expect(omitBy(object, value => value > 2)).toEqual({ a: 1, b: 2 });
  });

  it('maps values and keys with last-value-wins collisions', () => {
    expect(mapValues({ a: 1, b: 2 }, (value, key) => `${key}:${value}`)).toEqual({ a: 'a:1', b: 'b:2' });
    expect(mapKeys({ a: 1, b: 2 }, () => 'key')).toEqual({ key: 2 });
    expect(mapKeys({ a: 1 }, key => key.toUpperCase())).toEqual({ A: 1 });
  });

  it('handles dangerous-looking keys as ordinary own properties', () => {
    const source = JSON.parse('{"__proto__":{"polluted":true},"constructor":1}');
    for (const result of [pick(source, ['__proto__']), omit(source, []), mapValues(source, x => x), deepClone(source), deepMerge({}, source)]) {
      expect(hasOwn(result, '__proto__')).toBe(true);
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    }
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('identifies plain objects and safely checks ownership', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    for (const value of [null, [], new Date(), new Map(), new (class Example {})(), () => 1]) {
      expect(isPlainObject(value)).toBe(false);
    }
    expect(hasOwn(Object.assign(Object.create(null), { x: 1 }), 'x')).toBe(true);
    expect(hasOwn({}, 'toString')).toBe(false);
  });

  it('compacts only nullish values and groups duplicate inverted values', () => {
    expect(compactObject({ a: null, b: undefined, c: 0, d: false, e: '', f: [] }))
      .toEqual({ c: 0, d: false, e: '', f: [] });
    expect([...invert({ a: 'x', b: 'x', c: 'y' })]).toEqual([['x', ['a', 'b']], ['y', ['c']]]);
    const value = {};
    expect(invert({ a: value, b: value }).get(value)).toEqual(['a', 'b']);
  });

  it('clones cycles, shared references, sparse arrays, and null prototypes', () => {
    const source: any = Object.assign(Object.create(null), { a: { n: 1 }, sparse: new Array(3) });
    source.b = source.a;
    source.self = source;
    const clone = deepClone(source);
    expect(Object.getPrototypeOf(clone)).toBeNull();
    expect(clone.self).toBe(clone);
    expect(clone.a).toBe(clone.b);
    expect(clone.a).not.toBe(source.a);
    expect(clone.sparse.length).toBe(3);
    expect(0 in clone.sparse).toBe(false);
  });

  it('clones maps, sets, dates, regexes, and shared backing buffers', () => {
    const key = { id: 1 };
    const buffer = new ArrayBuffer(8);
    const bytes = new Uint8Array(buffer, 2, 3);
    bytes[0] = 42;
    const regex = /x/gi;
    regex.lastIndex = 2;
    const map = new Map<any, any>();
    map.set(key, map);
    const source = { key, map, set: new Set([key]), date: new Date(123), regex, buffer, bytes, view: new DataView(buffer, 1, 4) };
    const clone = deepClone(source);
    expect(clone.map.get(clone.key)).toBe(clone.map);
    expect(clone.set.has(clone.key)).toBe(true);
    expect(clone.date.getTime()).toBe(123);
    expect(clone.regex.source).toBe('x');
    expect(clone.regex.flags).toBe('gi');
    expect(clone.regex.lastIndex).toBe(2);
    expect(clone.buffer).not.toBe(buffer);
    expect(clone.bytes.buffer).toBe(clone.buffer);
    expect(clone.view.buffer).toBe(clone.buffer);
    expect(clone.bytes[0]).toBe(42);
    expect(clone.bytes.byteOffset).toBe(2);
  });

  it('rejects unsupported clone values', () => {
    for (const value of [() => 1, new WeakMap(), new (class Example {})()]) {
      expect(() => deepClone(value)).toThrow(TypeError);
    }
  });

  it('merges objects without mutation, with explicit array behavior', () => {
    const left = { nested: { a: 1, b: 2 }, list: [{ x: 1 }] };
    const right = { nested: { b: 3 }, list: [{ x: 2 }] };
    expect(deepMerge(left, right)).toEqual({ nested: { a: 1, b: 3 }, list: [{ x: 2 }] });
    expect(deepMerge(left, right, { arrays: 'concat' }).list).toEqual([{ x: 1 }, { x: 2 }]);
    expect(left.list).toEqual([{ x: 1 }]);
    expect(right.list).toEqual([{ x: 2 }]);
    expect(deepMerge(left, right).list).not.toBe(right.list);
    expect(deepMerge({ x: 1 }, { x: undefined })).toEqual({ x: undefined });
    const circular: any = {};
    circular.self = circular;
    expect(() => deepMerge({}, circular)).toThrow(TypeError);
    expect(() => deepMerge([], {})).toThrow(TypeError);
  });

  it('freezes cyclic graphs including non-enumerable properties', () => {
    const object: any = { list: [{ x: 1 }] };
    object.self = object;
    Object.defineProperty(object, 'hidden', { value: { y: 2 } });
    expect(deepFreeze(object)).toBe(object);
    expect(Object.isFrozen(object)).toBe(true);
    expect(Object.isFrozen(object.list)).toBe(true);
    expect(Object.isFrozen(object.list[0])).toBe(true);
    expect(Object.isFrozen(object.hidden)).toBe(true);
  });

  it('validates freeze inputs before mutating anything', () => {
    const object = { child: {}, map: new Map() };
    expect(() => deepFreeze(object)).toThrow(TypeError);
    expect(Object.isFrozen(object.child)).toBe(false);
    expect(() => deepFreeze({ get x() { return {}; } })).toThrow(TypeError);
  });

  it('roundtrips nested objects and escaped paths, preserving array leaves', () => {
    const list = [1, { a: 2 }];
    const object = { a: { b: 1 }, 'a/b': { '~': 2 }, '': { '': 3 }, empty: {}, list };
    const flat = flattenObject(object);
    expect(flat).toEqual({ '/a/b': 1, '/a~1b/~0': 2, '//': 3, '/empty': {}, '/list': list });
    const restored = unflattenObject(flat);
    expect(restored).toEqual(object);
    expect(restored.list).toBe(list);
    expect(flattenObject({})).toEqual({});
    expect(unflattenObject({})).toEqual({});
    expect(unflattenObject({ '/__proto__/x': 1 })).toEqual(JSON.parse('{"__proto__":{"x":1}}'));
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it('rejects malformed paths, conflicts, and recursive flattening cycles', () => {
    for (const flat of [{ a: 1 }, { '/a~2': 1 }, { '/a': {}, '/a/b': 1 }, { '/a/b': 1, '/a': 2 }]) {
      expect(() => unflattenObject(flat)).toThrow(TypeError);
    }
    const circular: any = {};
    circular.self = circular;
    expect(() => flattenObject(circular)).toThrow(TypeError);
  });

  it('reports added, removed, and changed paths with atomic array comparison', () => {
    const before = { nested: { n: 1 }, removed: true, same: NaN };
    const after = { nested: { n: 2 }, added: undefined, same: NaN };
    expect(diffObjects(before, after)).toEqual([
      { type: 'changed', path: ['nested', 'n'], before: 1, after: 2 },
      { type: 'removed', path: ['removed'], before: true },
      { type: 'added', path: ['added'], after: undefined },
    ]);
    const list = [1];
    expect(diffObjects({ list }, { list })).toEqual([]);
    expect(diffObjects({ list }, { list: [1] })[0].type).toBe('changed');
    expect(diffObjects({}, {})).toEqual([]);
  });

  it('exposes useful mapped types', () => {
    type Model = { readonly name: string; child?: { score?: number }; pair: [number, string] };
    expectTypeOf<Mutable<{ readonly x: number }>>().toEqualTypeOf<{ x: number }>();
    expectTypeOf<KeysOfType<Model, string>>().toEqualTypeOf<'name'>();
    expectTypeOf<Prettify<{ a: number } & { b: string }>>().toEqualTypeOf<{ a: number; b: string }>();
    expectTypeOf<DeepPartial<{ a: { b: number } }>>().toEqualTypeOf<{ a?: { b?: number } }>();
    expectTypeOf<DeepRequired<{ a?: { b?: number } }>>().toEqualTypeOf<{ a: { b: number } }>();
    expectTypeOf<DeepReadonly<[number, { x: string }]>>().toEqualTypeOf<readonly [number, { readonly x: string }]>();
    expectTypeOf<DeepReadonly<Map<string, { x: number }>>>().toEqualTypeOf<ReadonlyMap<string, { readonly x: number }>>();
    expectTypeOf(pick({ a: 1, b: 'b' }, ['a'])).toEqualTypeOf<{ a: number }>();
  });
});
