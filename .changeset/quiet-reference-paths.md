---
"@warkypublic/artemis-kit": patch
---

Replace direct eval in retrocycle with JSONPath property traversal to eliminate bundler eval warnings when importing artemis-kit. Preserve circular and shared reference restoration, including escaped property names.
