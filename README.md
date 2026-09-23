# artemis-kit

TypeScript/JavaScript utility library. Tree-shakeable, split exports per module.

**Install:** `pnpm install @warkypublic/artemis-kit`

---

## Modules

### `collections`

```ts
import { groupBy, keyBy, uniqueBy, partition } from "@warkypublic/artemis-kit/collections"

const rows = [
  { id: 1, team: "red", score: 10 },
  { id: 2, team: "blue", score: 5 },
  { id: 3, team: "red", score: 20 },
]
const teams = groupBy(rows, row => row.team) // Map<string, Row[]>
const byId = keyBy(rows, row => row.id) // Map<number, Row>
const representatives = uniqueBy(rows, row => row.team) // first row per team
const [high, low] = partition(rows, row => row.score >= 10)
```

All helpers accept readonly arrays and preserve input order without mutating the input.
Items retain their original references. `groupBy` and `keyBy` return `Map` instances;
keys use Map/Set equality (object identity, with NaN equal to NaN).
`keyBy` keeps the last item for a duplicate key; `uniqueBy` keeps the first.
`partition` returns `[matching, nonMatching]` arrays.

### `sorting`

```ts
import { compareBy, chainComparators, createComparator } from "@warkypublic/artemis-kit/sorting"

const sorted = [...rows].sort(chainComparators(
  compareBy<(typeof rows)[number]>(row => row.team, { locale: "en" }),
  compareBy<(typeof rows)[number]>(row => row.score, { direction: "desc" }),
))
const labels = ["item10", "item2"].sort(createComparator({ locale: "en" }))
// ["item2", "item10"]
```

Comparators accept strings, numbers, dates, null, and undefined. Options:

| Option | Default | Behavior |
|---|---|---|
| `direction` | `"asc"` | `"asc"` or `"desc"` |
| `empty` | `"last"` | `"first"` or `"last"`, independent of direction |
| `locale` | Runtime locale | Locale string or ordered list of locales |
| `collator` | `{ numeric: true }` | `Intl.Collator` options, created once per comparator |

Empty values are null, undefined, `""`, NaN, and invalid dates. Whitespace strings
are not empty. Numbers compare numerically and dates by timestamp. Mixed types
sort numbers, then dates, then strings in ascending order; strings are never coerced
to numbers. `chainComparators` returns zero when all criteria tie.

Use `compareBy` to sort rows with missing values: JavaScript's `Array.sort` always
moves bare undefined elements to the end without invoking the comparator, even with
`empty: "first"`. Sorting mutates the array; copy it first as shown above.

These helpers and their types are also available from the package root.

---

### `strings`
```ts
import { ... } from "@warkypublic/artemis-kit/strings"
```

