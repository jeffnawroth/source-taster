// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertOwnedDatabase,
  compositionEnvironment,
  container,
  missingPrerequisites,
  parseArguments,
  ports,
  previewDatabase,
} from "./dev-local.ts";

await test("the preview owns ports from 5491 and a stpreview- container", () => {
  assert.ok(container.startsWith("stpreview-"));
  for (const port of Object.values(ports)) assert.ok(port >= 5491);
});

await test("both database URLs point at the preview container and nowhere else", () => {
  const { admin, app } = previewDatabase();
  assert.doesNotThrow(() => assertOwnedDatabase(admin, app));
  // The server harness's own default is the developer's long-lived instance.
  assert.throws(() =>
    assertOwnedDatabase("postgres://postgres:postgres@localhost:5433/postgres"),
  );
  assert.throws(() =>
    assertOwnedDatabase("postgres://u:p@127.0.0.1:5433/source_taster"),
  );
  assert.throws(() => assertOwnedDatabase("postgres://u:p@db.example:5491/x"));
});

await test("inherited database and product settings never reach the composition", () => {
  const environment = compositionEnvironment(parseArguments([]), {
    PATH: "/bin",
    HOME: "/home/x",
    DATABASE_URL: "postgres://prod/db",
    DATABASE_ADMIN_URL: "postgres://postgres:postgres@localhost:5433/postgres",
    DATABASE_TEST_URL: "postgres://elsewhere",
    SOURCE_TASTER_MODE: "hosted",
    SOURCE_TASTER_DOCUMENT_IMAGE: "sha256:x",
    SOURCE_TASTER_AI_EXTRACTION: "./real-provider.js",
    VITE_SOURCE_TASTER_MODE: "hosted",
    NODE_ENV: "production",
    TEST_REPORT_FEATURE: "none",
  });
  assert.equal(environment.PATH, "/bin");
  assert.equal(environment.HOME, "/home/x");
  assert.equal(environment.DATABASE_ADMIN_URL, previewDatabase().admin);
  assert.equal(environment.DATABASE_TEST_URL, previewDatabase().app);
  assert.equal(environment.DATABASE_URL, undefined);
  assert.equal(environment.SOURCE_TASTER_MODE, undefined);
  assert.equal(environment.SOURCE_TASTER_AI_EXTRACTION, undefined);
  assert.equal(environment.SOURCE_TASTER_DOCUMENT_IMAGE, undefined);
  assert.equal(environment.VITE_SOURCE_TASTER_MODE, undefined);
  assert.equal(environment.NODE_ENV, undefined);
  assert.equal(environment.TEST_REPORT_FEATURE, undefined);
  assert.equal(environment.SOURCE_TASTER_E2E_API_PORT, String(ports.api));
  assert.equal(environment.SOURCE_TASTER_E2E_WEB_PORT, String(ports.web));
});

await test("options select the fixture families", () => {
  const full = compositionEnvironment(parseArguments([]), {});
  assert.equal(full.SOURCE_TASTER_E2E_BIBLIOGRAPHIC, "true");
  // Web-page checks fetch non-fixture hosts from the real internet: opt-in only.
  assert.equal(full.SOURCE_TASTER_E2E_WEB_FIXTURES, undefined);
  const web = compositionEnvironment(parseArguments(["--web"]), {});
  assert.equal(web.SOURCE_TASTER_E2E_WEB_FIXTURES, "true");
  assert.throws(() => parseArguments(["--basic", "--web"]));
  assert.ok(full.SOURCE_TASTER_E2E_REPORTS);
  const reduced = compositionEnvironment(
    parseArguments(["--basic", "--no-reports"]),
    {},
  );
  assert.equal(reduced.SOURCE_TASTER_E2E_BIBLIOGRAPHIC, undefined);
  assert.equal(reduced.SOURCE_TASTER_E2E_REPORTS, undefined);
  assert.throws(() => parseArguments(["--production"]));
});

await test("missing build output is named with the command that creates it", () => {
  assert.deepEqual(
    missingPrerequisites(() => true),
    [],
  );
  const missing = missingPrerequisites(
    (path) => !path.endsWith("website-artifact.json"),
  );
  assert.equal(missing.length, 1);
  assert.match(missing[0]![0], /dist-preview/);
  assert.match(missing[0]![1], /pnpm build/);
});
