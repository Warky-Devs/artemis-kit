import { describe, expect, test } from 'vitest';
import { createSelectOptions } from './util';

describe('createSelectOptions', () => {
  // Test basic object transformation
  test('should transform basic object with default options', () => {
    const input = {
      key1: 'Label 1',
      key2: 'Label 2',
      key3: 'Label 3'
    };
    
    const expected = [
      { label: 'Label 1', value: 'key1' },
      { label: 'Label 2', value: 'key2' },
      { label: 'Label 3', value: 'key3' }
    ];
    
    expect(createSelectOptions(input)).toEqual(expected);
  });

  // Test custom key names
  test('should use custom property names when provided', () => {
    const input = {
      key1: 'Label 1',
      key2: 'Label 2'
    };
    
    const expected = [
      { text: 'Label 1', id: 'key1' },
      { text: 'Label 2', id: 'key2' }
    ];
    
    expect(createSelectOptions(input, { labelKey: 'text', valueKey: 'id' })).toEqual(expected);
  });

  // Test array input
  test('should return array as-is when input is an array', () => {
    const input = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' }
    ];
    
    expect(createSelectOptions(input)).toBe(input);
  });

  // Test different value types
  test('should handle different value types', () => {
    const input = {
      key1: 42,
      key2: true,
      key3: { nested: 'value' }
    };
    
    const expected = [
      { label: 42, value: 'key1' },
      { label: true, value: 'key2' },
      { label: { nested: 'value' }, value: 'key3' }
    ];
    
    expect(createSelectOptions(input)).toEqual(expected);
  });

  // Test null and undefined inputs
  test('should handle null and undefined inputs', () => {
    expect(createSelectOptions(null)).toEqual([]);
    expect(createSelectOptions(undefined)).toEqual([]);
  });

  // Test invalid inputs
  test('should handle invalid inputs', () => {
    expect(createSelectOptions(42 as any)).toEqual([]);
    expect(createSelectOptions('string' as any)).toEqual([]);
    expect(createSelectOptions(true as any)).toEqual([]);
  });

  // Test empty object
  test('should handle empty object', () => {
    expect(createSelectOptions({})).toEqual([]);
  });

  // Test partial options
  test('should handle partial options configuration', () => {
    const input = {
      key1: 'Label 1',
      key2: 'Label 2'
    };
    
    // Only labelKey provided
    expect(createSelectOptions(input, { labelKey: 'text' })).toEqual([
      { text: 'Label 1', value: 'key1' },
      { text: 'Label 2', value: 'key2' }
    ]);
    
    // Only valueKey provided
    expect(createSelectOptions(input, { valueKey: 'id' })).toEqual([
      { label: 'Label 1', id: 'key1' },
      { label: 'Label 2', id: 'key2' }
    ]);
  });

  // Test type safety
  test('should maintain type safety with generic types', () => {
    interface CustomType {
      name: string;
      count: number;
    }

    const input: Record<string, CustomType> = {
      key1: { name: 'Item 1', count: 1 },
      key2: { name: 'Item 2', count: 2 }
    };
    
    const result = createSelectOptions<CustomType>(input);
    expect(result).toEqual([
      { label: { name: 'Item 1', count: 1 }, value: 'key1' },
      { label: { name: 'Item 2', count: 2 }, value: 'key2' }
    ]);
  });

  // Test with special characters in keys
  test('should handle special characters in keys', () => {
    const input = {
      '@special': 'Special',
      'key.with.dots': 'Dots',
      'key-with-dashes': 'Dashes',
      'key with spaces': 'Spaces'
    };
    
    const expected = [
      { label: 'Special', value: '@special' },
      { label: 'Dots', value: 'key.with.dots' },
      { label: 'Dashes', value: 'key-with-dashes' },
      { label: 'Spaces', value: 'key with spaces' }
    ];
    
    expect(createSelectOptions(input)).toEqual(expected);
  });
});