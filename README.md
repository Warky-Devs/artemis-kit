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
