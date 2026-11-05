// SPDX-License-Identifier: AGPL-3.0-or-later
// One command to explore the public product on a developer machine: a
// disposable PostgreSQL container, the verification API with its worker, and
// the web app. It is a thin wrapper around the server's existing browser-test
// composition (`apps/server/scripts/e2e-serve.ts`): the enabled Data sources
// answer from loopback fixtures, there is no AI, no mail and no payment
// provider. Web-page checks are opt-in (`--web`) because URLs outside the
// fixture hosts are fetched from the real internet. See docs/local-preview.md.
//
// With `--hosted` it additionally starts the private service (accounts,
// History, Check pack, Pro, DPA, Operator) from a prepared worktree
// (SOURCE_TASTER_SERVICE_WORKTREE) and the web app in hosted mode. That
// composition is the test harness's (`apps/server/scripts/e2e-serve-hosted.ts`
// on top of `bothPrograms`); mail and payments stay local fakes.
//
//   pnpm dev:local [--hosted] [--basic] [--web] [--no-reports] [--no-smoke]
//   pnpm dev:local:down
import { spawn, spawnSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

export const container = "stpreview-pg";
// service: the private service itself; servicePublic: the loopback tap in front
// of it that the browser talks to (it pays fake orders); mail: sign-in code page.
export const ports = {
  postgres: 5491,
  api: 5492,
  web: 5493,
  service: 5494,
  servicePublic: 5495,
  mail: 5496,
} as const;
const postgresImage = "postgres:18";
const root = fileURLToPath(new URL("..", import.meta.url));

/** Everything below is derived here and nowhere else, so it cannot drift. */
export function previewDatabase() {
  const admin = `postgres://postgres:postgres@127.0.0.1:${ports.postgres}/postgres`;
  const app = `postgres://verification_preview:verification_preview@127.0.0.1:${ports.postgres}/source_taster_preview`;
  return { admin, app };
}

/**
 * The server's test harness defaults to the developer's own PostgreSQL on 5433
 * and creates and drops databases there. Refuse to run unless both connection
 * strings are the preview container.
 */
export function assertOwnedDatabase(...urls: string[]) {
  for (const value of urls) {
    const url = new URL(value);
    if (url.hostname !== "127.0.0.1" || Number(url.port) !== ports.postgres)
      throw new Error(
        `Refusing to use a database outside the ${container} container (${url.hostname}:${url.port}).`,
      );
  }
}

export interface Options {
  hosted: boolean;
  basic: boolean;
  web: boolean;
  reports: boolean;
  smoke: boolean;
}

export function parseArguments(args: string[]): Options {
  const known = new Set([
    "--hosted",
    "--basic",
    "--web",
    "--no-reports",
    "--no-smoke",
  ]);
  const unknown = args.filter((argument) => !known.has(argument));
  if (unknown.length)
    throw new Error(
      `Unknown option ${unknown.join(", ")}. Known: ${[...known].join(" ")}`,
    );
  if (args.includes("--basic") && args.includes("--web"))
    throw new Error("--basic and --web exclude each other.");
  if (args.includes("--hosted") && args.includes("--web"))
    throw new Error(
      "--web does not apply to --hosted: web-page fixtures are not wired into the hosted composition.",
    );
  if (args.includes("--hosted") && args.includes("--no-reports"))
    throw new Error(
      "--no-reports does not apply to --hosted: its Quota is the real one, not the fake.",
    );
  return {
    hosted: args.includes("--hosted"),
    basic: args.includes("--basic"),
    web: args.includes("--web"),
    reports: !args.includes("--no-reports"),
    smoke: !args.includes("--no-smoke"),
  };
}

export interface ProbeFileSystem {
  isFile(path: string): boolean;
  isDirectory(path: string): boolean;
}

const realFileSystem: ProbeFileSystem = {
  isFile: (path) =>
    statSync(path, { throwIfNoEntry: false })?.isFile() ?? false,
  isDirectory: (path) =>
    statSync(path, { throwIfNoEntry: false })?.isDirectory() ?? false,
};

/**
 * The hosted run executes code from a private worktree and installs its own
 * database objects. It must be a prepared *linked* worktree (its `.git` is a
 * file), never the private main checkout, which stays untouched.
 */
export function serviceWorktreeProblems(
  value: string | undefined,
  fileSystem: ProbeFileSystem = realFileSystem,
): string[] {
  if (!value)
    return [
      "SOURCE_TASTER_SERVICE_WORKTREE is not set. Point it at a prepared linked worktree of the private service.",
    ];
  if (!isAbsolute(value))
    return [
      `SOURCE_TASTER_SERVICE_WORKTREE must be an absolute path (${value}).`,
    ];
  const problems: string[] = [];
  if (!fileSystem.isFile(`${value}/.git`))
    problems.push(
      `${value} is not a linked worktree (its .git must be a file); the private main checkout is never used.`,
    );
  if (!fileSystem.isFile(`${value}/apps/server/test/authority-process.ts`))
    problems.push(
      `${value} is not a worktree of the private service's launch branch (the hosted test composition is missing).`,
    );
  if (!fileSystem.isDirectory(`${value}/node_modules`))
    problems.push(`${value}/node_modules is missing: run pnpm install there.`);
  if (!fileSystem.isFile(`${value}/apps/web/dist/index.html`))
    problems.push(
      `The service's own web is not built in ${value}/apps/web/dist: see "Hosted preview" in docs/local-preview.md for the preparation steps.`,
    );
  if (!fileSystem.isDirectory(`${value}/packages/i18n/src/paraglide`))
    problems.push(
      `The generated message catalogue is missing in ${value} (see "Hosted preview" in docs/local-preview.md for the preparation steps).`,
    );
  if (!fileSystem.isDirectory(`${value}/apps/server/src/generated/prisma`))
    problems.push(
      `The generated Prisma client is missing in ${value}: see "Hosted preview" in docs/local-preview.md for the preparation steps.`,
    );
  return problems;
}

export interface HostedSetup {
  worktree: string;
  /** Tooling the payment fake needs; without it no payment fake is offered. */
  validator?: string;
}

/** Environment of the composition process; nothing from the caller's shell leaks in. */
export function compositionEnvironment(
  options: Options,
  inherited: NodeJS.ProcessEnv,
  hosted?: HostedSetup,
): Record<string, string> {
  if (options.hosted && !hosted)
    throw new Error("The hosted composition needs a service worktree.");
  const { admin, app } = previewDatabase();
  assertOwnedDatabase(admin, app);
  const kept = Object.fromEntries(
    Object.entries(inherited).filter(
      ([name, value]) =>
        value !== undefined &&
        // SERVICE_, SMTP_, STRIPE_ and OPS_ configure the private service and
        // its providers: a real key in the shell must never reach it.
        !/^(DATABASE_|SOURCE_TASTER_|VITE_|SERVICE_|SMTP_|STRIPE_|OPS_|NODE_ENV$|TEST_)/.test(
          name,
        ),
    ),
  ) as Record<string, string>;
  return {
    ...kept,
    DATABASE_ADMIN_URL: admin,
    DATABASE_TEST_URL: app,
    SOURCE_TASTER_E2E_API_PORT: String(ports.api),
    SOURCE_TASTER_E2E_WEB_PORT: String(ports.web),
    ...(options.basic ? {} : { SOURCE_TASTER_E2E_BIBLIOGRAPHIC: "true" }),
    ...(options.web ? { SOURCE_TASTER_E2E_WEB_FIXTURES: "true" } : {}),
    ...(options.reports && !options.hosted
      ? { SOURCE_TASTER_E2E_REPORTS: "granted" }
      : {}),
    ...(options.hosted && hosted
      ? {
          SOURCE_TASTER_SERVICE_WORKTREE: hosted.worktree,
          SOURCE_TASTER_E2E_SERVICE_PORT: String(ports.service),
          SOURCE_TASTER_E2E_SERVICE_PUBLIC_PORT: String(ports.servicePublic),
          SOURCE_TASTER_E2E_MAIL_PORT: String(ports.mail),
          SOURCE_TASTER_E2E_POSTGRES_PORT: String(ports.postgres),
          ...(options.smoke ? {} : { SOURCE_TASTER_E2E_NO_SMOKE: "true" }),
          ...(hosted.validator
            ? { SERVICE_TEST_EN16931_CONFIG: hosted.validator }
            : {}),
        }
      : {}),
  };
}

function docker(args: string[], allowFailure = false) {
  const result = spawnSync("docker", args, { encoding: "utf8" });
  if (result.error)
    throw new Error(
      "Docker is required but could not be started. Is Docker Desktop running?",
    );
  if (result.status !== 0 && !allowFailure)
    throw new Error(`docker ${args[0]} failed:\n${result.stderr.trim()}`);
  return result;
}

function portFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => server.close(() => resolve(true)));
  });
}

