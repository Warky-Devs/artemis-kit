import { describe, it, expect } from "vitest";
import { trimLeft, trimRight } from "./trim";

describe("trimLeft", () => {
  it("trims default whitespace from the left", () => {
    expect(trimLeft("   hello")).toBe("hello");
    expect(trimLeft("  \t  hello")).toBe("\t  hello");
    expect(trimLeft("hello")).toBe("hello");
  });

  it("trims specified characters from the left", () => {
    expect(trimLeft("---hello", "-")).toBe("hello");
    expect(trimLeft("##hello##", "#")).toBe("hello##");
    expect(trimLeft("aabbccHello", "abc")).toBe("Hello");
  });

  it("respects trimming limit", () => {
    expect(trimLeft("   hello", " ", 2)).toBe(" hello");
    expect(trimLeft("---hello", "-", 1)).toBe("--hello");
    expect(trimLeft("aabbccHello", "abc", 4)).toBe("ccHello");
  });

  it("handles empty strings and edge cases", () => {
    expect(trimLeft("")).toBe("");
    expect(trimLeft("", "-")).toBe("");
    expect(trimLeft(null as any)).toBe(null);
    expect(trimLeft(undefined as any)).toBe(undefined);
  });

  it("handles strings with no matching characters to trim", () => {
    expect(trimLeft("hello", "-")).toBe("hello");
    expect(trimLeft("hello", "123")).toBe("hello");
  });

  it("handles mixed characters to trim", () => {
    expect(trimLeft("-#@hello", "-#@")).toBe("hello");
    expect(trimLeft("-#@hello#@-", "-#@")).toBe("hello#@-");
    expect(trimLeft("-#@hello", "-#@", 2)).toBe("@hello");
  });

  it("handles special characters", () => {
    expect(trimLeft("\n\t\rhello", "\n\t\r")).toBe("hello");
    expect(trimLeft("   \n  hello", " \n")).toBe("hello");
  });

  it("preserves internal whitespace/characters", () => {
    expect(trimLeft("  hello  world  ")).toBe("hello  world  ");
    expect(trimLeft("--hello--world--", "-")).toBe("hello--world--");
  });

  it("handles repeated characters", () => {
    expect(trimLeft("aaaaabcd", "a")).toBe("bcd");
    expect(trimLeft("aaaaabcd", "a", 3)).toBe("aabcd");
  });

  it("handles Unicode characters", () => {
    expect(trimLeft("🌟🌟hello", "🌟")).toBe("hello");
    expect(trimLeft("🌟✨⭐hello", "🌟✨⭐")).toBe("hello");
    expect(trimLeft("🌟✨⭐hello", "🌟✨⭐", 2)).toBe("⭐hello");
  });
});

describe("trimRight", () => {
  it("trims default whitespace from the right", () => {
    expect(trimRight("hello   ")).toBe("hello");
    expect(trimRight("hello  \t  ")).toBe("hello  \t");
    expect(trimRight("hello")).toBe("hello");
  });

  it("trims specified characters from the right", () => {
    expect(trimRight("hello---", "-")).toBe("hello");
    expect(trimRight("##hello##", "#")).toBe("##hello");
    expect(trimRight("Helloaabbcc", "abc")).toBe("Hello");
  });

  it("respects trimming limit", () => {
    expect(trimRight("hello   ", " ", 2)).toBe("hello ");
    expect(trimRight("hello---", "-", 1)).toBe("hello--");
    expect(trimRight("Helloaabbcc", "abc", 4)).toBe("Helloaa");
  });

  it("handles empty strings and edge cases", () => {
    expect(trimRight("")).toBe("");
    expect(trimRight("", "-")).toBe("");
    expect(trimRight(null as any)).toBe(null);
    expect(trimRight(undefined as any)).toBe(undefined);
  });

  it("handles strings with no matching characters to trim", () => {
    expect(trimRight("hello", "-")).toBe("hello");
    expect(trimRight("hello", "123")).toBe("hello");
  });

  it("handles mixed characters to trim", () => {
    expect(trimRight("hello-#@", "-#@")).toBe("hello");
    expect(trimRight("-#@hello#@-", "-#@")).toBe("-#@hello");
    expect(trimRight("hello-#@", "-#@", 2)).toBe("hello-");
  });

  it("handles special characters", () => {
    expect(trimRight("hello\n\t\r", "\n\t\r")).toBe("hello");
    expect(trimRight("hello  \n  ", " \n")).toBe("hello");
  });

  it("preserves internal whitespace/characters", () => {
    expect(trimRight("  hello  world  ")).toBe("  hello  world");
    expect(trimRight("--hello--world--", "-")).toBe("--hello--world");
  });

  it("handles repeated characters", () => {
    expect(trimRight("abcaaaaa", "a")).toBe("abc");
    expect(trimRight("abcaaaaa", "a", 3)).toBe("abcaa");
  });

  it("handles Unicode characters", () => {
    expect(trimRight("hello🌟🌟", "🌟")).toBe("hello");
    expect(trimRight("hello🌟✨⭐", "🌟✨⭐")).toBe("hello");
    expect(trimRight("hello🌟✨⭐", "🌟✨⭐", 2)).toBe("hello🌟");
  });
});
