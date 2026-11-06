# #142: Run the contract and Playwright suites in CI

The launch audit found that most end-to-end evidence ran only on a developer
machine. This document records the public half of the fix: which suites can run
from this repository alone, which of them now run in `.github/workflows/ci.yml`,
and where the suites that need the private service run (the private service's own
CI) and which of them are not covered yet.

## Classification

- **Class A:** runs with only this repository and local fakes. The suite may
  start the open verification program, a Vite server, a native browser, PostgreSQL
  and loopback HTTP fixtures, but never the private service.
- **Class B:** needs the private service. The suite calls `bothPrograms()` in
  `apps/server/test/support/both-programs.ts`, directly or through
  `sensitiveService()` or `bothRights()`. That helper reads
  `SOURCE_TASTER_SERVICE_WORKTREE` and migrates and starts the private program
  from that worktree. The "sensitive-service" fake only replaces sensitive-action
  fault injection; Preferences still go through the real private service, so every
  suite that uses it is class B.

The classification follows the import closure of every spec (A means no spec
reaches `both-programs.ts`) and was confirmed by running each class A suite
without `SOURCE_TASTER_SERVICE_WORKTREE` set.

## Inventory

"Local result" is from one run on an Apple-silicon laptop against a PostgreSQL 18
container, with `SOURCE_TASTER_SERVICE_WORKTREE` unset. "—" means the suite was
not run locally: it needs the private worktree, or it already runs in CI.
"In CI now" means this repository's `ci.yml`; for class B suites see
"Class B: run in the private service's CI" below.

### Web (`apps/web`)

| Suite (config)                                   | Class | In CI now             | Local result             |
| ------------------------------------------------ | ----- | --------------------- | ------------------------ |
| `playwright` (default, `e2e/`)                   | A     | yes (`e2e`)           | — (already in CI)        |
| `bibliographic`                                  | A     | yes (`e2e`)           | — (already in CI)        |
| `abuse`                                          | A     | **yes (`web-suites`)** | 4 passed, 7 s           |
| `report`                                         | A     | **yes (`web-suites`)** | 2 passed, 8 s           |
| `account`                                        | B     | no                    | —                        |
| `dpa`                                            | B     | no                    | —                        |
| `guest`                                          | B     | no                    | —                        |
| `history` (through `sensitiveService`)           | B     | no                    | —                        |
| `quota`                                          | B     | no                    | —                        |
| `rights`                                         | B     | no                    | —                        |
| `sensitive` (`sensitive.spec`, `private.spec`)   | B     | no                    | —                        |

### Extension (`apps/extension`)

