import { describe, it, expect } from "vitest";
import { humanFileSize } from "./fileSize";

describe("humanFileSize", () => {
  // Test basic byte values
  it("should handle values less than threshold", () => {
    expect(humanFileSize(0)).toBe("0 B");
    expect(humanFileSize(500)).toBe("500 B");
    expect(humanFileSize(-500)).toBe("-500 B");
  });

  // Test binary units (default behavior)
  it("should format sizes using binary units correctly", () => {
    expect(humanFileSize(1024)).toBe("1.0 KiB");
    expect(humanFileSize(1024 * 1024)).toBe("1.0 MiB");
    expect(humanFileSize(1024 * 1024 * 1024)).toBe("1.0 GiB");
    expect(humanFileSize(1024 * 1024 * 1024 * 1024)).toBe("1.0 TiB");
  });

  // Test SI units
  it("should format sizes using SI units correctly when si=true", () => {
    expect(humanFileSize(1000, true)).toBe("1.0 kB");
    expect(humanFileSize(1000 * 1000, true)).toBe("1.0 MB");
    expect(humanFileSize(1000 * 1000 * 1000, true)).toBe("1.0 GB");
    expect(humanFileSize(1000 * 1000 * 1000 * 1000, true)).toBe("1.0 TB");
  });

  // Test decimal places
  it("should respect decimal places parameter", () => {
    expect(humanFileSize(1536, false, 0)).toBe("2 KiB");
    expect(humanFileSize(1536, false, 1)).toBe("1.5 KiB");
    expect(humanFileSize(1536, false, 2)).toBe("1.50 KiB");
    expect(humanFileSize(1536, false, 3)).toBe("1.500 KiB");
  });

  // Test edge cases
  it("should handle edge cases correctly", () => {
    // Zero
    expect(humanFileSize(0, false, 2)).toBe("0 B");
    expect(humanFileSize(0, true, 2)).toBe("0 B");

    // Negative values
    expect(humanFileSize(-1024)).toBe("-1.0 KiB");
    expect(humanFileSize(-1000, true)).toBe("-1.0 kB");

    // Very large numbers
    const exabyte = 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
    expect(humanFileSize(exabyte)).toBe("1.0 EiB");

    // Very large SI numbers
    const siExabyte = 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
    expect(humanFileSize(siExabyte, true)).toBe("1.0 EB");
  });

  // Test boundary conditions
  it("should handle boundary conditions correctly", () => {
    // Just below and above KiB threshold
    expect(humanFileSize(1023)).toBe("1023 B");
    expect(humanFileSize(1025)).toBe("1.0 KiB");

    // Just below and above SI KB threshold
    expect(humanFileSize(999, true)).toBe("999 B");
    expect(humanFileSize(1001, true)).toBe("1.0 kB");
  });

  // Test precision handling
  it("should handle precision edge cases correctly", () => {
    // Values that might cause rounding issues
    expect(humanFileSize(1023.9)).toBe("1023.9 B");
    expect(humanFileSize(1024 * 1.5, false, 3)).toBe("1.500 KiB");
    expect(humanFileSize(1000 * 1.5, true, 3)).toBe("1.500 kB");
  });
});
