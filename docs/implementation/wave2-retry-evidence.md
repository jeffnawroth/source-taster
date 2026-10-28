# Wave 2 retry evidence correction

The second Spec review found one new P2: a schema-valid payload from a failed
HTTP response survived into a later retry whose headers were successful but whose
body failed. Combining that stale payload with the newer status could invent
Correct or DOI conflict. The review considered the three original Spec findings
resolved by inspection; its attempted behavioral rerun had no PostgreSQL service.

## Correction

Response parsing is local to each attempt. Only a fully read, deadline-compliant
successful/404 response can provide the payload returned for interpretation.
Resolver, singleton and combined Crossref classification additionally require the
completed-response marker before treating a status or payload as source evidence.
An oversized, timed-out or otherwise incomplete body remains unavailable evidence.
The original deadline, provider permits, retry budget, authority checks and result
publication fences remain in place.

The changed Search strategy version is
`doi-crossref-public-tracer-3-uncalibrated`. This records changed outcome behavior;
it is not calibration or release eligibility. The transport artifacts and private
contract pin `bfd3edeb79866e26f7e6057712322031bc692fbc` are unchanged.

## Public-boundary evidence

Tests use the approved real PostgreSQL HTTP/SSE seam with actual verification web
and worker processes. Only the external HTTP source fixture supplies responses.
Its sequence support produces a 503 with valid Handle/metadata JSON followed by
a 200 response whose body is oversized or never completes. There are no
application-table, queue-state, internal-call or log assertions.

- **Red:** a 503 carrying a matching nonexistent Handle followed by oversized 200
  returned DOI conflict, with the first payload recorded as successful 200 evidence.
- **Green:** the same sequence produces Not verifiable and unavailable resolver
  evidence, preserving two attempts and the response-size reason.
- A Crossref 503 with matching metadata followed by 200 headers and a timed-out
  body produces Not verifiable, no Candidate and unavailable Crossref evidence.
- All 35 DOI HTTP/SSE tests and 80 server regression tests across eight files pass
  (`--exclude test/website.test.ts`; the unchanged website artifact is not built in
  this root checkout). The final complete authority run passes all 25 cases.

Build/typecheck for server and core, changed-file ESLint/Prettier and
`git diff --check` passed. The measured release guard refuses with exit 78.
An initial preparation run could not start because this root checkout's ignored
core build was stale; a frozen install and core rebuild corrected preparation.
That startup failure is not the red behavioral observation.

The first full authority run passed 24/25 cases; the held-snapshot revocation case
failed with a local `ECONNREFUSED`. Its targeted rerun passed. Inspection found the
source-only Guest process reporting IPC readiness immediately after initiating
the HTTP listener, before its `listening` event. The fixture now awaits that event
before reporting ready, including on restart. The complete rerun passes all 25
cases; the failed run is retained as a failure, not counted as passing evidence.

Commands from this checkout:

```sh
SOURCE_TASTER_TEST_API_PORT=54320 SOURCE_TASTER_TEST_DOI_PORT=54321 pnpm --filter @source-taster/server exec vitest run test/doi.test.ts
SOURCE_TASTER_TEST_API_PORT=54320 SOURCE_TASTER_TEST_DOI_PORT=54321 pnpm --filter @source-taster/server exec vitest run --exclude test/website.test.ts
SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-96 pnpm --filter @source-taster/server test:authority
pnpm --filter @source-taster/server typecheck
pnpm --filter @source-taster/server build
pnpm --filter @source-taster/core typecheck
node apps/server/scripts/release-check.ts
```

The last command intentionally returns 78. Raw parent-owned transcripts use
`/tmp/st-wave2-r2-{red,green,doi,server,authority,authority-target,authority-final}.log`.

The parent owns the ephemeral PostgreSQL 18 container on loopback 5433; tests
provision and remove unique databases/roles. Task HTTP ports are 54320/54321 and
the separately configured authority harness ports. Ports 8000/4567 and unrelated
containers/files are untouched. No private implementation changes or new
dependency/controlled-recipe inputs were introduced. The prior audit is retained
with its recorded date and scope; no fresh advisory scan is claimed for this fix.

The existing source-only uncalibrated development composition, release/publication
gates, native extension dependency on #92, and #94/#99/#100 plus human qualification
limits remain. This response is implementation evidence; independent re-review
and current-head CI are still required.
