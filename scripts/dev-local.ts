// SPDX-License-Identifier: AGPL-3.0-or-later
// One command to explore the public product on a developer machine, fully
// offline: a disposable PostgreSQL container, the verification API with its
// worker, and the web app. It is a thin wrapper around the server's existing
// browser-test composition (`apps/server/scripts/e2e-serve.ts`): every external
// Data source answers from loopback fixtures, there is no AI, no mail and no
// payment provider. See docs/local-preview.md.
//
//   pnpm dev:local [--basic] [--no-reports] [--no-smoke]
//   pnpm dev:local:down
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

export const container = "stpreview-pg";
export const ports = { postgres: 5491, api: 5492, web: 5493 } as const;
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
  basic: boolean;
  reports: boolean;
  smoke: boolean;
}

export function parseArguments(args: string[]): Options {
  const known = new Set(["--basic", "--no-reports", "--no-smoke"]);
  const unknown = args.filter((argument) => !known.has(argument));
  if (unknown.length)
    throw new Error(
      `Unknown option ${unknown.join(", ")}. Known: ${[...known].join(" ")}`,
    );
  return {
    basic: args.includes("--basic"),
    reports: !args.includes("--no-reports"),
    smoke: !args.includes("--no-smoke"),
  };
}

/** Environment of the composition process; nothing from the caller's shell leaks in. */
export function compositionEnvironment(
  options: Options,
  inherited: NodeJS.ProcessEnv,
): Record<string, string> {
  const { admin, app } = previewDatabase();
  assertOwnedDatabase(admin, app);
  const kept = Object.fromEntries(
    Object.entries(inherited).filter(
      ([name, value]) =>
        value !== undefined &&
        !/^(DATABASE_|SOURCE_TASTER_|VITE_|NODE_ENV$|TEST_)/.test(name),
    ),
  ) as Record<string, string>;
  return {
    ...kept,
    DATABASE_ADMIN_URL: admin,
    DATABASE_TEST_URL: app,
    SOURCE_TASTER_E2E_API_PORT: String(ports.api),
    SOURCE_TASTER_E2E_WEB_PORT: String(ports.web),
    ...(options.basic
      ? {}
      : {
          SOURCE_TASTER_E2E_BIBLIOGRAPHIC: "true",
          SOURCE_TASTER_E2E_WEB_FIXTURES: "true",
        }),
    ...(options.reports ? { SOURCE_TASTER_E2E_REPORTS: "granted" } : {}),
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
      if ((await fetch(url)).ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`${url} did not answer within ${ms / 1000} s.`);
}

async function up(options: Options) {
  const missing = missingPrerequisites();
  if (missing.length) {
    console.error("Build prerequisites are missing:");
    for (const [path, command] of missing)
      console.error(`  ${path}\n    run: ${command}`);
    process.exit(1);
  }
  for (const port of [ports.api, ports.web])
    if (!(await portFree(port)))
      throw new Error(
        `Port ${port} is busy; free it, the preview does not pick another.`,
      );
  await ensurePostgres();
  const stack = spawn(
    "pnpm",
    ["--filter", "@source-taster/server", "e2e:serve"],
    {
      cwd: root,
      env: compositionEnvironment(options, process.env),
      stdio: "inherit",
      // Its own process group: pnpm, the shell and the servers below it all
      // have to receive the signal, or they outlive this wrapper and hold the
      // ports and the run's database.
      detached: true,
    },
  );
  const stop = () => {
    try {
      process.kill(-stack.pid!, "SIGTERM");
    } catch {
      // already gone
    }
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  // Closing the terminal window: the stack has its own session, so it would
  // otherwise survive and keep the ports.
  process.once("SIGHUP", stop);
  const exited = new Promise<number>((resolve) =>
    stack.once("exit", (code) => resolve(code ?? 1)),
  );
  try {
    await waitFor(`http://127.0.0.1:${ports.api}/health`, stack);
    await waitFor(`http://127.0.0.1:${ports.web}/`, stack);
    const smoke = options.smoke ? await smokeCheck() : undefined;
    console.log(`
Source Taster local preview is running (fake, offline integrations only).

  Web app      http://127.0.0.1:${ports.web}/
  Website      http://127.0.0.1:${ports.web}/en/   (and /de/, /docs/en/)
  API health   http://127.0.0.1:${ports.api}/health
  API docs     http://127.0.0.1:${ports.api}/v1/openapi.json
  PostgreSQL   ${container} on 127.0.0.1:${ports.postgres}
${smoke ? `  Smoke Check  passed through API, worker and fixtures: ${smoke.join(", ")}\n` : ""}
Press Ctrl-C to stop. The database of this run is dropped on exit.
Run \`pnpm dev:local:down\` to remove the ${container} container.
`);
  } catch (error) {
    stop();
    await exited;
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
        "Usage: dev-local.ts up [--basic] [--no-reports] [--no-smoke] | down",
      );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
