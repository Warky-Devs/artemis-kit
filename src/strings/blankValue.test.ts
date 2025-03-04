import { describe, it, expect } from "vitest";
import { blankValue } from "./blankValue";

describe("blankValue function", () => {
  it("should return undefined when no arguments are provided", () => {
    expect(blankValue()).toBe(undefined);
  });

  it("should return the first non-blank value", () => {
    expect(blankValue(undefined, null, "value")).toBe("value");
    expect(blankValue(null, 42, "string")).toBe(42);
    expect(blankValue(undefined, null, 0, "", [], {}, "valid")).toBe("valid");
  });

  it("should consider 0 as blank for numbers", () => {
    expect(blankValue(0, 42)).toBe(42);
    expect(blankValue(0, "string")).toBe("string");
    expect(blankValue(undefined, 0, null, 42)).toBe(42);
  });

  it("should consider empty string as blank for strings", () => {
    expect(blankValue("", "value")).toBe("value");
    expect(blankValue(undefined, "", "text")).toBe("text");
  });

  it("should consider empty arrays as blank", () => {
    expect(blankValue([], [1, 2, 3])).toEqual([1, 2, 3]);
    expect(blankValue(undefined, [], ["item"])).toEqual(["item"]);
  });

  it("should consider empty objects as blank", () => {
    expect(blankValue({}, { key: "value" })).toEqual({ key: "value" });
    expect(blankValue(undefined, {}, { name: "John" })).toEqual({
      name: "John",
    });
  });

  it("should return the last argument if all values are blank", () => {
    expect(blankValue(undefined, null)).toBe(null);
    expect(blankValue(undefined, null, 0, "", [], {})).toEqual({});
  });

  it("should work with various data types in the same call", () => {
    expect(blankValue(0, "", [], {}, "mixed")).toBe("mixed");
    expect(blankValue(undefined, null, 0, 42, "", "text", [], [1, 2])).toBe(42);
  });

  it("should handle complex nested structures correctly", () => {
    const complexObj = { nested: { data: "value" } };
    expect(blankValue({}, complexObj)).toEqual(complexObj);

    const nestedArray = [
      [1, 2],
      [3, 4],
    ];
    expect(blankValue([], nestedArray)).toEqual(nestedArray);
  });

  it("should maintain type correctness with generics", () => {
    const stringResult: string = blankValue<string>(undefined, "", "text");
    expect(stringResult).toBe("text");

    const numResult: number = blankValue<number>(null, 0, 42);
    expect(numResult).toBe(42);

    const arrayResult: number[] = blankValue<number[]>([], [1, 2, 3]);
    expect(arrayResult).toEqual([1, 2, 3]);

    interface User {
      name: string;
      age?: number;
    }
    const objResult: User = blankValue<User>({}, { name: "John" });
    expect(objResult).toEqual({ name: "John" });
  });

  it("should handle falsy values that are not blank correctly", () => {
    expect(blankValue(undefined, false)).toBe(false);
    expect(blankValue(null, NaN)).toBeNaN();
  });
});
