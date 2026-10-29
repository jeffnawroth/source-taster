# #92 / #96 native review corrections

The original extension delivery is frozen at `8f81a43`, based on reviewed
integration `d9a9dec`. Both independent reviews accepted its native driver,
shared-workspace and local-code design. Standards reported one P3 evidence gap;
Spec independently identified the same gap. The original private Guest issuance
CORS defect also remained a concrete blocker to the requested browser denial
acceptance. Parent corrections preserve the original checkout and evidence.

## Guest issuance errors remain readable

The private service previously attached CORS and cache headers before downstream
execution. Its error handling replaces the Response, losing those headers on
validation/denial Problems. Allowed browser origins therefore saw a fetch failure
rather than the signed service's structured refusal.

The private correction attaches origin and no-store policy to the final response,
including Problems and preflight, while refusing unlisted origins without CORS.
The existing real-HTTP Guest test now covers 200, 204, validation400 and forbidden
unlisted-origin403 with the expected headers. It was RED before the correction
and GREEN afterwards. No token, permission, signer, trust, contract or pin changes
are involved; the fix is confined to the private Guest issuance route.

The readable403 exposed a second, public presentation defect: shared
`CheckWorkspace` handled verification `ApiError`/SSE Problems but omitted the
existing `GuestTokenError`. The workspace now maps its recognized Problem key to
the existing DE/EN message. Unknown network failures retain their normal path.
The native English denial test was RED after the service fix and GREEN after
this mapping. Four focused native-panel/hosted-web DE/EN cases now pass. They
revoke an actually issued Guest, reload to clear the token, observe the refusal,
Reset and try again; only one denied issuance POST occurs, no verification
request occurs after refusal, and the same persisted Guest ID remains. Reset does
not clear the existing permanent-denial latch. No fallback identity is created.

## Observe the storage boundary without repairing it

The original trusted-context test called `setAccessLevel` itself. That proved API
support but could not prove that the production background applied the policy.
That test now only reads sync storage and available contexts; it never sets the
restriction.

A separate negative probe builds the real extension into an owned temporary
directory, confirms the production manifest has no content scripts, then adds
one explicitly test-only untrusted content script to that temporary manifest.
It reads extension-local storage using the browser's actual API on an owned
loopback page. The trusted panel first obtains its real Guest identity from the
actual peer. The probe reports only `readable` or `denied`, never stored values.
The shipped manifest, code, permissions and feature scope remain unchanged.

Removing only the production background's `setAccessLevel` call temporarily
makes the probe RED: actual untrusted storage access is `readable`. Restoring the
original production file makes it GREEN: access is `denied`. This mutation is
reverted byte-for-byte and is not a product change. Both this discriminating
probe and the ordinary production-manifest trusted-context case pass. It adds
no #93 selection feature and no production content script or permission.

## Validation scope and execution

Approved seams remain real HTTP/PostgreSQL and actual loaded Chromium native
panel/hosted web against both programs. Only external provider/time fixtures are
used; there are no application-table, queue-state or internal-call assertions.
The negative storage probe is an explicit test-only capability injection, not a
claim that the shipped extension has an untrusted context.

Focused transcripts in `.tmp/st92-review/`:

- Native readable-denial RED: `native-denial-red.log`; four GREEN cases:
  `denial-green.log`.
- Storage mutation RED: `storage-mutation-red.log`; restored two-case GREEN:
  `storage-green.log`.
- Matching controlled Pagefind receipt verified after cloning the existing
  complete cache with the same lock hash; no cross-lock reuse.

The private focused real-HTTP RED/GREEN transcripts are
`.tmp/st96-cors-review/http-cors-{red,green}.log` in its own repository.
Builds/types/lint/catalogs pass there. The parent owns disposable PostgreSQL18
`st92-cors-review-pg-20261029` on loopback55494; runtime suites run serially and
cleanup follows final validation. Environment files/keys stay owner-only and
are excluded from evidence archives.

CI now invokes the native Chromium standalone suite after the ordinary browser
stage and retains its failure artifacts. The Firefox native smoke remains an
explicit local command, and hosted native tests require the actual private peer.
No existing qualification gate is inferred from adding that CI command.

The current dependencies, lockfile, MIT contract pin, #75 comparison/identity
rules, source limits, lifecycle/authority fences and publication approvals are
unchanged by these corrections. Original `92-extension-skeleton.md` evidence
retains its exact browser/build/OS and test counts. Firefox hosted Guest,
full supported-browser/OS, frozen corpus parity, human, live/load, calibration,
production and publication qualifications remain separate and closed.

Final broad execution and independent correction-review results follow below.


## Final executed correction checks

The final source changes are public `81db82d` and private `a7b5d88`; the subsequent
private `2b2604c` changes only the existing queue-test clock setup and its record.
All runtime stages ran serially against owned PostgreSQL18 on loopback55494.

| Check | Result / transcript |
| --- | --- |
| Public full forced build | **12 tasks passed**, `build-final.log` |
| Public types / lint / catalogs / committed transports | **20 / 20 tasks passed**, 181 DE/EN messages, artifacts unchanged |
| Current native Guest and hosted-web denial suite | **14 passed**: 12 actual-native cases + 2 hosted-web denial cases, `native-guest-final.log` |
| Current native Chromium standalone/parity suite | **4 passed**, `native-chromium-final.log` |
| Current native Firefox standalone smoke | **1 passed**, `native-firefox-final.log` |
| Existing web Guest suite | **5 passed**, `web-guest-final.log` |
| Both-program authority | **31 passed**, `authority-final.log` |
| Private full HTTP source | **15 passed**, private `http-full-source-final.log` |
| Private full HTTP compiled mode | **15 passed**, private `http-full-compiled-final.log` |

Current native images, including readable DE/EN issuance denial, are retained in
`.tmp/st92-review/screenshots/`. Parent inspected the German denial image. The
browser versions and OS are the same as the original92 receipt; no wider browser
or OS claim follows. The unchanged public224HTTP/SSE and66ordinary/article web
cases retain their earlier92-checkpoint scope; current-head CI runs them again.

The first private full run and isolated baseline control exposed an existing
queue-test timing assumption, not a CORS regression. Its fake clock reached the
first30-second maintenance pass only near the end of a4-second wall assertion
window. The fixture now drives that startup interval explicitly first. The same
4-second window, claims, SMTP delay, polling/retry settings and all production
code remain unchanged. The original faulty-worker fixture still fails with the
receipt queued. Fresh independent Standards and Spec reviews accepted this
narrow setup correction; private `docs/review-guest-denial-cors.md` retains the
RED, diagnosis and source/compiled results.

## Independent final wave review

**Standards:** zero new material breaches or actionable smells over public
`29bfec1...81db82d` and private `cc316900...a7b5d88`; the earlier P3 evidence gap
is closed. The subsequent private test-only range `a7b5d88...2b2604c` was accepted
separately with zero findings.

**Spec:** zero new material findings over those full wave ranges. Independent
actual-source probes verified the corrected Guest-response middleware, selected
#75 fixed comparison witnesses and the #77 same-Source highest-score correction.
The private test-only clock change was accepted separately; its old-worker
negative control still discriminates the original bug.

Reviews were independent source/spec/retained-evidence checks and bounded
in-memory probes. The parent owns the runtime results above; the reviewers did
not rerun database or browser suites. Production release, store, publication,
human, frozen parity and broader live/load/browser/OS gates remain closed.
