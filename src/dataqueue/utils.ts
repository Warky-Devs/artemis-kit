// utils.ts
export class QueueUtils {
    static deepClone<T>(obj: T): T {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }
  
      if (Array.isArray(obj)) {
        return obj.map(item => QueueUtils.deepClone(item)) as unknown as T;
      }
  
      return Object.keys(obj).reduce((acc, key) => {
        acc[key] = QueueUtils.deepClone(obj[key]);
        return acc;
      }, {} as T);
    }
  
    static createPath(parts: (string | number)[]): string {
      return parts.join('.');
    }
  
    static parsePath(path: string): string[] {
      return path.split('.');
    }
  
    static getValueAtPath<T>(obj: T, path: string): any {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    }
  
    static setValueAtPath<T>(obj: T, path: string, value: any): T {
      const clone = QueueUtils.deepClone(obj);
      const keys = path.split('.');
      const lastKey = keys.pop()!;
      const target = keys.reduce((current:any, key) => {
        if (!(key in current)) {
          current[key] = {};
        }
        return current[key];
      }, clone);
      target[lastKey] = value;
      return clone;
    }
  
    static compareValues(a: any, b: any, direction: 'asc' | 'desc' = 'asc'): number {
      if (a === b) return 0;
      if (a === null) return direction === 'asc' ? -1 : 1;
      if (b === null) return direction === 'asc' ? 1 : -1;
  
      const typeA = typeof a;
      const typeB = typeof b;
  
      if (typeA !== typeB) {
        a = String(a);
        b = String(b);
      }
  
      if (typeA === 'string') {
        return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      }
  
      return direction === 'asc' ? a - b : b - a;
    }
  
    static debounce<T extends (...args: any[]) => any>(
      func: T,
      wait: number
    ): (...args: Parameters<T>) => void {
      let timeout: any;
      return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    }
  
    static throttle<T extends (...args: any[]) => any>(
      func: T,
      limit: number
    ): (...args: Parameters<T>) => void {
      let inThrottle: boolean;
      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    }
  
    static batch(callback: () => void): void {
      Promise.resolve().then(callback);
    }
  }
  
  // Decorators for method enhancement
  export function debounce(wait: number) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const original = descriptor.value;
      descriptor.value = QueueUtils.debounce(original, wait);
      return descriptor;
    };
  }
  
  export function throttle(limit: number) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const original = descriptor.value;
      descriptor.value = QueueUtils.throttle(original, limit);
      return descriptor;
    };
  }