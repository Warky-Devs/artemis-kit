import { describe, it, expect } from 'vitest';
import { decycle, retrocycle } from './decycle';

describe('decycle and retrocycle functions', () => {
  it('should handle non-circular objects correctly', () => {
    const obj = { a: 1, b: 'string', c: true };
    const decycled = decycle(obj);
    expect(decycled).toEqual(obj);
    
    const restored = retrocycle(decycled);
    expect(restored).toEqual(obj);
  });

  it('should handle arrays correctly', () => {
    const arr = [1, 'string', true, { nested: 'object' }];
    const decycled = decycle(arr);
    expect(decycled).toEqual(arr);
    
    const restored = retrocycle(decycled);
    expect(restored).toEqual(arr);
  });

  it('should handle circular references in arrays', () => {
    const arr: any[] = [1, 2, 3];
    arr.push(arr); // Create circular reference
    
    const decycled = decycle(arr);
    expect(decycled).toEqual([1, 2, 3, { $ref: '$' }]);
    
    const restored = retrocycle(decycled);
    expect(restored[0]).toBe(1);
    expect(restored[1]).toBe(2);
    expect(restored[2]).toBe(3);
    expect(restored[3]).toBe(restored); // Circular reference restored
  });

  it('should handle circular references in objects', () => {
    const obj: any = { a: 1, b: 'string' };
    obj.self = obj; // Create circular reference
    
    const decycled = decycle(obj);
    expect(decycled).toEqual({ a: 1, b: 'string', self: { $ref: '$' } });
    
    const restored = retrocycle(decycled);
    expect(restored.a).toBe(1);
    expect(restored.b).toBe('string');
    expect(restored.self).toBe(restored); // Circular reference restored
  });

  it('should handle nested objects with circular references', () => {
    const inner: any = { x: 1 };
    const outer: any = { a: inner, b: 'string' };
    inner.parent = outer; // Create circular reference
    
    const decycled = decycle(outer);
    expect(decycled).toEqual({ 
      a: { x: 1, parent: { $ref: '$' } }, 
      b: 'string' 
    });
    
    const restored = retrocycle(decycled);
    expect(restored.a.x).toBe(1);
    expect(restored.a.parent).toBe(restored); // Circular reference restored
  });

  it('should handle multiple references to the same object', () => {
    const shared = { id: 'shared' };
    const obj = { a: shared, b: shared };
    
    const decycled = decycle(obj);
    expect(decycled).toEqual({ 
      a: { id: 'shared' }, 
      b: { $ref: '$["a"]' } 
    });
    
    const restored = retrocycle(decycled);
    expect(restored.a).toBe(restored.b); // Both refer to the same object
  });

  it('should work with custom replacer function', () => {
    const obj = { a: 1, b: 2, secret: 'hidden' };
    const replacer = (value: any) => {
      if (value && typeof value === 'object' && 'secret' in value) {
        const copy = { ...value };
        copy.secret = '[REDACTED]';
        return copy;
      }
      return value;
    };
    
    const decycled = decycle(obj, replacer);
    expect(decycled).toEqual({ a: 1, b: 2, secret: '[REDACTED]' });
  });

  it('should handle null and undefined values', () => {
    const obj = { a: null, b: undefined, c: { d: null } };
    const decycled = decycle(obj);
    expect(decycled).toEqual(obj);
    
    const restored = retrocycle(decycled);
    expect(restored).toEqual(obj);
  });

  it('should handle built-in objects like Date, RegExp, and more', () => {
    const date = new Date('2023-01-01');
    const regexp = /test/g;
    const obj = { 
      date,
      regexp,
      bool: new Boolean(true),
      num: new Number(42),
      str: new String("test")
    };
    
    const decycled = decycle(obj);
    expect(decycled.date).toBeInstanceOf(Date);
    expect(decycled.regexp).toBeInstanceOf(RegExp);
    expect(decycled.bool).toBeInstanceOf(Boolean);
    expect(decycled.num).toBeInstanceOf(Number);
    expect(decycled.str).toBeInstanceOf(String);
    
    const restored = retrocycle(decycled);
    expect(restored.date).toBeInstanceOf(Date);
    expect(restored.date.toISOString()).toBe(date.toISOString());
    expect(restored.regexp).toBeInstanceOf(RegExp);
    expect(restored.regexp.source).toBe(regexp.source);
  });

  it('should handle complex nested circular references', () => {
    const a: any = { name: 'a' };
    const b: any = { name: 'b' };
    const c: any = { name: 'c' };
    
    a.child = b;
    b.child = c;
    c.parent = a; // Circular reference
    
    const decycled = decycle(a);
    expect(decycled).toEqual({ 
      name: 'a', 
      child: { 
        name: 'b', 
        child: { 
          name: 'c', 
          parent: { $ref: '$' } 
        } 
      } 
    });
    
    const restored = retrocycle(decycled);
    expect(restored.name).toBe('a');
    expect(restored.child.name).toBe('b');
    expect(restored.child.child.name).toBe('c');
    expect(restored.child.child.parent).toBe(restored); // Circular reference restored
  });
  
  it('should handle arrays with multiple circular references', () => {
    const arr1: any[] = [1, 2];
    const arr2: any[] = [3, 4];
    arr1.push(arr2);
    arr2.push(arr1); // Circular reference
    
    const decycled = decycle(arr1);
    expect(decycled).toEqual([1, 2, [3, 4, { $ref: '$' }]]);
    
    const restored = retrocycle(decycled);
    expect(restored[0]).toBe(1);
    expect(restored[1]).toBe(2);
    expect(restored[2][0]).toBe(3);
    expect(restored[2][1]).toBe(4);
    expect(restored[2][2]).toBe(restored); // Circular reference restored
  });
  
  it('should work with JSON.stringify and JSON.parse for circular structures', () => {
    const obj: any = { a: 1, b: 'string' };
    obj.self = obj; // Create circular reference
    
    const decycled = decycle(obj);
    const jsonStr = JSON.stringify(decycled);
    const parsed = JSON.parse(jsonStr);
    const restored = retrocycle(parsed);
    
    expect(restored.a).toBe(1);
    expect(restored.b).toBe('string');
    expect(restored.self).toBe(restored); // Circular reference restored
  });
});