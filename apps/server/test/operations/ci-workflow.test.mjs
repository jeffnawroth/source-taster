// SPDX-License-Identifier: AGPL-3.0-or-later
// Guards the hosted CI shape that keeps every job inside its 60-minute budget.
// Run 41867607025 passed every test (686/686, load harness 6/6) and was then
// cancelled by the 60-minute timeout in the native side-panel step: not a hang,
// the work (13 min WASM build + 20 min server suite + 14 min e2e + side panel)
// had outgrown one job. The server suite is sharded, e2e and the native side
// panel have their own jobs, and `checks` is only the aggregate gate that
// branch protection, PR checks and the deploy workflow read.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

const root = join(import.meta.dirname, "..", "..", "..", "..");
const workflow = parse(
  await readFile(join(root, ".github", "workflows", "ci.yml"), "utf8"),
);
const runs = (job) =>
  (job.steps ?? []).map((s) => s.run).filter((r) => typeof r === "string");
const indexOfRun = (job, pattern) =>
  runs(job).findIndex((r) =>
    typeof pattern === "string" ? r === pattern : pattern.test(r),
  );
const workJobs = () =>
  Object.entries(workflow.jobs).filter(([name]) => name !== "checks");

// The checksum-pinned controlled website inputs and the offline WASM build.
// Every job that needs them must run the very same steps, in this order.
const pagefindPrelude = [
  "mkdir -p .tmp\npnpm pagefind:fetch 2>&1 | tee .tmp/pagefind-fetch.log\n",
  "pnpm pagefind:build 2>&1 | tee .tmp/pagefind-build.log",
  "pnpm pagefind:verify",
];
const needsPagefind = new Set([
  "verify",
  "server-tests",
  "e2e",
  "side-panel",
  "web-suites",
  "extension-suites",
  "public-contracts",
  "dependencies",
]);
// #142: the public end-to-end suites that need only this repository and local
// fakes, each in its own job so every job keeps its 60-minute budget.
const publicSuiteJobs = ["web-suites", "extension-suites", "public-contracts"];

test("every job keeps a bounded timeout, never raised above the original 60 minutes", () => {
  for (const [name, job] of Object.entries(workflow.jobs)) {
    assert.ok(Number.isInteger(job["timeout-minutes"]), `${name} timeout`);
    // Never raised above the original budget; the aggregate gate runs no work.
    const limit = name === "checks" ? 5 : 60;
    assert.ok(job["timeout-minutes"] <= limit, `${name} timeout <= ${limit}`);
  }
});

test("every job that starts the service builds the exact isolated extractor image first", () => {
  for (const name of [
    "verify",
    "server-tests",
    "e2e",
    "side-panel",
    ...publicSuiteJobs,
  ]) {
    const job = workflow.jobs[name];
    const image = indexOfRun(job, /extractor-image\.ts/);
    assert.ok(image >= 0, `${name} builds the extractor image`);
    assert.match(
      runs(job)[image],
      /SOURCE_TASTER_DOCUMENT_IMAGE=.*>> "\$GITHUB_ENV"/,
    );
    const suite = job.steps.findIndex(
      (s) =>
        typeof s.run === "string" &&
        /vitest|turbo run test|test:e2e|test:native|playwright test|--test /.test(
          s.run,
        ),
    );
    assert.ok(suite > job.steps.findIndex((s) => s.run?.includes("extractor")));
  }
});

test("the full server suite is sharded across independent runners, each with its own PostgreSQL 18", () => {
  const job = workflow.jobs["server-tests"];
  assert.ok(job, "server-tests job");
  assert.equal(job.strategy["fail-fast"], false);
  const shards = job.strategy.matrix.shard;
  assert.ok(shards.length >= 4, "at least four shards");
  for (const [index, shard] of shards.entries())
    assert.equal(shard, `${index + 1}/${shards.length}`);
  assert.equal(job.services.postgres.image, "postgres:18");
  assert.deepEqual(job.services.postgres.ports, ["5433:5432"]);
  const suite = runs(job).filter((r) => r.includes("@source-taster/server"));
  assert.equal(suite.length, 1, "exactly one server suite command");
  assert.match(suite[0], /--shard=\$\{\{ matrix\.shard \}\}/);
  assert.match(suite[0], /--reporter=verbose/);
  assert.match(suite[0], /--log-order=stream/);
  // The service serves the built web assets and the isolated extractor image:
  // a fresh runner has to produce both before a shard runs.
  const suiteAt = indexOfRun(job, /@source-taster\/server/);
  assert.ok(indexOfRun(job, "pnpm build") >= 0, "builds before the shard");
  assert.ok(indexOfRun(job, "pnpm build") < suiteAt);
  const image = indexOfRun(job, /extractor-image\.ts/);
  assert.ok(image >= 0 && image < suiteAt, "extractor image before the shard");
  assert.match(
    runs(job)[image],
    /SOURCE_TASTER_DOCUMENT_IMAGE=.*>> "\$GITHUB_ENV"/,
  );
});

