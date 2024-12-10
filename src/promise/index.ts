/**
 * Configuration options for the WaitUntil function
 */
interface WaitUntilOptions {
  /** Maximum time to wait in milliseconds before timing out (default: 5000ms) */
  timeout?: number;
  /** Interval between condition checks in milliseconds (default: 100ms) */
  interval?: number;
}

/**
 * Asynchronously waits until a condition is met or times out
 * @param condition - Function that returns true when the wait condition is satisfied
 * @param options - Configuration options for timeout and check interval
 * @throws {Error} When the timeout period is exceeded
 * @returns Promise that resolves when the condition is met
 * @example
 * await WaitUntil(() => someElement.isVisible(), { timeout: 10000 });
 */
export const WaitUntil = async (
  condition: () => boolean,
  options?: WaitUntilOptions
): Promise<void> =>
  new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (!condition()) {
        return;
      }
      clearInterval(interval);
      resolve();
    }, options?.interval ?? 100);

    setTimeout(() => {
      clearInterval(interval);
      reject(Error("Wait Timeout"));
    }, options?.timeout ?? 5000);
  });

/**
 * Creates a debounced version of a function that delays its execution
 * until after the specified wait time has elapsed since the last call
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

/**
 * Creates a throttled version of a function that executes at most once
 * during the specified interval
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Measures the execution time of an async function
 */
export const measureTime = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
};