| Function | Signature | Description |
|---|---|---|
| `trimLeft` | `(str, chars?, times?)` | Trim chars from left, Unicode-safe |
| `trimRight` | `(str, chars?, times?)` | Trim chars from right, Unicode-safe |
| `replaceStr` | `(str, search, replace)` | Replace first occurrence |
| `replaceStrAll` | `(str, search, replace)` | Replace all occurrences |
| `initCaps` | `(sentence)` | Capitalize first letter of each word |
| `titleCase` | `(sentence)` | Title case, skips articles/conjunctions |
| `camelCase` | `(sentence)` | Convert to camelCase |
| `snakeCase` | `(sentence)` | Convert to snake_case |
| `reverseSnakeCase` | `(sentence)` | snake_case → camelCase |
| `splitCamelCase` | `(sentence)` | camelCase → space-separated words |
| `formatNumber` | `(value, locale, options?)` | Locale-aware number formatting via `Intl` |
| `formatCurrency` | `(value, locale, currency)` | Locale-aware currency formatting |
| `formatDate` | `(date, locale, options?)` | Locale-aware date formatting |
| `formatRelativeTime` | `(value, unit, locale)` | Relative time e.g. "2 days ago" |
| `formatPercent` | `(value, locale, decimals?)` | Locale-aware percent formatting |
| `formatUnit` | `(value, unit, locale)` | Locale-aware unit formatting |
| `formatList` | `(items, locale, type?)` | Locale-aware list formatting |
| `getPlural` | `(count, locale, forms)` | Plural form selection via `Intl.PluralRules` |
| `compareStrings` | `(str1, str2, locale)` | Locale-aware string comparison |
| `parseNumberWords` | `(text, locale)` | Word to digit ("two" → 2), supports en-US/af-ZA |
| `handleBiDi` | `(text)` | Wrap text in Unicode BiDi markers |
| `humanFileSize` | `(bytes)` | Bytes to human-readable size |
| `getUUID` | `()` | UUID via `crypto.randomUUID()` with timestamp fallback |
| `newUUID` | `()` | UUID via `uuid` v4 |
| `blankValue` | `(...args)` | First non-blank value (skips null/undefined/0/""/[]/\{\}) |
| `inop` | `(...args)` | Check if value exists in array or matches value |
| `iinop` | `(...args)` | Case-insensitive `inop` |
| `clarionIntToTime` | `(val, detail?)` | Clarion int → time string HH:MM:SS |
| `clarionTimeToInt` | `(timeStr)` | Time string → Clarion int |
| `clarionClock` | `()` | Current time as Clarion centiseconds since midnight |
| `clarionDateToInt` | `(date)` | JS Date → Clarion date int (days since 1800-12-28) |
| `clarionIntToDate` | `(days)` | Clarion date int → JS Date |
| `clarionDateStringToInt` | `(dateStr)` | "YYYY-MM-DD" or "MM/DD/YYYY" → Clarion int |
| `clarionIntToDateString` | `(days, format?)` | Clarion int → date string, format: `'iso'`\|`'us'` |
| `fromBaseN` | `(str, base?)` | String in base N (2-36) → `BigInt`, default base 36 |
| `toBaseN` | `(num, base?)` | `number`\|`BigInt` → string in base N (2-36), default base 36 |
| `tryFromBaseN` | `(str, base?, fallback?)` | `fromBaseN` with fallback on error |
| `tryToBaseN` | `(num, base?, fallback?)` | `toBaseN` with fallback on error |

---

### Text helpers (`strings`)

These functions are exported from `@warkypublic/artemis-kit/strings` and the package root.

| Function | Behavior |
|---|---|
| `truncate(text, maxLength, suffix = "…")` | Limit total character count, including suffix; clip the suffix if necessary |
| `truncateWords(text, maxWords, suffix = "…")` | Keep whitespace-delimited words; preserve original text if it fits |
| `slugify(text)` | Lowercase, strip decomposable accents, join Unicode letters/numbers with hyphens |
| `escapeRegExp(text)` | Escape regex metacharacters for a literal pattern |
| `normalizeWhitespace(text)` | Collapse whitespace to spaces and trim |
| `stripDiacritics(text)` | Remove decomposable accents and combining marks; not transliteration |
| `includesIgnoreCase(text, query, locale?)` | Literal substring match after locale-aware lowercasing |
| `interpolate(template, values)` | Replace `{name}` using own properties only; missing keys remain unchanged |
| `mask(text, options?)` | Hide characters; defaults to showing the last four |
| `splitOnce(text, separator)` | Return `[before, after]` at the first literal separator |
| `isBlank(text)` | True for null, undefined, empty, or whitespace-only strings |
| `toSearchKey(text, locale?)` | Lowercase, remove accents, and normalize whitespace |
| `humanize(text)` | Turn identifiers such as `customer_id` or `customerId` into `Customer id` |
| `getInitials(name, max = 2)` | Uppercase the first character of up to `max` whitespace-delimited words |
| `ensurePrefix(text, prefix)` / `ensureSuffix(text, suffix)` | Add an exact affix only when absent |
| `removePrefix(text, prefix)` / `removeSuffix(text, suffix)` | Remove an exact affix once |
| `substringBefore(text, separator)` / `substringAfter(text, separator)` | Extract either side of the first literal separator |
| `countOccurrences(text, search, overlap = false)` | Count literal matches; empty search returns zero |
| `commonPrefix(values)` | Longest shared prefix; empty list returns an empty string |
| `wrapText(text, width)` | Wrap at whitespace, preserve explicit line breaks, leave long words intact |
| `dedent(text)` | Remove shared literal spaces/tabs and outer blank lines |
| `normalizeLineEndings(text)` | Convert CRLF and CR to LF |
| `utf8ByteLength(text)` | Count UTF-8 bytes, including replacement bytes for lone surrogates |
| `compareNatural(a, b)` | Sort numeric text naturally using the runtime locale, with empty strings last |

