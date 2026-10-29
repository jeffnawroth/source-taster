# #75 review corrections

The independent round-one Standards review of `29bfec1...0fa903c` found one
P2 date-range regression. The Spec review of that frozen range is separate.
The parent implements this response on `fix/75-review-corrections`; the original
implementation worktree remains unchanged for the ongoing review.

## Standards: compare date ranges only by year

ADR-0025 requires seasons and date ranges to compare only their year. The
new preceding-day parser incorrectly interpreted `15 June – 16 July 2021` as
June 15, causing a 90% date Field score against June 17 of the same year.

The parser now recognizes day ranges, named-month ranges and explicit range
separators before selecting a single named month/day. Exact ISO single dates
still take their existing path. Eight public HTTP/SSE witnesses cover English
and German forms, shared-month day ranges, month ranges and ISO date ranges;
the original raw date value is retained. The profile's single-date and other
comparison witnesses remain in the same suite.

This changes outcomes, so the runtime records a new
`comparison-75-3-date-ranges-20261028` Scoring rules version. The parameter/limit
fingerprint and Unicode/ICU record remain intact. Both approved author tie
clarifications remain unchanged. No new domain decision or calibration is
claimed, and earlier immutable results retain their recorded versions.

## Validation

Tests use the previously approved real-PostgreSQL HTTP/SSE and browser seams.
The parent owns disposable container `st75-review-fix-pg-20261028` on loopback
55478 and ports 54670–54675; unrelated resources are preserved. Each harness
owns its database/role. No application-table/internal-call assertions were added.

- RED: eight date-range cases ran; five produced false deviations, three already
  passed. `.tmp/st75-review-date-red.log` records the behavioral failures.
- GREEN: all **76** comparison HTTP/SSE cases pass, including the eight new
  witnesses. `.tmp/st75-review-comparison-green.log`.
- Core/server builds and typechecks pass; changed-file ESLint and Prettier checks
  pass; `git diff --check` passes.
- Release refusal remains effective: `node apps/server/scripts/release-check.ts`
  exits **78** because the profile is uncalibrated.
- Full server regression: **160 passed / 10 files**, including the eight new
  date-range cases. `.tmp/st75-review-server-final.log`.
- Browser comparison/display and DE/EN author-evidence/axe regression:
  **12 passed**. `.tmp/st75-review-browser-final.log`.

An initial test attempt ran before PostgreSQL finished initializing and failed
during setup. PostgreSQL readiness was confirmed before the isolated RED/GREEN
runs; that setup failure is not behavioral evidence.

Dependencies, lockfile, transport contracts, private-service code, controlled
website recipe and legal/publication approvals are unchanged. The original
implementation's broader evidence retains its original scope. No fresh advisory,
live, load, source-rights, calibration or release qualification is claimed here.

The first broad regression attempt passed 158 server cases but could not start
the website fixture, and the browser runner could not start Vite: this checkout
had no ignored `apps/website/dist-preview` prerequisite. The original #75
controlled preview was reused without rebuilding or changing its recipe. All
website/scripts/package/lockfile inputs are byte-identical to `0fa903c`, the
original `pagefind-source.ts verify` passes, and all 73 copied artifact hashes
match its manifest. Final reruns use that same controlled artifact. No source
build, review or publication guard was bypassed.

The copied checkout also had stale generated Paraglide outputs, which made the
first browser rerun show `m.check_reset is not a function`. That run was stopped
after three identical failures; its log and traces are retained. Rebuilding the
unchanged i18n package with `pnpm --filter @source-taster/i18n build` restores
the required generated artifacts; the final isolated browser run passes all 12
cases. No product source/catalog change was necessary.
