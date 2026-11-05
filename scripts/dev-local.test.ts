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
  serviceWorktreeProblems,
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

const worktree = "/work/service-preview";
const validWorktree = new Set([
  `${worktree}/.git`,
  `${worktree}/apps/server/test/authority-process.ts`,
  `${worktree}/apps/web/dist/index.html`,
]);
const validDirectories = new Set([
  `${worktree}/node_modules`,
  `${worktree}/apps/server/src/generated/prisma`,
  `${worktree}/packages/i18n/src/paraglide`,
]);
const probe = (
  files: Set<string> = validWorktree,
  directories: Set<string> = validDirectories,
) => ({
  isFile: (path: string) => files.has(path),
  isDirectory: (path: string) => directories.has(path),
});

await test("--hosted is parsed and excludes what it cannot honour", () => {
  assert.equal(parseArguments([]).hosted, false);
  assert.equal(parseArguments(["--hosted"]).hosted, true);
  assert.equal(
    parseArguments(["--hosted", "--basic", "--no-smoke"]).basic,
    true,
  );
  assert.throws(() => parseArguments(["--hosted", "--web"]), /hosted/);
  // Hosted Quota is the real one; the fake-Quota switch would be a lie.
  assert.throws(() => parseArguments(["--hosted", "--no-reports"]), /hosted/);
});

await test("the hosted parts take ports above the public ones", () => {
  const taken: number[] = [ports.postgres, ports.api, ports.web];
  const hostedPorts = [ports.service, ports.servicePublic, ports.mail];
  for (const port of hostedPorts) {
    assert.ok(port > ports.web);
    assert.ok(!taken.includes(port));
  }
  assert.equal(new Set(Object.values(ports)).size, Object.keys(ports).length);
});

await test("only a prepared linked worktree of the private service is accepted", () => {
  assert.deepEqual(serviceWorktreeProblems(worktree, probe()), []);
  assert.match(
    serviceWorktreeProblems(undefined, probe())[0]!,
    /SOURCE_TASTER_SERVICE_WORKTREE/,
  );
  assert.match(
    serviceWorktreeProblems("relative/path", probe())[0]!,
    /absolute/,
  );
  // The main checkout has a .git directory, a linked worktree a .git file.
  const mainCheckout = new Set(validWorktree);
  mainCheckout.delete(`${worktree}/.git`);
  assert.match(
    serviceWorktreeProblems(worktree, probe(mainCheckout)).join(),
    /linked worktree/,
  );
  const noProcess = new Set(validWorktree);
  noProcess.delete(`${worktree}/apps/server/test/authority-process.ts`);
  assert.match(
    serviceWorktreeProblems(worktree, probe(noProcess)).join(),
    /launch branch/,
  );
  // The service's own pages are its built web.
  const unbuilt = new Set(validWorktree);
  unbuilt.delete(`${worktree}/apps/web/dist/index.html`);
  assert.match(
    serviceWorktreeProblems(worktree, probe(unbuilt)).join(),
    /apps\/web\/dist/,
  );
  assert.match(
    serviceWorktreeProblems(worktree, probe(validWorktree, new Set())).join(),
    /node_modules[^]*Prisma/,
  );
});

await test("the hosted composition gets the worktree and ports, and nothing from the shell", () => {
  assert.throws(
    () => compositionEnvironment(parseArguments(["--hosted"]), {}),
    /worktree/,
  );
  const environment = compositionEnvironment(
    parseArguments(["--hosted"]),
    {
      PATH: "/bin",
      HOME: "/home/dev",
      RESEND_API_KEY: "re_live_x",
      AWS_SECRET_ACCESS_KEY: "aws",
      GITHUB_TOKEN: "ghp_x",
      SENTRY_DSN: "https://sentry.example",
      HTTPS_PROXY: "http://proxy.example",
      SERVICE_COMMERCE_CONFIG: "/real/stripe.json",
      SERVICE_GUEST_AUTH_CONFIG: "/real/auth.json",
      SMTP_HOST: "smtp.real.example",
      SMTP_PASSWORD: "secret",
      STRIPE_SECRET_KEY: "sk_live_x",
      OPS_LOOPBACK_FIXTURES: "1",
      SOURCE_TASTER_SERVICE_WORKTREE: "/somewhere/else",
      SERVICE_TEST_EN16931_CONFIG: "/somewhere/else.json",
    },
    { worktree, validator: `${worktree}/.tmp/en16931/validator.json` },
  );
  assert.equal(environment.PATH, "/bin");
  assert.equal(environment.HOME, "/home/dev");
  // An allowlist, not a denylist: provider keys under any name stay out.
  for (const name of [
    "RESEND_API_KEY",
    "AWS_SECRET_ACCESS_KEY",
    "GITHUB_TOKEN",
    "SENTRY_DSN",
    "HTTPS_PROXY",
    "SERVICE_COMMERCE_CONFIG",
    "SERVICE_GUEST_AUTH_CONFIG",
    "SMTP_HOST",
    "SMTP_PASSWORD",
    "STRIPE_SECRET_KEY",
    "OPS_LOOPBACK_FIXTURES",
  ])
    assert.equal(environment[name], undefined, name);
  assert.equal(environment.SOURCE_TASTER_SERVICE_WORKTREE, worktree);
  assert.equal(
    environment.SERVICE_TEST_EN16931_CONFIG,
    `${worktree}/.tmp/en16931/validator.json`,
  );
  assert.equal(environment.DATABASE_ADMIN_URL, previewDatabase().admin);
  assert.equal(
    environment.SOURCE_TASTER_E2E_SERVICE_PORT,
    String(ports.service),
  );
  assert.equal(
    environment.SOURCE_TASTER_E2E_SERVICE_PUBLIC_PORT,
    String(ports.servicePublic),
  );
  assert.equal(environment.SOURCE_TASTER_E2E_MAIL_PORT, String(ports.mail));
  // The stack script drops stale harness databases; it must know the one
  // PostgreSQL it may do that in.
  assert.equal(
    environment.SOURCE_TASTER_E2E_POSTGRES_PORT,
    String(ports.postgres),
  );
  assert.equal(environment.SOURCE_TASTER_E2E_NO_SMOKE, undefined);
  assert.equal(environment.SOURCE_TASTER_E2E_REPORTS, undefined);
  const quiet = compositionEnvironment(
    parseArguments(["--hosted", "--no-smoke"]),
    {},
    { worktree },
  );
  assert.equal(quiet.SOURCE_TASTER_E2E_NO_SMOKE, "true");
  // Without the validator tooling the payment fake is not offered at all.
  const noValidator = compositionEnvironment(
    parseArguments(["--hosted"]),
    {},
    { worktree },
  );
  assert.equal(noValidator.SERVICE_TEST_EN16931_CONFIG, undefined);
  // Standalone keeps its shape and never learns about the private service.
  const standalone = compositionEnvironment(parseArguments([]), {
    SMTP_HOST: "smtp.real.example",
    STRIPE_SECRET_KEY: "sk_live_x",
  });
  assert.equal(standalone.SMTP_HOST, undefined);
  assert.equal(standalone.STRIPE_SECRET_KEY, undefined);
  assert.equal(standalone.SOURCE_TASTER_E2E_SERVICE_PORT, undefined);
});
