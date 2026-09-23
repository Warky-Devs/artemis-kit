/** Make every nested property optional; preserve callable and built-in values. */
export type DeepPartial<T> = T extends (...args: any[]) => any ? T
  : T extends Date | RegExp ? T
  : T extends ReadonlyMap<infer K, infer V> ? Map<K, DeepPartial<V>>
  : T extends ReadonlySet<infer V> ? Set<DeepPartial<V>>
  : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/** Recursively readonly properties, arrays, maps, and sets. */
export type DeepReadonly<T> = T extends (...args: any[]) => any ? T
  : T extends Date | RegExp ? T
  : T extends ReadonlyMap<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends ReadonlySet<infer V> ? ReadonlySet<DeepReadonly<V>>
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

/** Make nested properties required; does not perform runtime validation. */
export type DeepRequired<T> = T extends (...args: any[]) => any ? T
  : T extends Date | RegExp ? T
  : T extends ReadonlyMap<infer K, infer V> ? Map<K, DeepRequired<V>>
  : T extends ReadonlySet<infer V> ? Set<DeepRequired<V>>
  : T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

export type Mutable<T> = { -readonly [K in keyof T]: T[K] };
export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
