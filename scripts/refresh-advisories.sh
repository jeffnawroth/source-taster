#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
set -euo pipefail
cache_dir="${OSV_SCANNER_LOCAL_DB_CACHE_DIRECTORY:-.tmp/osv-db}"
mkdir -p "$cache_dir/osv-scalibr/npm"
# Version 2.7.0 uses osv-scalibr/, rather than the older osv-scanner/ cache path.
# This request carries no project inventory, content or credentials.
curl --fail --silent --show-error --location \
  --dump-header "$cache_dir/headers.txt" \
  https://osv-vulnerabilities.storage.googleapis.com/npm/all.zip \
  --output "$cache_dir/osv-scalibr/npm/all.zip"
