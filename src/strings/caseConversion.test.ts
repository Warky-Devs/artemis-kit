import { describe, it, expect } from 'vitest';
import {
  initCaps,
  titleCase,
  camelCase,
  snakeCase,
  reverseSnakeCase,
  splitCamelCase,
} from './caseConversion';

describe('String Utility Functions', () => {
  describe('initCaps', () => {
    it('should capitalize first letter of each word', () => {
      expect(initCaps('hello world')).toBe('Hello World');
      expect(initCaps('the quick brown fox')).toBe('The Quick Brown Fox');
      expect(initCaps('what a wonderful day')).toBe('What A Wonderful Day');
    });

    it('should handle single word inputs', () => {
      expect(initCaps('hello')).toBe('Hello');
      expect(initCaps('WORLD')).toBe('WORLD');
    });

    it('should handle empty strings and edge cases', () => {
      expect(initCaps('')).toBe('');
      expect(initCaps('   ')).toBe('   ');
      expect(initCaps(null as unknown as string)).toBe(null as unknown as string);
      expect(initCaps(undefined as unknown as string)).toBe(undefined as unknown as string);
    });

    it('should handle special characters and numbers', () => {
      expect(initCaps('hello123 world')).toBe('Hello123 World');
      expect(initCaps('hello-world')).toBe('Hello-World');
      expect(initCaps('hello!world')).toBe('Hello!World');
    });
  });

  describe('titleCase', () => {
    it('should properly capitalize titles following standard rules', () => {
      expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox');
      expect(titleCase('a tale of two cities')).toBe('A Tale of Two Cities');
      expect(titleCase('to kill a mockingbird')).toBe('To Kill a Mockingbird');
    });

    it('should keep articles, conjunctions, and prepositions lowercase unless at start', () => {
      expect(titleCase('war and peace')).toBe('War and Peace');
      expect(titleCase('the lord of the rings')).toBe('The Lord of the Rings');
      expect(titleCase('a beautiful mind')).toBe('A Beautiful Mind');
    });

    it('should handle empty strings and edge cases', () => {
      expect(titleCase('')).toBe('');
      expect(titleCase('   ')).toBe('   ');
      expect(titleCase(null as unknown as string)).toBe(null as unknown as string);
      expect(titleCase(undefined as unknown as string)).toBe(undefined as unknown as string);
    });

    it('should handle special cases with colons and hyphens', () => {
      expect(titleCase('star wars: a new hope')).toBe('Star Wars: A New Hope');
      expect(titleCase('spider-man: far from home')).toBe('Spider-Man: Far From Home');
    });
  });

  describe('camelCase', () => {
    it('should convert space-separated words to camelCase', () => {
      expect(camelCase('hello world')).toBe('helloWorld');
      expect(camelCase('the quick brown fox')).toBe('theQuickBrownFox');
      expect(camelCase('What A Wonderful Day')).toBe('whatAWonderfulDay');
    });

    it('should handle single words', () => {
      expect(camelCase('hello')).toBe('hello');
      expect(camelCase('WORLD')).toBe('world');
    });

    it('should handle empty strings and edge cases', () => {
      expect(camelCase('')).toBe('');
      expect(camelCase('   ')).toBe('');
      expect(camelCase(null as unknown as string)).toBe(null as unknown as string);
      expect(camelCase(undefined as unknown as string)).toBe(undefined as unknown as string);
    });

    it('should handle special characters and numbers', () => {
      expect(camelCase('hello 123 world')).toBe('hello123World');
      expect(camelCase('first-second')).toBe('firstSecond');
    });
  });

  describe('snakeCase', () => {
    it('should convert space-separated words to snake_case', () => {
      expect(snakeCase('hello world')).toBe('hello_world');
      expect(snakeCase('The Quick Brown Fox')).toBe('the_quick_brown_fox');
    });

    it('should handle camelCase input', () => {
      expect(snakeCase('helloWorld')).toBe('hello_world');
      expect(snakeCase('theQuickBrownFox')).toBe('the_quick_brown_fox');
    });

    it('should handle empty strings and edge cases', () => {
      expect(snakeCase('')).toBe('');
      expect(snakeCase('   ')).toBe('');
      expect(snakeCase(null as unknown as string)).toBe(null as unknown as string);
      expect(snakeCase(undefined as unknown as string)).toBe(undefined as unknown as string);
    });

    it('should handle special characters and numbers', () => {
      expect(snakeCase('hello123World')).toBe('hello123_world');
      expect(snakeCase('first-second')).toBe('first_second');
    });
  });

  describe('reverseSnakeCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(reverseSnakeCase('hello_world')).toBe('helloWorld');
      expect(reverseSnakeCase('the_quick_brown_fox')).toBe('theQuickBrownFox');
    });

    it('should handle single words', () => {
      expect(reverseSnakeCase('hello')).toBe('hello');
      expect(reverseSnakeCase('world')).toBe('world');
    });

    it('should handle empty strings and edge cases', () => {
      expect(reverseSnakeCase('')).toBe('');
      expect(reverseSnakeCase('_')).toBe('');
      expect(reverseSnakeCase(null as unknown as string)).toBe(null as unknown as string);
      expect(reverseSnakeCase(undefined as unknown as string)).toBe(undefined as unknown as string);
    });

    it('should handle multiple underscores and edge cases', () => {
      expect(reverseSnakeCase('hello__world')).toBe('helloWorld');
      expect(reverseSnakeCase('_hello_world')).toBe('helloWorld');
      expect(reverseSnakeCase('hello_world_')).toBe('helloWorld');
    });
  });

  describe('splitCamelCase', () => {
    it('should split camelCase into space-separated words', () => {
      expect(splitCamelCase('helloWorld')).toBe('hello World');
      expect(splitCamelCase('theQuickBrownFox')).toBe('the Quick Brown Fox');
    });

    it('should handle consecutive capital letters', () => {
      expect(splitCamelCase('HTMLParser')).toBe('HTML Parser');
      expect(splitCamelCase('parseXMLDocument')).toBe('parse XML Document');
    });

    it('should handle empty strings and edge cases', () => {
      expect(splitCamelCase('')).toBe('');
      expect(splitCamelCase('   ')).toBe('   ');
      expect(splitCamelCase(null as unknown as string)).toBe(null as unknown as string);
      expect(splitCamelCase(undefined as unknown as string)).toBe(undefined as unknown as string);
    });

    it('should handle single words and special cases', () => {
      expect(splitCamelCase('hello')).toBe('hello');
      expect(splitCamelCase('Hello')).toBe('Hello');
      expect(splitCamelCase('HELLO')).toBe('HELLO');
    });
  });
});