async function ensurePostgres() {
  const inspected = docker(
    [
      "inspect",
      "-f",
      '{{index .Config.Labels "stpreview"}}|{{.State.Running}}',
      container,
    ],
    true,
  );
  if (inspected.status === 0) {
    const [label, running] = inspected.stdout.trim().split("|");
    if (label !== "1")
      throw new Error(
        `A container named ${container} exists but is not ours; not touching it.`,
      );
    if (running !== "true") docker(["start", container]);
  } else {
    if (!(await portFree(ports.postgres)))
      throw new Error(
        `Port ${ports.postgres} is busy; free it, the preview does not pick another.`,
      );
    console.log(
      `Creating ${container} (${postgresImage}) on 127.0.0.1:${ports.postgres}…`,
    );
    docker([
      "run",
      "-d",
      "--name",
      container,
      "--label",
      "stpreview=1",
      "-p",
      `127.0.0.1:${ports.postgres}:5432`,
      "-e",
      "POSTGRES_USER=postgres",
      "-e",
      "POSTGRES_PASSWORD=postgres",
      postgresImage,
    ]);
  }
  // TCP on loopback only answers once the init-time server has been replaced.
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const ready = docker(
      ["exec", container, "pg_isready", "-U", "postgres", "-h", "127.0.0.1"],
      true,
    );
    if (ready.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `${container} did not become ready within 90 s. See: docker logs ${container}`,
  );
}

