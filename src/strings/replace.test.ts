import { describe, it, expect } from "vitest";
import { replaceStr, replaceStrAll } from "./replace";

describe("replaceStr", () => {
  it("replaces the first occurrence by default", () => {
    expect(replaceStr("hello hello world", "hello", "hi")).toBe(
      "hi hello world"
    );
  });

  it("replaces specific occurrences", () => {
    const str = "hello hello hello world";
    expect(replaceStr(str, "hello", "hi", 1)).toBe("hi hello hello world");
    expect(replaceStr(str, "hello", "hi", 2)).toBe("hello hi hello world");
    expect(replaceStr(str, "hello", "hi", 3)).toBe("hello hello hi world");
  });

  it("handles case sensitivity correctly", () => {
    const str = "The quick brown fox jumps over the lazy dog";
    // Case-sensitive (default)
    expect(replaceStr(str, "the", "a")).toBe(
      "The quick brown fox jumps over a lazy dog"
    );
    // Case-insensitive
    expect(replaceStr(str, "the", "a", 1, true)).toBe(
      "a quick brown fox jumps over the lazy dog"
    );
  });

  it("handles mixed case with ignoreCase option", () => {
    const str = "Hello HELLO hello";
    expect(replaceStr(str, "hello", "hi", 1, false)).toBe("Hello HELLO hi");
    expect(replaceStr(str, "hello", "hi", 1, true)).toBe("hi HELLO hello");
    expect(replaceStr(str, "hello", "hi", 2, true)).toBe("Hello hi hello");
  });

  it("handles empty strings and invalid occurrences", () => {
    expect(replaceStr("", "hello", "hi")).toBe("");
    expect(replaceStr("hello world", "", "hi")).toBe("hello world");
    expect(replaceStr("hello world", "hello", "")).toBe(" world");
    expect(replaceStr("hello world", "hello", "hi", 0)).toBe("hello world");
  });
});

describe("replaceStrAll", () => {
  it("replaces all occurrences by default", () => {
    expect(replaceStrAll("hello hello world", "hello", "hi")).toBe(
      "hi hi world"
    );
  });

  it("respects maximum replacement limit", () => {
    const str = "hello hello hello world";
    expect(replaceStrAll(str, "hello", "hi", 1)).toBe("hi hello hello world");
    expect(replaceStrAll(str, "hello", "hi", 2)).toBe("hi hi hello world");
  });

  it("handles case sensitivity correctly", () => {
    const str = "The quick brown fox jumps over the lazy dog";
    // Case-sensitive (default)
    expect(replaceStrAll(str, "the", "a", 2)).toBe(
      "The quick brown fox jumps over a lazy dog"
    );
    // Case-insensitive
    expect(replaceStrAll(str, "the", "a", 2, true)).toBe(
      "a quick brown fox jumps over a lazy dog"
    );
  });

  it("handles mixed case with ignoreCase option", () => {
    const str = "Hello HELLO hello world";
    expect(replaceStrAll(str, "hello", "hi", 2, false)).toBe(
      "Hello HELLO hi world"
    );
    expect(replaceStrAll(str, "hello", "hi", 2, true)).toBe(
      "hi hi hello world"
    );
    expect(replaceStrAll(str, "hello", "hi", 3, true)).toBe("hi hi hi world");
  });

  it("handles empty strings and invalid times", () => {
    expect(replaceStrAll("", "hello", "hi")).toBe("");
    expect(replaceStrAll("hello world", "", "hi")).toBe("hello world");
    expect(replaceStrAll("hello world", "hello", "hi", 0)).toBe("hello world");
  });

  it("handles overlapping patterns", () => {
    expect(replaceStrAll("aaaa", "aa", "b")).toBe("bb");
    expect(replaceStrAll("aaaa", "aa", "b", 1)).toBe("baa");
  });

  it("maintains original case when not using ignoreCase", () => {
    const str = "HELLO hello HELLO";
    expect(replaceStrAll(str, "HELLO", "hi")).toBe("hi hello hi");
    expect(replaceStrAll(str, "hello", "hi")).toBe("HELLO hi HELLO");
  });
});
