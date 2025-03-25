# artemis-kit

A comprehensive TypeScript/JavaScript utility library focused on precision and efficiency.

## Features

### String Tools

- Advanced string manipulation
- Pattern matching and validation
- Text transformation utilities
- Unicode handling
- i18n support

### Blob Tools

- Blob creation and modification
- Binary data handling
- Stream processing
- MIME type management

### File Conversion Tools

- Format conversions
- File type transformations
- Encoding/decoding utilities
- Batch processing capabilities

### Data Queue Tools

- Efficient data processing
- Batch operations support

### DOM

- DOM shortcuts like opening file links

### LLM

- LLM tools for text processing and generation

## Installation

```bash
pnpm install @warkypublic/artemis-kit
```

## Usage/Import examples

```typescript
import { getNestedValue } from "@warkypublic/artemis-kit/object";
import { NestedQueue } from "@warkypublic/artemis-kit/dataqueue";
import { camelCase, formatPercent } from "@warkypublic/artemis-kit/strings";
import {
  b64DecodeUnicode,
  b64EncodeUnicode,
} from "@warkypublic/artemis-kit/base64";
```

## Available Methods

### Strings

- trimLeft
- trimRight
- replaceStr
- replaceStrAll
- formatNumber
- formatCurrency
- formatDate
- getPlural
- formatPercent
- titleCase
- initCaps
- camelCase
- snakeCase
- reverseSnakeCase
- splitCamelCase
- humanFileSize
- getUUID
- newUUID
- blankValue
- ...

### i18n

- createI18nManager
- \_t
- \_tt
- ...

### Base64

- b64DecodeUnicode
- b64EncodeUnicode
- base64ToBlob
- blobToBase64
- FileToBase64
- FileToBlob
- BlobToString

### Object

- getNestedValue
- setNestedValue
- objectCompare
- createSelectOptions

### Queue

- NestedQueue

### Dom

- openFileLink

### Mime

- getExtFromMime
- getExtFromFilename
- getMimeFromExt
- isValidExtForMime
- getAllExtensionsForMime

### LLM

These are still work in progress.

## Requests

Requests are welcome! Please read our contributing guidelines and send me a message on Discord or add a github issue.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT
