# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`rsbuild-plugin-version-check` is an automatic version update detection plugin for Rsbuild + Vue 3 applications. It consists of two main components:

1. **Rsbuild Plugin** (`src/rsbuild-plugin.ts`) - Build-time plugin that generates `version.json` file after each build
2. **Runtime Module** (`src/utils.ts` + `src/vue.ts`) - Client-side version checking with Vue 3 integration

**Architecture Pattern**: Dual-phase version checking system
- **Build Phase**: Reads `package.json`, generates `version.json` to `dist/` directory
- **Runtime Phase**: Periodically fetches `version.json`, compares with localStorage, triggers callbacks on mismatch

## Development Commands

### Building
```bash
pnpm build          # Build both entry points (index.ts + vue.ts) to dist/
pnpm dev            # Watch mode build with hot reload
```

### Testing
```bash
pnpm test           # Run Vitest test suite
pnpm typecheck      # TypeScript type checking without emit
```

### Code Quality
```bash
pnpm lint           # ESLint with @antfu/eslint-config
```

### Local Testing
```bash
# Link for local development
pnpm link --global

# In target project
pnpm link --global rsbuild-plugin-version-check
```

### Publishing
```bash
pnpm release        # Use bumpp to version bump
npm publish         # Publish to npm (requires build first via prepublishOnly)
```

## Code Architecture

### Entry Points
- `src/index.ts` - Main entry: exports Rsbuild plugin + utility functions
- `src/vue.ts` - Vue 3 entry: exports Vue plugin + composition API hooks
- Both compile to `dist/` with separate type definitions

### Core Modules

**`src/rsbuild-plugin.ts`** - Rsbuild plugin implementation
- Hooks into `onAfterBuild` lifecycle
- Reads `package.json` from `process.cwd()`
- Writes `version.json` to build output directory
- Customizable via `versionInfo` option for custom metadata

**`src/utils.ts`** - Framework-agnostic utilities
- `getCurrentVersion()` / `setCurrentVersion()` - localStorage management
- `fetchLatestVersion()` - HTTP fetch with cache-busting (`?t=${Date.now()}`)
- `checkForUpdates()` - Compare stored vs. fetched versions
- `initVersionCheck()` - Polling mechanism with cleanup function
- `forceReload()` - Hard reload with service worker cache clearing

**`src/vue.ts`** - Vue 3 integration layer
- `createVersionCheck()` - Vue plugin factory with auto-start support
- Provides `$versionCheck` global property and composition API injection
- `useVersionCheck()` - Composition API hook to access version check instance
- Auto-cleanup on app unmount by intercepting `app.unmount()`

### Key Design Patterns

1. **Options Merging**: All functions merge user options with `DEFAULT_OPTIONS`
2. **Cleanup Functions**: `initVersionCheck()` returns cleanup function for timer disposal
3. **Dual Export Strategy**: Package exports both `/` and `/vue` entry points
4. **Progressive Enhancement**: Works without Vue (pure utilities) or with Vue plugin

## Build System

- **Bundler**: tsup (outputs ESM only)
- **External Deps**: `vue` and `@rsbuild/core` marked as external (peer dependencies)
- **Type Generation**: Automatic `.d.ts` generation via `dts: true`
- **No Code Splitting**: `splitting: false` for predictable output

## Testing Strategy

- **Framework**: Vitest with minimal configuration
- **Test Files**: Located in `test/` directory
- **Export Testing**: `test/exports.test.ts` validates package exports (currently disabled via `IS_READY = false`)

## Workspace Structure

This is a pnpm workspace root with catalog dependencies:
- `catalogs` define version ranges for shared dependencies across workspace
- Main package lives at workspace root (not in `packages/`)
- Configured for potential expansion into multi-package workspace

## Git Hooks

- **Pre-commit**: `pnpm i --frozen-lockfile --ignore-scripts --offline && npx lint-staged`
- **lint-staged**: Auto-fix all files with ESLint on commit

## TypeScript Configuration

- Uses standard TypeScript config (`tsconfig.json`)
- Type-checked via `tsc --noEmit` (no build)
- Build uses tsup instead of tsc for bundling
