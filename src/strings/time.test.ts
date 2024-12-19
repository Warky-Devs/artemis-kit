import { describe, it, expect } from "vitest";
import { formatSecondToTime } from "./time";

describe("formatSecondToTime", () => {
  it("formats time with hours", () => {
    expect(formatSecondToTime(3661)).toBe("01:01:01");
  });

  it("formats time without hours", () => {
    expect(formatSecondToTime(61)).toBe("01:01");
  });

  it("formats time with zero seconds", () => {
    expect(formatSecondToTime(3600)).toBe("01:00:00");
  });

  it("formats time with zero minutes and seconds", () => {
    expect(formatSecondToTime(0)).toBe("00:00");
  });

  it("handles negative input", () => {
    expect(formatSecondToTime(-1)).toBe("-00:01");
  });

  it("handles decimal input", () => {
    expect(formatSecondToTime(1.5)).toBe("00:01");
  });
});

import { timeStringToSeconds } from "./time";

describe("timeStringToSeconds", () => {
  it("converts valid time strings in HH:MM:SS format", () => {
    expect(timeStringToSeconds("01:02:03")).toBe(3723);
    expect(timeStringToSeconds("12:34:56")).toBe(45296);
  });

  it("converts valid time strings in MM:SS format", () => {
    expect(timeStringToSeconds("02:03")).toBe(123);
    expect(timeStringToSeconds("34:56")).toBe(2096);
  });

  it("throws an error for invalid time strings", () => {
    expect(() => timeStringToSeconds("abc:def:ghi")).toThrowError();
    expect(() => timeStringToSeconds("12:34:56:78")).toThrowError();
  });

  it("handles edge cases", () => {
    expect(timeStringToSeconds("00:00:00")).toBe(0);
    expect(timeStringToSeconds("23:59:59")).toBe(86399);
  });
});
