import { describe, expect, it } from 'vitest';
import {
  truncate, truncateWords, slugify, escapeRegExp, normalizeWhitespace, stripDiacritics,
  includesIgnoreCase, interpolate, mask, splitOnce, isBlank, toSearchKey, humanize,
  getInitials, ensurePrefix, ensureSuffix, removePrefix, removeSuffix, substringBefore,
  substringAfter, countOccurrences, commonPrefix, wrapText, dedent, normalizeLineEndings,
  utf8ByteLength, compareNatural,
} from './index';

describe('text helpers', () => {
  it('truncates within a total grapheme budget including the suffix', () => {
    expect(truncate('hello', 4)).toBe('hel…');
    expect(truncate('hello', 2, '...')).toBe('..');
    expect(truncate('hello', 0)).toBe('');
    expect(truncate('hello', 5)).toBe('hello');
    expect(truncate('👨‍👩‍👧‍👦e\u0301xy', 3)).toBe('👨‍👩‍👧‍👦e\u0301…');
    expect(truncate('😀ab', 2, '')).toBe('😀a');
  });

  it('falls back to code points when Segmenter is unavailable', () => {
    const original = Intl.Segmenter;
    try {
      Object.defineProperty(Intl, 'Segmenter', { value: undefined, configurable: true });
      expect(truncate('😀ab', 2)).toBe('😀…');
    } finally {
      Object.defineProperty(Intl, 'Segmenter', { value: original, configurable: true });
    }
  });

  it('truncates whitespace-separated words and preserves unchanged input', () => {
    expect(truncateWords(' one  two\nthree ', 2)).toBe('one two…');
    expect(truncateWords(' one  two ', 2)).toBe(' one  two ');
    expect(truncateWords('one two', 1, '...')).toBe('one...');
    expect(truncateWords('one', 0)).toBe('');
    expect(truncateWords('', 2)).toBe('');
  });

  it.each([-1, 1.5, NaN, Infinity])('rejects invalid limits: %s', value => {
    expect(() => truncate('text', value)).toThrow(RangeError);
    expect(() => truncateWords('text', value)).toThrow(RangeError);
    expect(() => getInitials('Ada', value)).toThrow(RangeError);
    expect(() => mask('text', { start: value })).toThrow(RangeError);
    expect(() => mask('text', { end: value })).toThrow(RangeError);
    expect(() => wrapText('text', value)).toThrow(RangeError);
  });

  it('normalizes whitespace and decomposable diacritics', () => {
    expect(normalizeWhitespace(' \tCafé\u00a0 au\n lait ')).toBe('Café au lait');
    expect(stripDiacritics('Crème Brûlée e\u0301')).toBe('Creme Brulee e');
    expect(stripDiacritics('東京 ø')).toBe('東京 ø');
    expect(toSearchKey(' CAFÉ\t au  LAIT ')).toBe('cafe au lait');
    expect(toSearchKey('I İ', 'tr')).toBe('ı i');
  });

  it('creates Unicode slugs without leading or trailing separators', () => {
    expect(slugify(' Héllo, WORLD! ')).toBe('hello-world');
    expect(slugify('東京 & 大阪')).toBe('東京-大阪');
    expect(slugify('---')).toBe('');
  });

  it('escapes literal regex metacharacters', () => {
    const text = 'a.*+?^${}()|[]\\/z';
    expect(new RegExp(`^${escapeRegExp(text)}$`).test(text)).toBe(true);
    expect(escapeRegExp('')).toBe('');
  });

  it('matches case-insensitively with optional locale', () => {
    expect(includesIgnoreCase('Hello WORLD', 'world')).toBe(true);
    expect(includesIgnoreCase('ISTANBUL', 'ıstan', 'tr')).toBe(true);
    expect(includesIgnoreCase('café', 'cafe')).toBe(false);
    expect(includesIgnoreCase('abc', '')).toBe(true);
    expect(includesIgnoreCase('', 'a')).toBe(false);
  });

  it.each([null, undefined, '', ' \t\r\n', '\u00a0'])('recognizes blank text: %s', value => {
    expect(isBlank(value)).toBe(true);
  });

  it('does not consider zero or invisible non-whitespace text blank', () => {
    expect(isBlank('0')).toBe(false);
    expect(isBlank('\u200b')).toBe(false);
  });

  it('humanizes identifiers and extracts name initials', () => {
    expect(humanize('customer_id')).toBe('Customer id');
    expect(humanize('HTTPResponse-code')).toBe('Http response code');
    expect(humanize('')).toBe('');
    expect(getInitials(' Ada  Lovelace Byron ')).toBe('AL');
    expect(getInitials('Ada Lovelace Byron', 3)).toBe('ALB');
    expect(getInitials('e\u0301mile 王')).toBe('E\u0301王');
    expect(getInitials('Ada', 0)).toBe('');
    expect(getInitials(' ')).toBe('');
  });

  it('interpolates own literal values once and preserves missing placeholders', () => {
    const values = Object.assign(Object.create({ inherited: 'no' }), {
      name: '$&{other}', count: 0, enabled: false, empty: null,
    });
    expect(interpolate('{name}: {count} {enabled} {empty} {missing} {inherited}', values))
      .toBe('$&{other}: 0 false  {missing} {inherited}');
    expect(interpolate('{constructor} {__proto__}', {})).toBe('{constructor} {__proto__}');
  });

  it('masks character ranges without breaking emoji', () => {
    expect(mask('123456789')).toBe('*****6789');
    expect(mask('123456789', { start: 2, end: 2, character: '#' })).toBe('12#####89');
    expect(mask('😀👨‍👩‍👧‍👦ab', { end: 1 })).toBe('***b');
    expect(mask('abc', { end: 0 })).toBe('***');
    expect(mask('abc', { start: 2, end: 2 })).toBe('abc');
    expect(mask('')).toBe('');
    expect(() => mask('a', { character: '' })).toThrow(RangeError);
    expect(() => mask('a', { character: '**' })).toThrow(RangeError);
  });

  it('adds and removes exact affixes once', () => {
    expect(ensurePrefix('path', '/')).toBe('/path');
    expect(ensurePrefix('/path', '/')).toBe('/path');
    expect(ensureSuffix('file', '.txt')).toBe('file.txt');
    expect(ensureSuffix('file.txt', '.txt')).toBe('file.txt');
    expect(removePrefix('preprefix', 'pre')).toBe('prefix');
    expect(removeSuffix('name.txt.txt', '.txt')).toBe('name.txt');
    for (const fn of [ensurePrefix, ensureSuffix, removePrefix, removeSuffix]) {
      expect(fn('text', '')).toBe('text');
    }
    expect(removePrefix('text', 'other')).toBe('text');
    expect(removeSuffix('text', 'other')).toBe('text');
  });

  it('splits only on the first literal delimiter', () => {
    expect(splitOnce('a::b::c', '::')).toEqual(['a', 'b::c']);
    expect(splitOnce('abc', ':')).toEqual(['abc', '']);
    expect(splitOnce('abc', '')).toEqual(['', 'abc']);
    expect(splitOnce('', ':')).toEqual(['', '']);
    expect(substringBefore('a:b:c', ':')).toBe('a');
    expect(substringAfter('a:b:c', ':')).toBe('b:c');
    expect(substringBefore('abc', ':')).toBe('abc');
    expect(substringAfter('abc', ':')).toBe('');
  });

  it('counts literal matches with optional overlaps', () => {
    expect(countOccurrences('aaaa', 'aa')).toBe(2);
    expect(countOccurrences('aaaa', 'aa', true)).toBe(3);
    expect(countOccurrences('a.b.c', '.')).toBe(2);
    expect(countOccurrences('abc', '')).toBe(0);
    expect(countOccurrences('', 'a')).toBe(0);
    expect(countOccurrences('😀😀', '😀')).toBe(2);
  });

  it('finds common prefixes without partial graphemes', () => {
    expect(commonPrefix(['customer_id', 'customer_name'])).toBe('customer_');
    expect(commonPrefix(['😀a', '😀b'])).toBe('😀');
    expect(commonPrefix(['👨‍👩‍👧', '👨‍👩‍👦'])).toBe('');
    expect(commonPrefix(['abc', 'abd', 'a'])).toBe('a');
    expect(commonPrefix(['abc', ''])).toBe('');
    expect(commonPrefix([])).toBe('');
    expect(commonPrefix(['abc'])).toBe('abc');
  });

  it('wraps at word boundaries while preserving explicit blank lines', () => {
    expect(wrapText('one  two three', 7)).toBe('one two\nthree');
    expect(wrapText('toolong word', 3)).toBe('toolong\nword');
    expect(wrapText('one\r\n\r\ntwo', 10)).toBe('one\n\ntwo');
    expect(wrapText('😀 😀 😀', 3)).toBe('😀 😀\n😀');
    expect(wrapText('', 1)).toBe('');
    expect(() => wrapText('a', 0)).toThrow(RangeError);
  });

  it('dedents shared literal indentation and normalizes line endings', () => {
    expect(dedent('\n    one\r\n      two\r\n    three\n')).toBe('one\n  two\nthree');
    expect(dedent('\tfirst\n\t\tsecond')).toBe('first\n\tsecond');
    expect(dedent('  first\n\n  second')).toBe('first\n\nsecond');
    expect(dedent(' one\n\ttwo')).toBe(' one\n\ttwo');
    expect(dedent(' \n\t')).toBe('');
    expect(normalizeLineEndings('a\r\nb\rc\n')).toBe('a\nb\nc\n');
  });

  it.each([['', 0], ['abc', 3], ['é', 2], ['雪', 3], ['😀', 4], ['\ud800', 3]] as const)(
    'counts UTF-8 bytes for %j', (text, bytes) => expect(utf8ByteLength(text)).toBe(bytes),
  );

  it('compares natural numeric strings with empty strings last', () => {
    expect(['file10', '', 'file2', 'file1'].sort(compareNatural)).toEqual(['file1', 'file2', 'file10', '']);
    expect(compareNatural('same', 'same')).toBe(0);
  });
});
