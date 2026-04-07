import { describe, it, expect } from 'vitest';
import { fromBaseN, toBaseN } from './baseNumber'; // Update with actual path

// This test suite targets ES6+ environments

describe('Base-N Converters', () => {
  describe('fromBaseN', () => {
    // Basic conversion tests
    it('should convert base 10 strings correctly', () => {
      expect(fromBaseN('0', 10)).toBe(BigInt(0));
      expect(fromBaseN('123', 10)).toBe(BigInt(123));
      expect(fromBaseN('9999', 10)).toBe(BigInt(9999));
    });

    it('should convert base 2 (binary) strings correctly', () => {
      expect(fromBaseN('0', 2)).toBe(BigInt(0));
      expect(fromBaseN('1', 2)).toBe(BigInt(1));
      expect(fromBaseN('10', 2)).toBe(BigInt(2));
      expect(fromBaseN('1010', 2)).toBe(BigInt(10));
      expect(fromBaseN('11111111', 2)).toBe(BigInt(255));
    });

    it('should convert base 16 (hex) strings correctly', () => {
      expect(fromBaseN('0', 16)).toBe(BigInt(0));
      expect(fromBaseN('A', 16)).toBe(BigInt(10));
      expect(fromBaseN('F', 16)).toBe(BigInt(15));
      expect(fromBaseN('10', 16)).toBe(BigInt(16));
      expect(fromBaseN('FF', 16)).toBe(BigInt(255));
      expect(fromBaseN('ABC', 16)).toBe(BigInt(2748));
      expect(fromBaseN('DEADBEEF', 16)).toBe(BigInt(3735928559));
    });

    it('should convert base 36 strings correctly', () => {
      expect(fromBaseN('0', 36)).toBe(BigInt(0));
      expect(fromBaseN('Z', 36)).toBe(BigInt(35));
      expect(fromBaseN('10', 36)).toBe(BigInt(36));
      expect(fromBaseN('CLAUDE', 36)).toBe(BigInt(761371970));
    });

    // Case insensitivity
    it('should be case insensitive', () => {
      expect(fromBaseN('abc', 16)).toBe(BigInt(2748));
      expect(fromBaseN('ABC', 16)).toBe(BigInt(2748));
      expect(fromBaseN('AbC', 16)).toBe(BigInt(2748));
      expect(fromBaseN('claude', 36)).toBe(BigInt(761371970));
      expect(fromBaseN('CLAUDE', 36)).toBe(BigInt(761371970));
    });

    // Default base
    it('should use base 36 by default', () => {
      expect(fromBaseN('Z')).toBe(BigInt(35));
      expect(fromBaseN('10')).toBe(BigInt(36));
    });

    // Edge cases
    it('should handle empty string or null', () => {
      expect(fromBaseN('')).toBe(BigInt(0));
      expect(fromBaseN('', 10)).toBe(BigInt(0));
    });

    it('should handle very large numbers', () => {
      expect(fromBaseN('ZZZZZZZZZZZZ', 36)).toBe(BigInt('4738381338321616895'));
    });

    // Error cases
    it('should throw error for invalid base', () => {
      expect(() => fromBaseN('123', 1)).toThrow('Base must be between 2 and 36');
      expect(() => fromBaseN('123', 37)).toThrow('Base must be between 2 and 36');
    });

    it('should throw error for invalid characters', () => {
      expect(() => fromBaseN('12$3', 10)).toThrow('Invalid character in input string: $');
      expect(() => fromBaseN('XYZ', 10)).toThrow('Digit Z is invalid for base 10');
    });

    it('should throw error for digit out of range for base', () => {
      expect(() => fromBaseN('129', 9)).toThrow('Digit 9 is invalid for base 9');
      expect(() => fromBaseN('12A', 10)).toThrow('Digit A is invalid for base 10');
    });
  });

  describe('toBaseN', () => {
    // Basic conversion tests
    it('should convert to base 10 strings correctly', () => {
      expect(toBaseN(0, 10)).toBe('0');
      expect(toBaseN(123, 10)).toBe('123');
      expect(toBaseN(9999, 10)).toBe('9999');
    });

    it('should convert to base 2 (binary) strings correctly', () => {
      expect(toBaseN(0, 2)).toBe('0');
      expect(toBaseN(1, 2)).toBe('1');
      expect(toBaseN(2, 2)).toBe('10');
      expect(toBaseN(10, 2)).toBe('1010');
      expect(toBaseN(255, 2)).toBe('11111111');
    });

    it('should convert to base 16 (hex) strings correctly', () => {
      expect(toBaseN(0, 16)).toBe('0');
      expect(toBaseN(10, 16)).toBe('A');
      expect(toBaseN(15, 16)).toBe('F');
      expect(toBaseN(16, 16)).toBe('10');
      expect(toBaseN(255, 16)).toBe('FF');
      expect(toBaseN(2748, 16)).toBe('ABC');
      expect(toBaseN(3735928559, 16)).toBe('DEADBEEF');
    });

    it('should convert to base 36 strings correctly', () => {
      expect(toBaseN(0, 36)).toBe('0');
      expect(toBaseN(35, 36)).toBe('Z');
      expect(toBaseN(36, 36)).toBe('10');
      expect(toBaseN(761371970, 36)).toBe('CLAUDE');
    });

    // Default base
    it('should use base 36 by default', () => {
      expect(toBaseN(35)).toBe('Z');
      expect(toBaseN(36)).toBe('10');
    });

    // Edge cases
    it('should handle zero', () => {
      expect(toBaseN(0)).toBe('0');
      expect(toBaseN(BigInt(0))).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(toBaseN(-123, 10)).toBe('-123');
      expect(toBaseN(-15, 16)).toBe('-F');
      expect(toBaseN(-35, 36)).toBe('-Z');
    });

    it('should handle BigInt inputs', () => {
      expect(toBaseN(BigInt(123), 10)).toBe('123');
      expect(toBaseN(BigInt('9007199254740991'), 16)).toBe('1FFFFFFFFFFFFF');
      expect(toBaseN(BigInt('4738381338321616895'), 36)).toBe('ZZZZZZZZZZZZ');
    });

    // Error cases
    it('should throw error for invalid base', () => {
      expect(() => toBaseN(123, 1)).toThrow('Base must be between 2 and 36');
      expect(() => toBaseN(123, 37)).toThrow('Base must be between 2 and 36');
    });
  });

  // Round-trip tests
  describe('round-trip conversions', () => {
    it('should preserve value when converting back and forth', () => {
      const testValues = [
        0, 1, 42, 123, 255, 1000, 9999, 65535, 16777215, 2147483647,
        // Large values as BigInt
        BigInt('4738381338321616895'),
        BigInt('761371970') // Value for 'CLAUDE' in base 36
      ];

      const bases = [2, 8, 10, 16, 36];

      for (const value of testValues) {
        for (const base of bases) {
          // Convert to string in base-n, then back to number
          const baseStr = toBaseN(value, base);
          const backToNumber = fromBaseN(baseStr, base);
          
          // Convert BigInt to string for comparison since BigInt !== number
          const originalValue = typeof value === 'bigint' ? value : BigInt(value);
          expect(backToNumber).toBe(originalValue);
        }
      }
    });

    it('should handle random values in round-trip conversions', () => {
      // Test with 10 random values
      for (let i = 0; i < 10; i++) {
        const randomValue = Math.floor(Math.random() * 1000000);
        const randomBase = Math.floor(Math.random() * 35) + 2; // Random base between 2-36
        
        const baseStr = toBaseN(randomValue, randomBase);
        const backToNumber = fromBaseN(baseStr, randomBase);
        
        expect(backToNumber).toBe(BigInt(randomValue));
      }
    });
  });
});