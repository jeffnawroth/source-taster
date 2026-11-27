# Source Taster Firefox extension: source code and build instructions

This archive is the complete source of the submitted add-on. It is an export of
one Git commit of the monorepo `jeffnawroth/source-taster`, plus two generated
files at the archive root: this README and `BUILD-INPUTS.env`. The project
licence is AGPL-3.0-or-later (`LICENSE`). The extension lives in
`apps/extension`. No file is obfuscated; the build only bundles and minifies
with Vite.

## Environment

- Ubuntu 24.04 (the AMO default builder). The maintainers rebuilt this archive on
  Ubuntu 24.04 arm64 and on macOS arm64 and got the same bytes. If your rebuild differs
  from the uploaded package, `release.json` lists the SHA-256 of every file inside,
  so the differing file can be found.
- Node.js 24.14.0 (`.nvmrc`; `engines` requires 24.14.0 or newer).
- npm 11.9.0 (the AMO default) only to install pnpm.
- pnpm 12.15.0, the version in the `packageManager` field of `package.json`.
- Network access for `pnpm install`. The lockfile `pnpm-lock.yaml` pins every
  package by version and integrity hash. The build makes no other network
  request.

## Build

Run these commands in the archive root, in this order:

```sh
npm install --global pnpm@12.15.0
pnpm install --frozen-lockfile
# Builds the workspace packages the extension imports and generates the
# message catalogues (nothing else, no website and no server).
pnpm exec turbo run build --filter='@source-taster/extension^...'
# Reads the public origins from BUILD-INPUTS.env, builds the Firefox and the
# Chromium package and writes both zips plus SHA256SUMS to apps/extension/dist/release.
set -a && . ./BUILD-INPUTS.env && set +a
pnpm --filter @source-taster/extension release
```

The Firefox package is `apps/extension/dist/release/source-taster-<version>-firefox.zip`.
Its SHA-256 equals the hash of the uploaded add-on package. `SHA256SUMS` in the
same folder lists it, and `release.json` lists the SHA-256 of every file inside.
The same command also builds the Chromium package, which is not part of this
submission.

## What the build does

- `apps/extension/vite.config.ts` bundles `apps/extension/src` and the workspace
  packages `packages/ui`, `packages/i18n`, `packages/contract-*` with Vite.
- `apps/extension/extension-config.ts` writes `manifest.json` for the store
  channel. `SOURCE_TASTER_EXTENSION_CHANNEL=store` is set by the release script.
- `apps/extension/scripts/release.ts` and `scripts/zip.ts` package the output
  into a zip with sorted entries and fixed timestamps, so the same inputs give
  the same bytes.
- Fonts, icons and notices are copied unchanged from `packages/ui/public/fonts`
  and `packages/brand/exports`.
- Third-party packages are the ones in `pnpm-lock.yaml`; none is vendored or
  modified except the patch in `patches/`, which is applied by pnpm.

## Not in the add-on

The monorepo also holds a server, a web app and a website. They are part of the
archive because pnpm resolves one lockfile for the whole workspace, but none of
them is bundled into the add-on.
