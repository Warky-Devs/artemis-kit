import { splitCamelCase } from './caseConversion';
import { createComparator } from '../sorting';

function limit(value: number, name: string, minimum = 0): void {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(`${name} must be a safe integer >= ${minimum}`);
  }
}

// Older runtimes without Segmenter fall back to Unicode code points.
function characters(text: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), part => part.segment);
  }
  return Array.from(text);
}

/** Shorten to maxLength characters, including the suffix (default …). */
export function truncate(text: string, maxLength: number, suffix = '…'): string {
  limit(maxLength, 'maxLength');
  const parts = characters(text);
  if (parts.length <= maxLength) return text;
  const ending = characters(suffix).slice(0, maxLength);
  return parts.slice(0, maxLength - ending.length).join('') + ending.join('');
}

/** Keep at most maxWords whitespace-delimited words; preserve text if it fits. */
export function truncateWords(text: string, maxWords: number, suffix = '…'): string {
  limit(maxWords, 'maxWords');
  if (maxWords === 0) return '';
  const words = text.match(/\S+/g) ?? [];
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(' ') + suffix;
}

/** Collapse Unicode whitespace to single spaces and trim. */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Remove decomposable accents and combining marks; not a transliterator. */
export function stripDiacritics(text: string): string {
  return text.normalize('NFD').replace(new RegExp('\\p{M}+', 'gu'), '').normalize('NFC');
}

/** Lowercase Unicode slug, retaining letters and numbers from any script. */
export function slugify(text: string): string {
  return stripDiacritics(text).toLowerCase()
    .replace(new RegExp('[^\\p{L}\\p{N}]+', 'gu'), '-').replace(/^-+|-+$/g, '');
}

/** Escape regex metacharacters for a literal pattern (not a replacement string). */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Locale-aware lowercasing followed by literal substring matching. */
export function includesIgnoreCase(text: string, query: string, locale?: string | string[]): boolean {
  return text.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale));
}

/** Null, undefined, empty, or whitespace-only text. */
export function isBlank(text: string | null | undefined): boolean {
  return text === null || text === undefined || text.trim().length === 0;
}

/** Normalize case, accents, and whitespace for search indexing. */
export function toSearchKey(text: string, locale?: string | string[]): string {
  return normalizeWhitespace(stripDiacritics(text.toLocaleLowerCase(locale)));
}

/** Convert snake_case, kebab-case, and camelCase to a sentence-case label. */
export function humanize(text: string): string {
  const label = normalizeWhitespace(splitCamelCase(text).replace(/[_-]+/g, ' ')).toLowerCase();
  const parts = characters(label);
  return parts.length ? parts[0].toUpperCase() + parts.slice(1).join('') : '';
}

/** Initials of whitespace-delimited names; defaults to the first two words. */
export function getInitials(name: string, max = 2): string {
  limit(max, 'max');
  return (name.match(/\S+/g) ?? []).slice(0, max)
    .map(word => characters(word)[0].toUpperCase()).join('');
}

/** Replace {name} placeholders with own properties. Missing keys stay intact. */
export function interpolate(
  template: string,
  values: Readonly<Record<string, string | number | boolean | null | undefined>>,
): string {
  return template.replace(/\{([^{}]+)\}/g, (placeholder, key: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key] ?? '') : placeholder);
}

export interface MaskOptions {
  /** Number of visible characters at the beginning. Defaults to zero. */
  start?: number;
  /** Number of visible characters at the end. Defaults to four. */
  end?: number;
  /** One character per hidden character. Defaults to *. */
  character?: string;
}

/** Mask a display value; this does not encrypt or remove the original value. */
export function mask(text: string, options: MaskOptions = {}): string {
  const { start = 0, end = 4, character = '*' } = options;
  limit(start, 'start');
  limit(end, 'end');
  if (characters(character).length !== 1) throw new RangeError('character must be one character');
  const parts = characters(text);
  return parts.map((part, i) => i < start || i >= parts.length - end ? part : character).join('');
}

export function ensurePrefix(text: string, prefix: string): string {
  return text.startsWith(prefix) ? text : prefix + text;
}

export function ensureSuffix(text: string, suffix: string): string {
  return text.endsWith(suffix) ? text : text + suffix;
}

export function removePrefix(text: string, prefix: string): string {
  return text.startsWith(prefix) ? text.slice(prefix.length) : text;
}

export function removeSuffix(text: string, suffix: string): string {
  return suffix && text.endsWith(suffix) ? text.slice(0, -suffix.length) : text;
}

/** Split at the first literal separator. Missing separator returns [text, '']. */
export function splitOnce(text: string, separator: string): [string, string] {
  const index = text.indexOf(separator);
  return index < 0 ? [text, ''] : [text.slice(0, index), text.slice(index + separator.length)];
}

/** Missing separator returns the original text; empty separator returns ''. */
export function substringBefore(text: string, separator: string): string {
  return splitOnce(text, separator)[0];
}

/** Missing separator returns ''; empty separator returns the original text. */
export function substringAfter(text: string, separator: string): string {
  return splitOnce(text, separator)[1];
}

/** Count literal occurrences. Empty search returns zero. */
export function countOccurrences(text: string, search: string, overlap = false): number {
  if (!search) return 0;
  let count = 0;
  let offset = 0;
  while ((offset = text.indexOf(search, offset)) !== -1) {
    count++;
    offset += overlap ? 1 : search.length;
  }
  return count;
}

/** Longest common prefix, respecting character boundaries. */
export function commonPrefix(values: readonly string[]): string {
  if (!values.length) return '';
  const prefix = characters(values[0]);
  let length = prefix.length;
  for (const value of values.slice(1)) {
    const parts = characters(value);
    length = Math.min(length, parts.length);
    let i = 0;
    while (i < length && prefix[i] === parts[i]) i++;
    length = i;
    if (!length) break;
  }
  return prefix.slice(0, length).join('');
}

/** Convert Windows and old Mac line endings to LF. */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

/** Wrap on whitespace, preserving explicit line breaks and leaving long words intact. */
export function wrapText(text: string, width: number): string {
  limit(width, 'width', 1);
  return normalizeLineEndings(text).split('\n').map(line => {
    const words = line.match(/\S+/g) ?? [];
    const lines: string[] = [];
    let current = '';
    let length = 0;
    for (const word of words) {
      const size = characters(word).length;
      if (current && length + 1 + size > width) {
        lines.push(current);
        current = '';
        length = 0;
      }
      if (current) { current += ' '; length++; }
      current += word;
      length += size;
    }
    lines.push(current);
    return lines.join('\n');
  }).join('\n');
}

/** Remove shared spaces/tabs from nonblank lines; discard outer blank lines. */
export function dedent(text: string): string {
  const lines = normalizeLineEndings(text).split('\n');
  while (lines.length && isBlank(lines[0])) lines.shift();
  while (lines.length && isBlank(lines[lines.length - 1])) lines.pop();
  const indents = lines.filter(line => !isBlank(line)).map(line => line.match(/^[\t ]*/)[0]);
  const indent = commonPrefix(indents);
  return lines.map(line => isBlank(line) ? '' : removePrefix(line, indent)).join('\n');
}

/** UTF-8 byte count, treating lone surrogates as replacement characters. */
export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (const point of text) {
    const code = point.codePointAt(0)!;
    bytes += code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
  }
  return bytes;
}

const naturalComparator = createComparator({ collator: { numeric: true } });

/** Natural order with the runtime locale and empty strings last. */
export function compareNatural(a: string, b: string): number {
  return naturalComparator(a, b);
}