/** Missing builds otherwise show up as an unrelated stack trace deep in Vite. */
export function missingPrerequisites(
  exists: (path: string) => boolean = existsSync,
) {
  const required: [path: string, command: string][] = [
    ["node_modules", "pnpm install --frozen-lockfile"],
    [
      "apps/website/dist-preview/website-artifact.json",
      "pnpm pagefind:fetch && pnpm pagefind:build && pnpm pagefind:verify && pnpm build",
    ],
    ["packages/core/dist", "pnpm build"],
    ["packages/contract-verification/dist", "pnpm build"],
    ["packages/i18n/src/paraglide", "pnpm build"],
  ];
  return required.filter(([path]) => !exists(`${root}${path}`));
}

/**
 * A Check only lives while a client renews its lease, and the browser keeps
 * Check content in memory, so a stored "demo Check" cannot be shown on a
 * screen. This runs one real Check through API, worker and fixture sources
 * instead, and reports the Verdicts, so a broken stack fails before the browser.
 */
async function smokeCheck() {
  const api = `http://127.0.0.1:${ports.api}`;
  const text = [
    "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
    "Doe, J. (2020). A reference whose DOI does not exist. Journal of Examples, 1, 1–2. https://doi.org/10.5555/workspace-nonexistent",
  ].join("\n");
  interface Snapshot {
    id: string;
    state: string;
    references: {
      results: { outcome: { kind: string; verdict?: string } }[];
    }[];
  }
  const post = async (path: string, body?: unknown) => {
    const response = await fetch(`${api}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok)
      throw new Error(
        `Smoke Check: POST ${path} answered HTTP ${response.status}`,
      );
    return ((await response.json()) as { data: Snapshot }).data;
  };
  let check = await post("/v1/checks", { text });
  for (let attempt = 0; check.state !== "ended"; attempt++) {
    if (attempt > 100)
      throw new Error("Smoke Check did not finish within 40 s.");
    await new Promise((resolve) => setTimeout(resolve, 400));
    check = await post(`/v1/checks/${check.id}/lease`);
  }
  return check.references.map((reference) => {
    const outcome = reference.results.at(-1)?.outcome;
    return outcome?.verdict ?? outcome?.kind ?? "no result";
  });
}

async function waitFor(
  url: string,
  child: { exitCode: number | null },
  ms = 120_000,
) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(
        "The preview stack exited during startup (see output above).",
      );
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(5_000) })).ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`${url} did not answer within ${ms / 1000} s.`);
}

/** Wait for the standalone stack, smoke-check it and print where everything is. */
async function announceStandalone(
  options: Options,
  stack: { exitCode: number | null },
) {
  await waitFor(`http://127.0.0.1:${ports.api}/health`, stack);
  await waitFor(`http://127.0.0.1:${ports.web}/`, stack);
  const smoke = options.smoke ? await smokeCheck() : undefined;
  console.log(`
Source Taster local preview is running (fake, local integrations only${options.web ? "; web-page checks reach the real internet for non-fixture hosts" : ""}).

  Web app      http://127.0.0.1:${ports.web}/
  Website      http://127.0.0.1:${ports.web}/en/   (and /de/, /docs/en/)
  API health   http://127.0.0.1:${ports.api}/health
  API docs     http://127.0.0.1:${ports.api}/v1/openapi.json
  PostgreSQL   ${container} on 127.0.0.1:${ports.postgres}
${smoke ? `  Smoke Check  passed through API, worker and fixtures: ${smoke.join(", ")}\n` : ""}
Press Ctrl-C to stop. The database of this run is dropped on exit.
Run \`pnpm dev:local:down\` to remove the ${container} container.
`);
}

async function up(options: Options) {
  const missing = missingPrerequisites();
  if (missing.length) {
    console.error("Build prerequisites are missing:");
    for (const [path, command] of missing)
      console.error(`  ${path}\n    run: ${command}`);
    process.exit(1);
  }
  let hosted: HostedSetup | undefined;
  if (options.hosted) {
    const worktree = process.env.SOURCE_TASTER_SERVICE_WORKTREE;
    const problems = serviceWorktreeProblems(worktree);
    if (problems.length) {
      console.error("The hosted preview cannot start:");
      for (const problem of problems) console.error(`  ${problem}`);
      process.exit(1);
    }
    const validator = `${worktree}/.tmp/en16931/validator.json`;
    hosted = {
      worktree: worktree!,
      ...(realFileSystem.isFile(validator) ? { validator } : {}),
    };
  }
  const needed = options.hosted
    ? [ports.api, ports.web, ports.service, ports.servicePublic, ports.mail]
    : [ports.api, ports.web];
  for (const port of needed)
    if (!(await portFree(port)))
      throw new Error(
        `Port ${port} is busy; free it, the preview does not pick another.`,
      );
  await ensurePostgres();
  const stack = spawn(
    "pnpm",
    [
      "--filter",
      "@source-taster/server",
      options.hosted ? "e2e:serve:hosted" : "e2e:serve",
    ],
    {
      cwd: root,
      env: compositionEnvironment(options, process.env, hosted),
      stdio: "inherit",
      // Its own process group: pnpm, the shell and the servers below it all
      // have to receive the signal, or they outlive this wrapper and hold the
      // ports and the run's database.
      detached: true,
    },
  );
  let stopping = false;
  const exited = new Promise<number>((resolve, reject) => {
    stack.once("error", (error) =>
      reject(new Error(`Could not start pnpm: ${error.message}`)),
    );
    // A stack stopped by our own signal is a normal end, not a failure.
    stack.once("exit", (code) => resolve(code ?? (stopping ? 0 : 1)));
  });
  const signalGroup = (signal: NodeJS.Signals) => {
    if (stack.pid === undefined) return;
    try {
      process.kill(-stack.pid, signal);
    } catch {
      // already gone
    }
  };
  const stop = () => {
    if (stopping) {
      // A second Ctrl-C: do not leave the ports and the database behind.
      signalGroup("SIGKILL");
      return;
    }
    stopping = true;
    signalGroup("SIGTERM");
    setTimeout(() => signalGroup("SIGKILL"), 15_000).unref();
  };
  // Closing the terminal window (SIGHUP): the stack has its own session, so it
  // would otherwise survive and keep the ports.
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const)
    process.on(signal, stop);
  try {
    // The hosted stack seeds, smoke-checks and prints its own banner (it holds
    // the sign-in codes and the Account tokens); only the standalone one is
    // verified from out here.
    if (!options.hosted) await announceStandalone(options, stack);
  } catch (error) {
    stop();
    await exited.catch(() => undefined);
    throw error;
  }
  process.exit(await exited);
}

function down() {
  const inspected = docker(
    ["inspect", "-f", '{{index .Config.Labels "stpreview"}}', container],
    true,
  );
  if (inspected.status !== 0) {
    console.log(`${container} does not exist; nothing to remove.`);
    return;
  }
  if (inspected.stdout.trim() !== "1")
    throw new Error(
      `A container named ${container} exists but is not ours; not touching it.`,
    );
  docker(["rm", "-f", "-v", container]);
  console.log(`Removed ${container} and its volume.`);
}

if (import.meta.main) {
  try {
    const [command, ...rest] = process.argv.slice(2);
    if (command === "down") down();
    else if (command === "up") await up(parseArguments(rest));
    else
      throw new Error(
        "Usage: dev-local.ts up [--hosted] [--basic] [--web] [--no-reports] [--no-smoke] | down",
      );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
