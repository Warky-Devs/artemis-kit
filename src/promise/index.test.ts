import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { WaitUntil, debounce, throttle, measureTime } from "./index";

describe("WaitUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should resolve when condition becomes true", async () => {
    let flag = false;
    setTimeout(() => {
      flag = true;
    }, 1000);

    const promise = WaitUntil(() => flag);
    await vi.advanceTimersByTimeAsync(1000);

    await promise; // Should resolve without throwing
  });

  it("should reject on timeout", async () => {
    let rejected = false;
    const promise = WaitUntil(() => false).catch((err) => {
      expect(err.message).toBe("Wait Timeout");
      rejected = true;
    });

    await vi.advanceTimersByTimeAsync(5000);
    await promise;
    expect(rejected).toBe(true);
  });

  it("should respect custom timeout", async () => {
    let rejected = false;
    const promise = WaitUntil(() => false, { timeout: 2000 }).catch((err) => {
      expect(err.message).toBe("Wait Timeout");
      rejected = true;
    });

    await vi.advanceTimersByTimeAsync(2000);
    await promise;
    expect(rejected).toBe(true);
  });

  it("should check condition at specified interval", async () => {
    const mockCondition = vi.fn(() => false);
    let rejected = false;

    const promise = WaitUntil(mockCondition, { interval: 200 }).catch((err) => {
      expect(err.message).toBe("Wait Timeout");
      rejected = true;
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(mockCondition).toHaveBeenCalledTimes(5); // 1000ms / 200ms = 5 calls

    await vi.advanceTimersByTimeAsync(4000);
    await promise;
    expect(rejected).toBe(true);
  });
});

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delay function execution", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    expect(mockFn).not.toBeCalled();

    vi.advanceTimersByTime(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should only execute once for multiple calls within wait period", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(1000);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should pass correct arguments to the debounced function", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn("test", 123);
    vi.advanceTimersByTime(1000);

    expect(mockFn).toHaveBeenCalledWith("test", 123);
  });

  it("should reset timer on subsequent calls", () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 1000);

    debouncedFn();
    vi.advanceTimersByTime(500);

    debouncedFn();
    vi.advanceTimersByTime(500);
    expect(mockFn).not.toBeCalled();

    vi.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should execute immediately on first call", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 1000);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should ignore calls within throttle period", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 1000);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("should allow execution after throttle period", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 1000);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it("should pass correct arguments to the throttled function", () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 1000);

    throttledFn("test", 123);
    expect(mockFn).toHaveBeenCalledWith("test", 123);
  });
});

describe("measureTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should measure execution time of async function", async () => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const fn = async () => {
      await delay(100);
      return "result";
    };

    const measurePromise = measureTime(fn);
    await vi.advanceTimersByTimeAsync(100);
    const { result, duration } = await measurePromise;

    expect(result).toBe("result");
    expect(duration).toBeGreaterThan(0);
  });

  it("should handle rejected promises", async () => {
    const fn = async () => {
      throw new Error("Test error");
    };

    await expect(measureTime(fn)).rejects.toThrow("Test error");
  });

  it("should return precise timing for fast operations", async () => {
    const fn = async () => "quick result";

    const { duration } = await measureTime(fn);
    expect(duration).toBeLessThan(100); // Should be nearly instant
  });

  it("should handle functions returning different types", async () => {
    const numberFn = async () => 42;
    const { result: numResult } = await measureTime(numberFn);
    expect(numResult).toBe(42);

    const objectFn = async () => ({ key: "value" });
    const { result: objResult } = await measureTime(objectFn);
    expect(objResult).toEqual({ key: "value" });
  });
});