```ts
import {
  truncate, toSearchKey, interpolate, mask, compareNatural,
} from "@warkypublic/artemis-kit/strings"

truncate("Hello world", 8) // "Hello w…"
toSearchKey("  CAFÉ  au lait ") // "cafe au lait"
interpolate("Hello {name}", { name: "Ada" }) // "Hello Ada"
mask("123456789", { start: 2, end: 2, character: "#" }) // "12#####89"
const files = ["file10", "file2"].sort(compareNatural) // ["file2", "file10"]
```

Character-based helpers use grapheme clusters when `Intl.Segmenter` is available,
keeping combined emoji and accented characters together. Older runtimes fall back
to Unicode code points, which keep surrogate pairs intact but may separate combined
characters. Length limits must be nonnegative safe integers; `wrapText` requires a
positive width. Invalid limits throw `RangeError`. A zero truncation limit returns
an empty string.

`mask` accepts `{ start?: number, end?: number, character?: string }`. The mask
character must be one character; overlapping visible ranges leave the text visible.
Masking changes only the displayed string. `interpolate` stringifies numbers and
booleans, turns null/undefined values into empty strings, and does not evaluate or
recursively substitute values. It does not escape HTML.

A missing separator yields `[text, ""]` from `splitOnce`; an empty separator yields
`["", text]`. The substring helpers follow the same rules. Affixes are case-sensitive
and empty affixes leave text unchanged. `includesIgnoreCase` does not remove accents
or perform full Unicode case folding; use `toSearchKey` on both operands for
accent-insensitive search. `wrapText` collapses whitespace within lines; `dedent`
treats tabs literally rather than expanding them to visual columns.

---

### `base64`
```ts
import { ... } from "@warkypublic/artemis-kit/base64"
```

| Function | Signature | Description |
|---|---|---|
| `b64EncodeUnicode` | `(str)` | UTF-8 safe base64 encode |
| `b64DecodeUnicode` | `(str)` | UTF-8 safe base64 decode |
| `base64ToBlob` | `(base64, mimeType)` | Base64 string → Blob |
| `blobToBase64` | `(blob)` | Blob → base64 string |
| `FileToBase64` | `(file)` | File → base64 string |
| `FileToBlob` | `(file)` | File → Blob |
| `BlobToString` | `(blob)` | Blob → string |

---

### `object`
```ts
import { ... } from "@warkypublic/artemis-kit/object"
```

| Function | Signature | Description |
|---|---|---|
| `getNestedValue` | `(path, obj)` | Get value by dot-notation path, supports bracket notation |
| `setNestedValue` | `(path, value, obj)` | Set value by dot-notation path, auto-creates intermediates |
| `objectCompare` | `(obj, objToCompare, deep?)` | Shallow or deep object equality |
| `createSelectOptions` | `(obj, options?)` | Object → `[{label, value}]` array for select components |
| `decycle` | `(object, replacer?)` | Deep copy, replacing circular refs with `{"$ref": PATH}` |
| `retrocycle` | `($)` | Restore circular refs from `{"$ref": PATH}` objects |
| `stringify_json` | `(object)` | `JSON.stringify` safe for circular references |

#### Selecting and transforming properties