| Suite (config)                                                  | Class | In CI now                   | Local result             |
| --------------------------------------------------------------- | ----- | --------------------------- | ------------------------ |
| `playwright` (default, `e2e/`, native side panel)               | A     | yes (`side-panel`)          | — (already in CI)        |
| `account`: `panel`, `preferences-transport`, `sensitive-transport`, `transport`, `consent`, `consent-native` (#162) | A | **yes (`extension-suites`)** | 23 passed, 33 s (before #162) |
| `account`: `sensitive-panel.spec.ts`                            | B     | no                          | fails without the worktree: `Set SOURCE_TASTER_SERVICE_WORKTREE …` (expected) |
| `ai`                                                            | A     | **yes (`extension-suites`)** | 4 passed, 5 s            |
| `report`                                                        | A     | **yes (`extension-suites`)** | 2 passed, 16 s           |
| `selection`                                                     | A     | **yes (`extension-suites`)** | 14 passed, 28 s          |
| `firefox`                                                       | A     | **yes (`extension-suites`)** | 1 passed, 11 s           |
| `dpa`                                                           | B     | no                          | —                        |
| `guest`                                                         | B     | no                          | —                        |
| `history` (through `sensitiveService`)                          | B     | no                          | —                        |
| `preferences`                                                   | B     | no                          | —                        |
| `private` (`commerce`, `quota`, `sensitive`, `session`)         | B     | no                          | —                        |
| `quota` (`e2e-private/quota.spec.ts`)                           | B     | no                          | —                        |

The extension `account` config is mixed. CI runs its six class A specs by path
and leaves `sensitive-panel.spec.ts` out on purpose; the guard test asserts that.

### Server contracts (`apps/server`, the 14 `test/*.contract.ts` files)

| Contract (vitest config)                                            | Class | In CI now                   | Local result              |
| ------------------------------------------------------------------- | ----- | --------------------------- | ------------------------- |
| `abuse.contract.ts` (`abuse.vitest.config.ts`)                      | A     | **yes (`public-contracts`)** | 15 passed, 18 s          |
| `history.contract.ts` (`history.vitest.config.ts`)                  | A     | **yes (`public-contracts`)** | 21 passed, 102 s         |
| `owner-deletion.contract.ts` (`owner-deletion.vitest.config.ts`)    | A     | **yes (`public-contracts`)** | 5 passed, 18 s           |
| `abuse-both.contract.ts` (`abuse-both.vitest.config.ts`)            | B     | no                          | —                         |
| `account.contract.ts` (`account.vitest.config.ts`)                  | B     | no                          | —                         |
| `configurations.contract.ts` (`configuration.vitest.config.ts`)     | B     | no                          | —                         |
| `dpa.contract.ts` (`dpa.vitest.config.ts`)                          | B     | no                          | —                         |
| `extension.contract.ts` (`extension.vitest.config.ts`)              | B     | no                          | —                         |
| `guest.contract.ts` (`guest.vitest.config.ts`)                      | B     | no                          | —                         |
| `quota.contract.ts`, `commerce.contract.ts`, `catalog.contract.ts` (`quota.vitest.config.ts`) | B | no  | —                         |
| `rights.contract.ts` (`rights.vitest.config.ts`)                    | B     | no                          | —                         |
| `sensitive.contract.ts` (`sensitive.vitest.config.ts`)              | B     | no                          | —                         |

`load.vitest.config.ts` (already in `verify`) and `imports.vitest.config.ts` are
not contract suites and are not in scope here.

Eleven of the fourteen contract files are class B; they cover most of the
cross-program evidence the audit asked for.

## What changed in `ci.yml`

Three new jobs, each a full `ubuntu-24.04` job with `timeout-minutes: 60`, its own
PostgreSQL 18 service on port 5433, SHA-pinned actions, the pnpm cache, the
checksum-pinned Pagefind prelude, `pnpm build` and the exact extractor image
(the same steps as `e2e` and `side-panel`):

| Job                | Runs                                                                 | Browsers installed   |
| ------------------ | -------------------------------------------------------------------- | -------------------- |
| `web-suites`       | web `abuse`, `report`                                                | `chromium`           |
| `extension-suites` | extension `account` (6 public specs), `ai`, `report`, `selection`, `firefox` | `chromium firefox`, plus Firefox Developer Edition 160.0b4 |
| `public-contracts` | server `abuse`, `history`, `owner-deletion` contracts                | none                 |

The native Firefox sidebar specs (`e2e-firefox/sidebar.spec.ts` and the Firefox test in
`e2e-account/panel.spec.ts`) drive Firefox over WebDriver BiDi. Playwright's patched
Firefox does not start BiDi (checked locally with its build 1555), so the job downloads
Mozilla's Linux amd64 Developer Edition tarball from `archive.mozilla.org`, checks it
against a pinned SHA-256 and passes it as `SOURCE_TASTER_FIREFOX_BINARY`.

All three are in the `checks` aggregate gate's `needs`, with a matching result
check, so the commit's `checks` conclusion (which the deploy workflow reads)
covers them. Each job's own check run is recorded against the commit SHA by
GitHub. Browser evidence is uploaded on failure.

The test work is small: 17 s, about 94 s and about 138 s locally. Each job's cost is the
shared prelude (the Pagefind build took about five minutes on the laptop and about 13
minutes on the hosted runner), so the three jobs sit far inside the 60-minute
budget. Separate jobs rather than one were chosen so that each has its own verdict and
runs in parallel; folding them into one job would save two preludes of runner time and
would still fit.

`apps/server/test/operations/ci-workflow.test.mjs` now guards these jobs: the
bounded timeout, PostgreSQL 18, the extractor image and Pagefind prelude, the
`checks` gate, the exact configs and browsers, the failure artifacts, SHA-pinned
actions, the absence of any private-service reference or secret, the exclusion of
`sensitive-panel`, and that no CI step runs a class B config.

### Findings while running the suites

- Playwright reads positional arguments as path regular expressions. The first
  draft named `panel.spec.ts`, which also matched `sensitive-panel.spec.ts`
  (class B) and failed. The workflow now names `e2e-account/panel.spec.ts` and so on.
- Locally, the test PostgreSQL host defaults to `localhost:5433` for both
  `DATABASE_ADMIN_URL` and `DATABASE_TEST_URL`. With a database on another port,
  set both. This is environment configuration, not a defect.
- The web servers serve `apps/website/dist-preview`, so every browser suite needs
  `pnpm build` including the website, which needs the Pagefind prelude.
- No class A suite needed a code fix; none was skipped or flaky in the runs above.

## Class B: run in the private service's CI

Decision (product owner, 5 November 2026): class B suites run in the private
service repository's own CI, not here. This repository is public, so that workflow
checks it out anonymously. There is no deploy key, no secret in this repository and no
class B step in `ci.yml`. The plan with a deploy key in a public `private-e2e.yml`
from the earlier version of this document is dropped.

What that workflow does, in outline:

```text
cross-program job (matrix of three groups, 60-minute timeout each, PostgreSQL 18)
  check out the private service, and this repository at a ref (default main)
  record both commit SHAs in the step summary
  install and build the private service
  install and build this repository's server and extension packages, without the website
  SOURCE_TASTER_SERVICE_WORKTREE = the private checkout
  group 1: server contracts abuse-both, account, configuration, dpa, extension
  group 2: server contracts guest, quota (incl. commerce, catalog), rights, sensitive
  group 3: extension account (sensitive-panel.spec.ts), dpa, history, preferences,
           private, quota (plus native Firefox Developer Edition, checksum-pinned)
```

- **Triggers:** a nightly schedule, manual dispatch with a ref of this repository,
  and pull requests in the private repository that change the workflow itself.
- **Not in the deploy gate:** a red run is a signal for a human, not a deploy blocker.
- **Logs and artifacts:** the suites use fakes only (fixed fake keys, loopback mail
  capture, no real provider or payment). Only the website-preview job uploads
  Playwright failure context and traces, on failure, for seven days.
- **First green run (5 November 2026):** the three groups took about 2, 6 and 4
  minutes on the private repository's self-hosted Linux arm64 runners. Group 1 ran 13
  tests in 5 configs, group 2 ran 53 and group 3 ran 24, all passed. That run is
  evidence of these suites at those two commits only. It says nothing about deployment.

### Website-preview suites on Linux amd64

The web suites `account`, `dpa`, `guest`, `history`, `quota`, `rights`, `sensitive`
and the extension `guest` suite need the website preview (`apps/website/dist-preview`,
and the extension suite starts the hosted web through `startHostedWeb`). Its Pagefind
build is in qualification scope only on macOS arm64 and Linux amd64 GNU
(`scripts/pagefind-source.ts`). These eight suites therefore run in a separate job on
a Linux amd64 runner. The job runs the same checksum-pinned Pagefind prelude as
`ci.yml`, with no stub, no prebuilt substitute and no cache of its output.

- **Runner:** an opt-in self-hosted Linux amd64 runner, emulated on an arm64 host.
  Emulation is slow: the prelude takes about 20 minutes and the eight suites about 20.
- **First green run (6 November 2026):** web 38 tests and extension Guest 14 tests,
  all passed. Earlier runs on that runner found three spec defects, fixed in #164 and
  #170, and one product defect, #171: under load a Check create can return an empty
  201. Until #171 is fixed, `quota.spec.ts` can fail intermittently on that runner.

With this job, #142 AC2 covers every class B suite listed in this note.

## Human steps

1. Decide whether a failing nightly run should block deploys.
