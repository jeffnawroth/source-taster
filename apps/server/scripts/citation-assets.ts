// SPDX-License-Identifier: AGPL-3.0-or-later
import { cp } from "node:fs/promises";
// tsc emits code; pinned XML/CSL and license notices travel with the server build.
await cp(
  new URL("../src/citations/assets", import.meta.url),
  new URL("../dist/citations/assets", import.meta.url),
  { recursive: true },
);
