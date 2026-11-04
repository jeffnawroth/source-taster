# #142: Run the contract and Playwright suites in CI

The launch audit found that most end-to-end evidence ran only on a developer
machine. This document records the public half of the fix: which suites can run
from this repository alone, which of them now run in `.github/workflows/ci.yml`,
and the plan and human steps for the suites that need the private service.

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
| `account`: `panel`, `preferences-transport`, `sensitive-transport`, `transport` | A | **yes (`extension-suites`)** | 23 passed, 33 s |
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

The extension `account` config is mixed. CI runs its four class A specs by path
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
| `extension-suites` | extension `account` (4 public specs), `ai`, `report`, `selection`, `firefox` | `chromium firefox` |
| `public-contracts` | server `abuse`, `history`, `owner-deletion` contracts                | none                 |

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

## Plan for class B (not wired, needs a human decision)

Checking out the private repository needs a credential, so it is not added to
`ci.yml`. Add a separate workflow `.github/workflows/private-e2e.yml`:

```yaml
name: Private-service end-to-end
run-name: Private-service end-to-end @ ${{ github.sha }}
on:
  schedule:
    - cron: "41 3 * * *"
  workflow_dispatch:
    inputs:
      service_ref:
        description: Private service commit SHA to test against
        required: true
permissions:
  contents: read
concurrency:
  group: private-e2e-${{ github.ref }}
  cancel-in-progress: false
jobs:
  private-e2e:
    # Never on a fork, never on a pull request. Both triggers above run only
    # in the base repository with its own secrets.
    if: github.repository == 'jeffnawroth/source-taster' && github.event_name != 'pull_request'
    runs-on: ubuntu-24.04
    timeout-minutes: 60
    environment: private-service # holds the deploy key; required reviewers optional
    strategy:
      fail-fast: false
      matrix:
        group: [server-contracts, web-browser, extension-browser] # split to stay under 60 min
    services:
      postgres: # postgres:18 on 5433, as in ci.yml
    steps:
      - uses: actions/checkout@<same pinned SHA as ci.yml>
        with:
          persist-credentials: false
      - uses: actions/checkout@<same pinned SHA as ci.yml>
        with:
          repository: <owner>/<private service repository>
          ref: ${{ inputs.service_ref || vars.PRIVATE_SERVICE_REF }} # a full SHA
          ssh-key: ${{ secrets.PRIVATE_SERVICE_DEPLOY_KEY }} # read-only deploy key
          path: .private-service
          persist-credentials: false
      # then, as in ci.yml: pnpm setup, install, Pagefind prelude, pnpm build,
      # extractor image; install and build the private worktree (frozen lockfile)
      - run: echo "SOURCE_TASTER_SERVICE_WORKTREE=$PWD/.private-service" >> "$GITHUB_ENV"
      # one group per matrix entry: the class B contracts, web configs or
      # extension configs from the tables above, with explicit --config flags
      - name: Record both commits
        run: |
          echo "public ${{ github.sha }}" >> "$GITHUB_STEP_SUMMARY"
          echo "private ${{ inputs.service_ref || vars.PRIVATE_SERVICE_REF }}" >> "$GITHUB_STEP_SUMMARY"
```

Rules for the workflow:

- **Triggers:** only `schedule` and `workflow_dispatch`. Never `pull_request`,
  `pull_request_target` or `workflow_run` from a fork, so a fork can neither run it
  nor read the key. The repository condition is a second guard.
- **Key handling:** a read-only deploy key, stored as an environment secret and
  passed only to the one checkout step through `ssh-key`. `persist-credentials: false`
  everywhere, so the key is not left in the working tree. No other step receives
  the secret; no step runs `set -x`, `env`, `printenv` or `docker inspect`.
- **Logs and artifacts:** the suites use fakes only (fixed fake keys, loopback mail
  capture, no real provider or payment). Do not upload `test-results` or traces from
  these runs until someone has checked that they carry no private source paths or
  content; upload only the JUnit or JSON summary.
- **Evidence tied to commits:** the run name and step summary carry the public SHA
  and the exact private SHA. Test against a pinned private SHA, not a moving branch,
  so a pass or fail is reproducible. The private service pins the public contract
  packages by SHA, so the two SHAs together describe the combination.
- **Not in the deploy gate:** `deploy-scalingo.yml` and the `checks` job stay
  untouched. A red scheduled run is a signal for a human, not a deploy blocker, until the
  team decides otherwise.
- **Budget:** split the matrix so every job fits 60 minutes. The Pagefind build alone
  is about 13 minutes on the hosted runner; add `pnpm build` and the private service's
  install and build. Measure
  the first run and re-split if needed. Running the class B browser suites on the
  hosted runner has not been tried; expect to adjust ports and timeouts.

## Human steps

1. Confirm the private service repository name and the commit or branch to test.
2. Generate a dedicated key pair (`ssh-keygen -t ed25519 -N "" -C "source-taster-ci-read"`).
   Add the public key to the private repository as a **read-only deploy key**.
3. In this repository create the environment `private-service` and store the private
   key there as the secret `PRIVATE_SERVICE_DEPLOY_KEY`. Optionally require a
   reviewer for the environment and restrict it to the default branch.
4. Add the repository variable `PRIVATE_SERVICE_REF` (a full SHA) or accept the
   `workflow_dispatch` input.
5. Delete the local copy of the private key once it is stored.
6. Review and merge `private-e2e.yml`, then run it once with `workflow_dispatch`
   and read the first logs for anything that should not be public.
7. Decide whether a failing scheduled run should block deploys, and how often to
   rotate the deploy key.
