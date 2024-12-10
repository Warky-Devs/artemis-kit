import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getPlural,
  formatList,
  compareStrings,
  formatPercent,
  formatUnit,
  parseNumberWords,
  //handleBiDi,
} from "./locale";

describe("formatNumber", () => {
  it("formats numbers according to locale", () => {
    expect(formatNumber(1234.56, "en-US")).toBe("1,234.56");
    expect(formatNumber(1234.56, "de-DE")).toBe("1.234,56");
    expect(formatNumber(1234.56, "fr-FR")).toBe("1 234,56");
    //expect(formatNumber(1234.56, "af-ZA")).toBe("1 234,56");
  });

  it("handles custom format options", () => {
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    expect(formatNumber(1234, "en-US", options)).toBe("1,234.00");
    //expect(formatNumber(1234, "af-ZA", options)).toBe("1 234,00");
  });
});

describe("formatCurrency", () => {
  it("formats currency according to locale and currency code", () => {
    expect(formatCurrency(123.45, "en-US", "USD")).toBe("$123.45");
    //expect(formatCurrency(123.45, "de-DE", "EUR")).toBe("123,45 €");
    expect(formatCurrency(123.45, "ja-JP", "JPY")).toBe("￥123");
    //expect(formatCurrency(123.45, "af-ZA", "ZAR")).toBe("R 123,45");
  });
});

describe("formatDate", () => {
  it("formats dates according to locale", () => {
    const date = new Date("2024-01-15");

    expect(formatDate(date, "en-US")).toMatch(/1\/15\/2024|15\/1\/2024/);
    expect(formatDate(date, "de-DE")).toMatch(/15\.1\.2024|15\.01\.2024/);
    expect(formatDate(date, "af-ZA")).toMatch(/2024-01-15|2024\/01\/15/);
  });

  it("handles custom date format options", () => {
    const date = new Date("2024-01-15");
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    } as const;

    expect(formatDate(date, "en-US", options)).toBe("January 15, 2024");
    expect(formatDate(date, "af-ZA", options)).toMatch(/15 Januarie 2024/);
  });
});

describe("formatRelativeTime", () => {
  it("formats relative time based on locale", () => {
    expect(formatRelativeTime(-1, "day", "en-US")).toBe("yesterday");
    expect(formatRelativeTime(1, "day", "en-US")).toBe("tomorrow");
    expect(formatRelativeTime(-1, "day", "af-ZA")).toMatch(/gister|yesterday/);
  });
});

describe("getPlural", () => {
  it("returns correct plural forms based on count and locale", () => {
    const forms = {
      one: "item",
      other: "items",
    };

    expect(getPlural(1, "en-US", forms)).toBe("item");
    expect(getPlural(2, "en-US", forms)).toBe("items");
  });

  it("handles Afrikaans plural rules", () => {
    const afForms = {
      one: "item",
      other: "items",
    };
    expect(getPlural(1, "af-ZA", afForms)).toBe("item");
    expect(getPlural(2, "af-ZA", afForms)).toBe("items");
  });
});

describe("formatList", () => {
  it("formats lists according to locale conventions", () => {
    const items = ["apple", "banana", "orange"];

    expect(formatList(items, "en-US")).toBe("apple, banana, and orange");
    expect(formatList(items, "af-ZA")).toMatch(/apple, banana(,)? en orange/);
  });
});

describe("compareStrings", () => {
  it("compares strings according to locale rules", () => {
    expect(compareStrings("a", "b", "en-US")).toBeLessThan(0);
    expect(compareStrings("b", "a", "af-ZA")).toBeGreaterThan(0);
  });
});

describe("formatPercent", () => {
  it("formats percentages according to locale", () => {
    expect(formatPercent(0.1234, "en-US")).toBe("12%");
    expect(formatPercent(0.1234, "af-ZA")).toBe("12%");
    expect(formatPercent(0.1234, "af-ZA", 1)).toBe("12,3%");
  });
});

describe("formatUnit", () => {
  it("formats units according to locale", () => {
    expect(formatUnit(123, "kilometer", "en-US")).toMatch(
      /123 kilometers|123 km/
    );
    expect(formatUnit(123, "kilometer", "af-ZA")).toMatch(
      /123 kilometer|123 km/
    );
  });
});

describe("parseNumberWords", () => {
  it("converts number words to digits for English", () => {
    expect(parseNumberWords("one", "en-US")).toBe(1);
    expect(parseNumberWords("five", "en-US")).toBe(5);
    expect(parseNumberWords("invalid", "en-US")).toBeNull();
  });

  it("converts number words to digits for Afrikaans", () => {
    expect(parseNumberWords("een", "af-ZA")).toBe(1);
    expect(parseNumberWords("vyf", "af-ZA")).toBe(5);
    expect(parseNumberWords("ongeldig", "af-ZA")).toBeNull();
  });
});