```ts
import {
  pick, omit, pickBy, omitBy, mapValues, mapKeys,
  isPlainObject, hasOwn, compactObject, invert,
} from "@warkypublic/artemis-kit/object"

const user = { id: 1, name: "Ada", password: "secret" }
pick(user, ["id", "name"]) // { id: 1, name: "Ada" }
omit(user, ["password"]) // { id: 1, name: "Ada" }
pickBy({ a: 1, b: 0 }, value => value > 0) // { a: 1 }
omitBy({ a: 1, b: 0 }, value => value > 0) // { b: 0 }
mapValues({ a: 2, b: 3 }, value => value * 2) // { a: 4, b: 6 }
mapKeys({ first: "Ada" }, key => key.toUpperCase()) // { FIRST: "Ada" }
isPlainObject({}) // true
isPlainObject(new Date()) // false
hasOwn({ id: 1 }, "id") // true
hasOwn({}, "toString") // false
compactObject({ a: null, b: undefined, c: 0, d: false, e: "" })
// { c: 0, d: false, e: "" }
invert({ a: "red", b: "red", c: "blue" })
// Map { "red" => ["a", "b"], "blue" => ["c"] }
```

These helpers produce shallow results and preserve value references. They operate
on own enumerable string and symbol properties; `pick` can also select an explicitly
named non-enumerable own property. Results contain ordinary writable data properties,
not the original descriptors. Accessors are read when selected or transformed.
`mapKeys` keeps the last value when mapped keys collide. `invert` groups duplicate
values using Map equality, so object values are compared by identity.
`isPlainObject` accepts objects with this realm's `Object.prototype` or a null
prototype. Class instances and objects from another realm are not plain objects.
Keys such as `__proto__` are copied as own data properties without changing prototypes.
Use these helpers on data records: static types cannot describe property enumeration
or distinguish inherited keys from own keys.

#### Cloning, merging, and freezing

```ts
import { deepClone, deepMerge, deepFreeze } from "@warkypublic/artemis-kit/object"

const original = { user: { name: "Ada" }, created: new Date(0) }
const copy = deepClone(original)
copy.user === original.user // false
copy.created.getTime() // 0

const defaults = { theme: { color: "blue", size: 12 }, tags: ["base"] }
const overrides = { theme: { size: 14 }, tags: ["custom"] }
deepMerge(defaults, overrides)
// { theme: { color: "blue", size: 14 }, tags: ["custom"] }
deepMerge(defaults, overrides, { arrays: "concat" })
// { theme: { color: "blue", size: 14 }, tags: ["base", "custom"] }

const config = deepFreeze({ nested: { enabled: true }, tags: ["fixed"] })
Object.isFrozen(config.nested) // true
Object.isFrozen(config.tags) // true
```

`deepClone` preserves cycles and shared references. It supports primitives, plain
objects, arrays, Date, RegExp (including `lastIndex`), Map, Set, ArrayBuffer, typed
arrays, and DataView. Buffer views share the cloned backing buffer when the originals
share one. Sparse array holes and null prototypes are preserved. Plain objects and
arrays copy own enumerable string/symbol values; accessors become evaluated values.
Custom properties on built-ins are not copied. Functions, custom classes, WeakMap,
WeakSet, SharedArrayBuffer, and other unsupported objects throw `TypeError`.

`deepMerge` requires plain-object roots and returns a new object, leaving both inputs
unchanged. Nested plain objects merge recursively; source values, including undefined,
replace other values. Arrays are replaced unless `arrays: "concat"` is selected.
Other values use `deepClone`'s supported types. Cycles through traversed plain objects
or arrays throw `TypeError`; shared identity across independently merged branches is
not guaranteed. The result type is `Record<PropertyKey, unknown>` because overlapping
values may have different types; narrow values before use.

`deepFreeze` freezes its input **in place** and returns it as `DeepReadonly<T>`.
It supports cycles, plain objects, and arrays, including non-enumerable and symbol
properties. Accessors, functions, and built-ins such as Date, Map, Set, and typed
arrays throw `TypeError` before any part of the graph is frozen. This avoids implying
that freezing an object also prevents mutation through built-in methods.

#### Flattening and changes

