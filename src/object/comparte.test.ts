import { describe, expect, test } from "vitest";
import { objectCompare } from "./compare";

describe("objectCompare", () => {
  // Basic shallow comparison tests
  test("should return true for identical simple objects in shallow mode", () => {
    const obj1 = { a: 1, b: "test", c: true };
    const obj2 = { a: 1, b: "test", c: true };
    expect(objectCompare(obj1, obj2)).toBe(true);
  });

  test("should return false for different simple objects in shallow mode", () => {
    const obj1 = { a: 1, b: "test" };
    const obj2 = { a: 1, b: "different" };
    expect(objectCompare(obj1, obj2)).toBe(false);
  });

  // Property order tests
  test("should return true for objects with same properties in different order", () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const obj2 = { c: 3, a: 1, b: 2 };
    expect(objectCompare(obj1, obj2)).toBe(true);
  });

  // Deep comparison tests
  test("should compare nested objects when deep is true", () => {
    const obj1 = { a: { b: 1, c: 2 }, d: 3 };
    const obj2 = { a: { b: 1, c: 2 }, d: 3 };
    expect(objectCompare(obj1, obj2, true)).toBe(true);
  });

  test("should detect differences in nested objects when deep is true", () => {
    const obj1 = { a: { b: 1, c: 2 }, d: 3 };
    const obj2 = { a: { b: 1, c: 3 }, d: 3 };
    expect(objectCompare(obj1, obj2, true)).toBe(false);
  });

  // Array comparison tests
  test("should compare arrays correctly in deep mode", () => {
    const obj1 = { arr: [1, 2, { x: 1 }] };
    const obj2 = { arr: [1, 2, { x: 1 }] };
    expect(objectCompare(obj1, obj2, true)).toBe(true);
  });

  test("should detect array differences in deep mode", () => {
    const obj1 = { arr: [1, 2, { x: 1 }] };
    const obj2 = { arr: [1, 2, { x: 2 }] };
    expect(objectCompare(obj1, obj2, true)).toBe(false);
  });

  // Edge cases
  test("should handle null values", () => {
    const obj1 = { a: null };
    const obj2 = { a: null };
    expect(objectCompare(obj1, obj2)).toBe(true);
  });

  test("should handle undefined values", () => {
    const obj1 = { a: undefined };
    const obj2 = { a: undefined };
    expect(objectCompare(obj1, obj2)).toBe(true);
  });

  test("should return false when comparing with null", () => {
    const obj1 = { a: 1 };
    expect(objectCompare(obj1, null as any)).toBe(false);
    expect(objectCompare(null as any, obj1)).toBe(false);
  });

  // Complex nested structure tests
  test("should handle complex nested structures in deep mode", () => {
    const obj1 = {
      a: 1,
      b: {
        c: [1, 2, { d: 3 }],
        e: { f: 4, g: [5, 6] },
      },
    };
    const obj2 = {
      a: 1,
      b: {
        c: [1, 2, { d: 3 }],
        e: { f: 4, g: [5, 6] },
      },
    };
    expect(objectCompare(obj1, obj2, true)).toBe(true);
  });

  test("should detect differences in complex nested structures", () => {
    const obj1 = {
      a: 1,
      b: {
        c: [1, 2, { d: 3 }],
        e: { f: 4, g: [5, 6] },
      },
    };
    const obj2 = {
      a: 1,
      b: {
        c: [1, 2, { d: 3 }],
        e: { f: 4, g: [5, 7] }, // Changed 6 to 7
      },
    };
    expect(objectCompare(obj1, obj2, true)).toBe(false);
  });

  // Property existence tests
  test("should handle objects with different number of properties", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2, c: 3 };
    expect(objectCompare(obj1, obj2)).toBe(false);
  });

  test("should handle objects with same number of properties but different keys", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, c: 2 };
    expect(objectCompare(obj1, obj2)).toBe(false);
  });

  // Type comparison tests
  test("should handle type coercion correctly", () => {
    const obj1 = { a: 1 };
    const obj2 = { a: "1" };
    expect(objectCompare(obj1, obj2)).toBe(false);
  });

  test("should handle empty objects", () => {
    const obj1 = {};
    const obj2 = {};
    expect(objectCompare(obj1, obj2)).toBe(true);
    expect(objectCompare(obj1, obj2, true)).toBe(true);
  });
});
