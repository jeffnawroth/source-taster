# Source Taster - Firefox Extension Build Instructions

## Overview

The Source Taster is a browser extension that helps users quickly verify the validity and existence of sources cited in academic papers.

## Build Environment Requirements

### Operating System

- **Supported**: macOS, Linux, Windows
- **Tested on**: macOS, Linux

### Required Software

#### Node.js and Package Manager

- **Node.js**: Version 18.x or higher
- **pnpm**: Version 8.x or higher (preferred) or npm 9.x+

Installation:

```bash
# Install Node.js (version 18+)
# Download from: https://nodejs.org/

# Install pnpm globally
npm install -g pnpm@latest
```

#### Verification

```bash
node --version  # Should show v18.x.x or higher
pnpm --version  # Should show 8.x.x or higher
```

## Step-by-Step Build Instructions

### 1. Extract and Navigate to Source Code

```bash
# Extract the provided source code archive
unzip source-taster-source.zip
cd source-taster

# Navigate to extension directory
cd apps/extension
```

### 2. Install Dependencies

```bash
# Install all dependencies (from the extension directory)
pnpm install

# This installs dependencies for the entire monorepo including:
# - TypeScript compiler
# - Vue.js and Vue SFC compiler
# - Vite build tool
# - Vuetify UI framework
# - All other required packages from package.json
```

### 3. Build the Firefox Extension

```bash
# Build specifically for Firefox
EXTENSION=firefox pnpm build

# This command:
# 1. Clears any previous builds
# 2. Builds web assets (HTML, CSS, JS) using Vite
# 3. Generates Firefox-compatible manifest.json
# 4. Builds background scripts
# 5. Builds content scripts
```

### 4. Package the Extension

```bash
# Create the extension.zip file
EXTENSION=firefox pnpm pack:zip

# This creates: extension.zip (ready for Firefox Add-ons)
```

## Build Script

A complete build script is provided in `package.json`:

```json
{
  "scripts": {
    "build-firefox": "cross-env NODE_ENV=production EXTENSION=firefox run-s clear build:web build:prepare build:background build:js",
    "pack:zip": "rimraf extension.zip && jszip-cli add extension/* -o ./extension.zip"
  }
}
```

## Project Structure

### Source Code (Non-minified/transpiled)

- `src/` - All TypeScript/Vue source files
- `src/components/` - Vue.js components (SFC format)
- `src/stores/` - Pinia state management
- `src/services/` - API service layer
- `src/utils/` - Utility functions
- `src/locales/` - Internationalization files
- `src/manifest.ts` - Extension manifest generator

### Generated Files (Build Output)

- `extension/dist/` - Compiled JavaScript/CSS
- `extension/manifest.json` - Generated manifest
- `extension.zip` - Final packaged extension

## Technology Stack

### Build Tools

- **Vite 7.x** - Build tool and bundler
- **TypeScript 5.x** - Type-safe JavaScript compilation
- **Vue SFC Compiler** - Single File Component processing

### Frontend Framework

- **Vue.js 3.5.x** - Progressive JavaScript framework
- **Vuetify 3.9.x** - Material Design component library
- **Pinia 3.x** - State management

### Extensions

- **WebExtension Polyfill** - Cross-browser compatibility
- **unpdf 1.2.x** - PDF text extraction library

## Verification

After building, verify the extension structure:

```bash
# Check that build completed successfully
ls -la extension/
# Should contain: dist/, assets/, manifest.json

# Verify manifest.json contains Firefox-specific settings
cat extension/manifest.json | grep -A5 browser_specific_settings
```

## Development vs Production

### Development Build

```bash
# For development with hot reload
EXTENSION=firefox pnpm dev-firefox
```

### Production Build (for submission)

```bash
# Clean production build
EXTENSION=firefox pnpm build
EXTENSION=firefox pnpm pack:zip
```

## Troubleshooting

### Common Issues

1. **Node.js version too old**: Ensure Node.js 18+ is installed
2. **pnpm not found**: Install pnpm globally: `npm install -g pnpm`
3. **Build fails**: Clear cache and reinstall: `pnpm store prune && rm -rf node_modules && pnpm install`
4. **Permission issues**: Ensure proper file permissions on the build directory

### Clean Build

```bash
# Complete clean build
pnpm clear
pnpm install
EXTENSION=firefox pnpm build
EXTENSION=firefox pnpm pack:zip
```

## Contact

For build issues or questions, contact: contact@sourcetaster.com

---

**Note**: This extension uses standard open-source libraries (Vue.js, Vite, TypeScript) with conventional build processes. All source code is human-readable and non-obfuscated. The build process only performs standard compilation (TypeScript → JavaScript) and bundling for web delivery.