test("no job runs the server suite unsharded", () => {
  for (const [name, job] of Object.entries(workflow.jobs)) {
    if (name === "server-tests") continue;
    for (const run of runs(job))
      assert.ok(
        !/\bpnpm test(?![:\w-])|\bturbo run test(?![:\w-])|vitest run(?! --config)/.test(
          run,
        ) || /load-run\.load\.ts/.test(run),
        `${name} must not run the unsharded server suite: ${run}`,
      );
  }
});

test("the end-to-end and native side-panel suites run in their own jobs", () => {
  const e2e = workflow.jobs.e2e;
  const panel = workflow.jobs["side-panel"];
  assert.ok(e2e && panel, "e2e and side-panel jobs");
  assert.ok(runs(e2e).includes("pnpm test:e2e"));
  assert.ok(
    runs(panel).includes("pnpm --filter @source-taster/extension test:native"),
  );
  for (const job of [e2e, panel]) {
    assert.equal(job.services.postgres.image, "postgres:18");
    assert.deepEqual(job.services.postgres.ports, ["5433:5432"]);
    assert.ok(indexOfRun(job, "pnpm build") >= 0);
    assert.ok(
      runs(job).includes(
        "pnpm --filter @source-taster/web exec playwright install --with-deps chromium",
      ),
    );
    assert.ok(
      job.steps.some(
        (s) =>
          typeof s.uses === "string" &&
          s.uses.includes("upload-artifact") &&
          s.if === "failure()",
      ),
      "failure evidence",
    );
  }
  // One heavy browser suite per job: neither shares a job with the other or
  // with the verification steps.
  assert.ok(!runs(e2e).some((r) => r.includes("test:native")));
  assert.ok(!runs(panel).includes("pnpm test:e2e"));
  for (const [name, job] of workJobs())
    if (name !== "e2e" && name !== "side-panel")
      assert.ok(
        !runs(job).some((r) => /test:e2e|test:native/.test(r)),
        `${name} must not run browser suites`,
      );
});

const playwrightCommands = (job) =>
  runs(job).filter((r) =>
    /^pnpm --filter @source-taster\/(web|extension) exec playwright test /.test(
      r,
    ),
  );
const configsOf = (job) =>
  playwrightCommands(job).map((r) => r.match(/--config (\S+)/)?.[1]);

test("the public Playwright and contract suites run in CI on local fakes, each in a bounded job with its own PostgreSQL 18 and the pinned build prelude (#142)", () => {
  for (const name of publicSuiteJobs) {
    const job = workflow.jobs[name];
    assert.ok(job, `${name} job`);
    assert.equal(job["timeout-minutes"], 60, `${name} timeout`);
    assert.equal(job.services.postgres.image, "postgres:18");
    assert.deepEqual(job.services.postgres.ports, ["5433:5432"]);
    assert.ok(indexOfRun(job, "pnpm build") >= 0, `${name} builds`);
    // Public repository and fakes only: no private checkout, token or key.
    const text = JSON.stringify(job);
    assert.ok(
      !/source-taster-service|SERVICE_WORKTREE|secrets\.|deploy[-_ ]key|ssh-key/i.test(
        text,
      ),
      `${name} touches no private service or secret`,
    );
    // Every action stays pinned to a full commit SHA.
    for (const step of job.steps)
      if (step.uses)
        assert.match(step.uses, /@[0-9a-f]{40}$/, `${name} pins ${step.uses}`);
  }
  const web = workflow.jobs["web-suites"];
  assert.deepEqual(configsOf(web), [
    "abuse.playwright.config.ts",
    "report.playwright.config.ts",
  ]);
  assert.ok(
    runs(web).includes(
      "pnpm --filter @source-taster/web exec playwright install --with-deps chromium",
    ),
  );
  const extension = workflow.jobs["extension-suites"];
  assert.deepEqual(configsOf(extension), [
    "account.playwright.config.ts",
    "ai.playwright.config.ts",
    "report.playwright.config.ts",
    "selection.playwright.config.ts",
    "firefox.playwright.config.ts",
  ]);
  // Only the browsers these suites launch (Chromium panel, Firefox sidebar).
  assert.ok(
    runs(extension).includes(
      "pnpm --filter @source-taster/extension exec playwright install --with-deps chromium firefox",
    ),
  );
  for (const job of [web, extension])
    assert.ok(
      job.steps.some(
        (s) =>
          typeof s.uses === "string" &&
          s.uses.includes("upload-artifact") &&
          s.if === "failure()",
      ),
      "failure evidence",
    );
  // The Account suite is mixed: its sensitive-panel spec composes the private
  // service, so the public specs are named and that one is excluded on purpose.
  // Playwright reads each argument as a path regex: a bare `panel.spec.ts`
  // would also select `sensitive-panel.spec.ts`, so every name carries its
  // directory.
  const account = playwrightCommands(extension)[0];
  for (const spec of [
    "panel.spec.ts",
    "preferences-transport.spec.ts",
    "sensitive-transport.spec.ts",
    "transport.spec.ts",
  ])
    assert.ok(account.includes(` e2e-account/${spec}`), spec);
  assert.ok(!account.includes("sensitive-panel"), "private spec stays out");
  const contracts = workflow.jobs["public-contracts"];
  assert.deepEqual(
    runs(contracts)
      .filter((r) => r.includes("vitest run"))
      .map((r) => r.match(/--config (\S+)/)?.[1]),
    [
      "abuse.vitest.config.ts",
      "history.vitest.config.ts",
      "owner-deletion.vitest.config.ts",
    ],
  );
});

