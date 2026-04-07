# Releasing and Versioning Strategy

This project maintains two parallel versions to support different cryptographic library preferences while moving towards the modern `@bsv/sdk`.

## 1. Versioning Overview

| Branch | Crypto Lib | Version Range | NPM Tag | Use Case |
|--------|------------|---------------|---------|----------|
| `master` | `bsv2` | `3.x.x` | `legacy` | Legacy support, `bsv2` compatibility. |
| `migrate-to-bsv-sdk` | `@bsv/sdk` | `4.x.x` | `latest` | Modern applications, enhanced security. |

---

## 2. How to Publish

### Publishing Legacy Updates (`bsv2`)
When you make a change to the `master` branch:
1. Ensure you are on `master`.
2. Update version (e.g., `3.1.0`):
   ```bash
   npm version minor
   ```
3. Publish with the `legacy` tag:
   ```bash
   npm publish --tag legacy
   ```
   *Users can install this via: `npm install bitbeam@legacy` or `npm install bitbeam@3`.*

### Publishing Modern Updates (`@bsv/sdk`)
When you are ready to release the new SDK version:
1. Switch to `migrate-to-bsv-sdk`.
2. Set version to `4.0.0` (Breaking Change):
   ```bash
   npm version 4.0.0
   ```
3. Publish normally (defaults to `latest` tag):
   ```bash
   npm publish
   ```
   *Users will get this by default via: `npm install bitbeam`.*

---

## 3. Maintenance Policy
- **Bug Fixes**: Critical security fixes should be backported to the `master` branch when possible.
- **New Features**: New features should primarily target the `migrate-to-bsv-sdk` branch (v4+).
