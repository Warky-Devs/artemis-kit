# @warkypublic/artemis-kit

## 1.1.1

### Patch Changes

- - ci(publish): update checkout ref logic for release tags
  - ci(publish): update workflow to include release tag verification
  - ci(publish): add GitHub Actions workflow for package publishing
  - ci(publish): update workflow to require release_tag input
  - docs(publish): update publishing instructions for manual dispatch

## 1.1.0

### Minor Changes

- 538ec38: Add typed collection helpers (groupBy, keyBy, uniqueBy, partition) and configurable sorting comparators through root, collections, and sorting exports. Add CI bundle size budgets and fail builds on direct eval warnings.
- 280a7ea: Add object selection, mapping, compaction, inversion, cloning, merging, freezing, flattening, and diff helpers. Export DeepPartial, DeepReadonly, DeepRequired, Mutable, KeysOfType, and Prettify types, with examples and documented handling of cycles, arrays, and property names.
- 280a7ea: Add string helpers for truncation, normalization, searching, interpolation, masking, affixes, splitting, prefixes, wrapping, indentation, UTF-8 byte length, initials, labels, slugs, and natural sorting. Export the helpers and MaskOptions from the strings module and package root, with documented Unicode behavior and edge cases.

### Patch Changes

- fb5d98e: - 538ec38 — Added groupBy, keyBy, uniqueBy, and partition, plus locale-aware sorting and multi-column comparators.
- 538ec38: Replace direct eval in retrocycle with JSONPath property traversal to eliminate bundler eval warnings when importing artemis-kit. Preserve circular and shared reference restoration, including escaped property names.

## 1.0.10

### Patch Changes

- 4058dd3: Added object retrocycle and decycle

## 1.0.9

### Patch Changes

- 0439207: Added tryFromBaseN and tryToBaseN

## 1.0.8

### Patch Changes

- 67a17e5: Added toBaseN and fromBaseN with test cases

## 1.0.7

### Patch Changes

- 1bd493a: Fixed object.getNestedValue to handle null values

## 1.0.6

### Patch Changes

- 0347718: Bump version

## 1.0.5

### Patch Changes

- 6b6f418: Release split export changes

## 1.0.4

### Patch Changes

- Fixed public exports

## 1.0.3

### Patch Changes

- Updated export for object and dataqueue.

## 1.0.2

### Patch Changes

- Added newUUId and getUUID

## 1.0.1

### Patch Changes

- Fixed functions that failed test cases and added test cases