test("no CI job wires a suite that composes the private service (those run in a separate guarded workflow, #142)", () => {
  // Extension configs whose specs all call bothPrograms (or the fake built on it).
  const privateExtensionConfigs = [
    "private",
    "quota",
    "dpa",
    "guest",
    "history",
    "preferences",
  ];
  const steps = Object.values(workflow.jobs).flatMap((j) => j.steps ?? []);
  for (const r of steps
    .map((s) => s.run)
    .filter((r) => typeof r === "string")) {
    assert.ok(!/bothPrograms|SOURCE_TASTER_SERVICE/.test(r), r);
    for (const name of privateExtensionConfigs)
      assert.ok(!r.includes(`--config ${name}.playwright.config.ts`), r);
  }
});

test("the verification job keeps every static gate, the operations CLI and the load harness", () => {
  const job = workflow.jobs.verify;
  assert.ok(job, "verify job");
  for (const run of [
    "pnpm typecheck",
    "pnpm lint",
    "pnpm i18n:check",
    "pnpm build",
  ])
    assert.ok(runs(job).includes(run), run);
  assert.ok(
    runs(job).some((r) => r.startsWith("git diff --exit-code -- packages/")),
    "committed transport artifacts",
  );
  assert.ok(
    runs(job).includes(
      "node --test --test-concurrency=1 apps/server/test/operations/*.test.mjs",
    ),
  );
  assert.ok(runs(job).some((r) => /load-run\.load\.ts/.test(r)));
  assert.equal(job.services.postgres.image, "postgres:18");
});

test("every job that needs the controlled website inputs gets them through the same checksum-pinned steps", () => {
  for (const name of needsPagefind) {
    const job = workflow.jobs[name];
    assert.ok(job, name);
    const at = indexOfRun(job, pagefindPrelude[0]);
    assert.ok(at >= 0, `${name} fetches the checksum-pinned inputs`);
    assert.deepEqual(
      runs(job).slice(at, at + 3),
      pagefindPrelude,
      `${name} fetch, offline build, verify in this order`,
    );
    for (const run of runs(job).slice(0, at))
      assert.ok(
        !/pnpm (build|test|typecheck|lint)|playwright/.test(run),
        `${name} uses nothing before the verified inputs: ${run}`,
      );
    // No caching may stand in for the checksum-pinned fetch and verify.
    assert.ok(
      !job.steps.some((s) => /actions\/cache/.test(s.uses ?? "")),
      `${name} does not cache the pinned inputs`,
    );
  }
});

test("the dependency gates keep the checksum-pinned scanner", () => {
  const script = runs(workflow.jobs.dependencies).join("\n");
  assert.match(
    script,
    /160c6253e2922e9e0a6a9771c5c4c40a4b3c6090b34a3cdd5e80c96cc2e4218b {2}\.tmp\/audit\/osv-scanner/,
  );
  assert.match(script, /sha256sum --check/);
  assert.match(script, /scripts\/refresh-advisories\.sh/);
});

test("the stable checks job is the aggregate gate over every other job", () => {
  const gate = workflow.jobs.checks;
  assert.ok(gate, "checks job");
  const others = Object.keys(workflow.jobs).filter((n) => n !== "checks");
  assert.deepEqual([...gate.needs].sort(), others.sort());
  for (const required of [
    "verify",
    "server-tests",
    "e2e",
    "side-panel",
    ...publicSuiteJobs,
    "dependencies",
  ])
    assert.ok(gate.needs.includes(required), required);
  // `always()` so a failed or cancelled need fails the gate instead of
  // skipping it (a skipped required check would read as passing).
  assert.equal(gate.if, "always()");
  assert.ok(!gate.steps.some((s) => s.uses), "no third-party code in the gate");
  assert.ok(!gate.services, "the gate needs no services");
  const env = JSON.stringify(gate.steps.map((s) => s.env ?? {}));
  for (const need of gate.needs)
    assert.ok(env.includes(`needs.${need}.result`), need);
  const script = runs(gate).join("\n");
  assert.equal(script.match(/"success"/g).length, gate.needs.length);
  assert.ok(!script.includes("|| true"));
  assert.ok(!/continue-on-error/.test(JSON.stringify(gate)));
});

test("the deploy workflow reads the exact-commit CI run conclusion that the aggregate gate decides", async () => {
  const deploy = await readFile(
    join(root, ".github", "workflows", "deploy-scalingo.yml"),
    "utf8",
  );
  assert.match(deploy, /workflows\/ci\.yml\/runs\?head_sha=/);
  assert.match(deploy, /r\.conclusion!=="success"/);
  // The run conclusion is success only if no job failed, was cancelled or timed out.
  for (const [name, job] of Object.entries(workflow.jobs))
    assert.ok(!job["continue-on-error"], `${name} may not continue on error`);
});