```ts
import { flattenObject, unflattenObject, diffObjects } from "@warkypublic/artemis-kit/object"

const flat = flattenObject({ user: { name: "Ada" }, tags: ["admin"], empty: {} })
// { "/user/name": "Ada", "/tags": ["admin"], "/empty": {} }
unflattenObject(flat)
// { user: { name: "Ada" }, tags: ["admin"], empty: {} }
flattenObject({ "a/b": { "~key": 1 } })
// { "/a~1b/~0key": 1 }

diffObjects({ user: { name: "Ada" }, old: true }, { user: { name: "Grace" }, active: true })
// [
//   { type: "changed", path: ["user", "name"], before: "Ada", after: "Grace" },
//   { type: "removed", path: ["old"], before: true },
//   { type: "added", path: ["active"], after: true },
// ]
```

Flattening traverses only nested plain objects with enumerable string keys. Paths
start with `/`; key characters `~` and `/` become `~0` and `~1`. Empty keys are
supported (`"/"` is the path for an empty root key). Arrays, special objects, and
empty objects are leaves and keep their original references. Empty roots produce
`{}`. `unflattenObject` reconstructs plain objects without inferring arrays from
numeric keys, and rejects invalid paths and parent/child collisions such as `/a`
and `/a/b`. Symbol and non-enumerable properties are outside this representation.

`diffObjects` compares own enumerable string keys in plain objects recursively.
Other values, including arrays and dates, use `Object.is`: distinct but equal-content
arrays report a change. Added/removed subtrees are reported as a single entry;
absence differs from an own property containing undefined. Paths are key arrays so
punctuation in keys is unambiguous. Returned values retain input references.
Flattening and diffing reject cycles through the plain objects they traverse.

#### TypeScript utility types

```ts
import type {
  DeepPartial, DeepReadonly, DeepRequired, Mutable, KeysOfType, Prettify,
} from "@warkypublic/artemis-kit/object"

type Settings = { name: string; nested: { enabled: boolean }; tags: string[] }
const patch: DeepPartial<Settings> = { nested: {} }
type FrozenSettings = DeepReadonly<Settings> // nested fields and arrays are readonly
const complete: DeepRequired<{ nested?: { enabled?: boolean } }> = {
  nested: { enabled: true },
}
type Editable = Mutable<{ readonly id: number }> // { id: number }
type TextKeys = KeysOfType<{ id: number; name: string }, string> // "name"
type User = Prettify<{ id: number } & { name: string }> // expanded editor display
```

`DeepPartial` and `DeepRequired` preserve tuple structure and recurse through object
properties, map values, and set elements. Map keys are unchanged. `DeepReadonly`
also makes map keys/values and set elements recursively readonly. These types preserve
functions, Date, and RegExp as-is; they target data shapes, not arbitrary class
instances. Readonly typing does not prevent mutation through Date/RegExp methods.
`Mutable` removes only top-level readonly modifiers. `KeysOfType` selects properties
whose entire declared value type extends the requested type. These are compile-time
utilities, not runtime validation or freezing.

---

### `dataqueue`
```ts
import { NestedQueue, EnhancedNestedQueue } from "@warkypublic/artemis-kit/dataqueue"
```

`NestedQueue<T>` — reactive array store with middleware and persistence.

| Method | Signature | Description |
|---|---|---|
| `add` | `(item, path?)` | Append item, optionally to nested array at path |
| `remove` | `(path)` | Remove item at dot-notation index path |
| `update` | `(path, value)` | Merge partial update at path |
| `get` | `(path)` | Get value at path |
| `getAll` | `()` | Get full data array |
| `search` | `(query, options?)` | Search by string or object pattern |
| `filter` | `(predicate, options?)` | Filter with optional deep traversal |
| `findOne` | `(predicate)` | First matching item |
| `sort` | `(key, options?)` | Sort by key, supports deep/nested sorting |
| `clear` | `()` | Empty the queue |
| `subscribe` | `(callback)` | Subscribe to changes, returns unsubscribe fn |
| `clearPersistence` | `()` | Clear persistence adapter storage |

**Constructor options:**
```ts
new NestedQueue<T>(initialData?, {
  persistence?: PersistenceAdapter<T>,  // { save, load, clear }
  middleware?: Middleware<T>[],          // { beforeAction?, afterAction? }
  autoload?: boolean                     // auto-load from persistence on init
})
```

`EnhancedNestedQueue<T>` extends `NestedQueue` with an `ActiveRecordBuffer` — access via `.getBuffer()`.

---

### `i18n`
```ts
import { i18n, _t, _tt } from "@warkypublic/artemis-kit/i18n"
```

LRU memory cache + IndexedDB persistence, auto-fetches from server on miss/version mismatch.

| Export | Type | Description |
|---|---|---|
| `_t` | `(id, default?)` | Sync lookup (returns default if not cached) |
| `_tt` | `(id, default?)` | Async lookup (fetches from server if missing) |
| `i18n.configure` | `(options)` | Set `apiUrl`, `maxCacheSize`, `cacheTTL` |
| `i18n.registerStrings` | `(strings, version)` | Pre-load translations |
| `i18n.clearCache` | `()` | Clear memory + IndexedDB cache |
| `i18n.getCacheStats` | `()` | `{ memorySize, dbSize, hits, misses }` |

**Configure:**
```ts
i18n.configure({ apiUrl: "/api/translations", maxCacheSize: 1000, cacheTTL: 86400000 })
```

---

### `mime`
```ts
import { ... } from "@warkypublic/artemis-kit/mime"
```

| Function | Signature | Description |
|---|---|---|
| `getExtFromMime` | `(mime)` | MIME type → primary extension |
| `getMimeFromExt` | `(ext)` | Extension → MIME type |
| `getExtFromFilename` | `(filename)` | Filename → extension |
| `isValidExtForMime` | `(mime, ext)` | Validate extension against MIME type |
| `getAllExtensionsForMime` | `(mime)` | All valid extensions for MIME type |

---

### `dom`
```ts
import { openFileLink } from "@warkypublic/artemis-kit/dom"
```

| Function | Signature | Description |
|---|---|---|
| `openFileLink` | `(url)` | Trigger file download via hidden anchor click (browser only) |

---

### `promise`
```ts
import { ... } from "@warkypublic/artemis-kit/promise"
```

| Function | Signature | Description |
|---|---|---|
| `WaitUntil` | `(condition, options?)` | Poll until condition returns true, throws on timeout |
| `debounce` | `(fn, wait)` | Debounce function by ms |
| `throttle` | `(fn, limit)` | Throttle function by ms |
| `measureTime` | `(fn)` | Measure async fn execution: `{ result, duration }` |

**`WaitUntil` options:** `{ timeout?: number (default 5000), interval?: number (default 100) }`

---

### `logger`
```ts
import { createLogger } from "@warkypublic/artemis-kit/logger"
```

```ts
const logger = createLogger()
logger.error(message, data?)
logger.warn(message, data?)
logger.info(message, data?)
logger.debug(message, data?)
logger.registerPlugin({ name, onLog: async (entry) => void })
```

Plugin `entry`: `{ timestamp: Date, level: 'ERROR'|'WARN'|'INFO'|'DEBUG', message: string, data?: unknown }`

---

### `llm`
```ts
import { OpenAPI, Claude } from "@warkypublic/artemis-kit/llm"
```

| Function | Signature | Description |
|---|---|---|
| `OpenAPI.getTextCompletion` | `({ prompt, options? })` | OpenAI-compatible text completion |
| `Claude.getClaudeCompletion` | `({ prompt, options? })` | Anthropic Claude messages API completion |

**OpenAPI options:** `{ url?, apiKey?, maxTokens?, temperature?, topP?, n?, stream?, stop? }`

**Claude options:** `{ url?, apiKey?, model?, maxTokens?, temperature?, topP?, stopSequences?, system? }`

## Installing from Gitea Packages

To install from Gitea, put this scope mapping in the consuming project's `.npmrc`,
replacing `<owner>` with the Gitea repository owner:

```ini
@warkypublic:registry=https://git.warky.dev/api/packages/<owner>/npm/
```

Then run `pnpm add @warkypublic/artemis-kit`. For private packages, also configure
an authentication token with package-read access in your user-level npm config or
CI secrets. The scope mapping routes all `@warkypublic` packages to this registry.
