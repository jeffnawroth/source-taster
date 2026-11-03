# #108 — consumer cancellation implementation

Implementation is complete locally on the paired source branches. Publication,
activation and specialist legal review remain gated. No actual external mail
or payment/provider success is claimed.

## Sources and integration

- Public: `t3/cancellation-intake-flow`, checkout
  `/Users/jeffnawroth/.t3/worktrees/source-taster/t3-ea7ef1ba`.
  Implementation/evidence-merge head before this handoff:
  `0743294b25f30d90da10e2a4bbc127b27123b958`.
- Private: `t3/108-consumer-cancellation-nov2`, existing SOURCE106 checkout
  `/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-106`.
  Implementation/evidence-merge head before this handoff:
  `638a8251ca6fa818c5a97c0ff394b49ea0687f64`.
- Runtime changes end at public `ef8fb498d6a2b5d404bf2387b83e15653dcebab8`
  and private `f105a7a9eab55e467bae2ef9eb183ee3109d71c7`.
  Later merges contain only the published #109 evidence.
- Both latest committed integration tips are ancestors: public
  `592b74970998804477016f6c53775fcda66542bb`, private
  `7c76642bbd1ab99351e9d0c909b202ce69bdc425`. Initial public `2775228f`,
  private `e9a39fde`, and completed #107 `bcf5620e` remain ancestors.

The #109 merge preserves VAT validation, purchase tax snapshots and immutable
invoice evidence. Source conflicts were resolved by retaining both additions;
contract outputs were regenerated normally, never hand-merged. Only committed
integration code was merged. SOURCE100–102, #112, the public root and private
integration checkout were not edited. No predecessor code was read.

## Behavior and boundary

The hosted web shell always renders the DE/EN cancellation entrance, independently
of Account/Quota readiness and signed-in state. It navigates directly to the
private `/cancel?language=de|en`, carrying no credential, reference, email or
referrer. The shared private shell exposes the same link on readiness, Order,
Plan, Operator and cancellation pages. The German labels are exactly
“Verträge hier kündigen” and “jetzt kündigen”.

The confirmation form asks for a contract reference and current confirmed email,
plus interface language. It has no sign-in, fresh proof, paid permission,
retention offer, survey, consent checkbox or payment-provider detour. Pro Order
confirmations now include the contract reference. The engineering identification
policy uses the issued UUID and current verified Account contact; its sufficiency
and wording still require FA-UEB-23 legal review.

Public transport adds `CancellationRequest`, `CancellationResponse` and
`submitCancellation` (`POST /v1/commerce/cancellations`). The request contains
an operation UUID, contract UUID, email and DE/EN language. The response contains
only the supplied operation reference and durable notice receipt time, with
`quota: null`. Known, unknown, mismatched and already-cancelled contracts share
that response shape. No contract end, address, provider, billing or mail status
is disclosed to a public caller, and no end is invented for an unidentified
contract. This acknowledgment explicitly does not assert a contract match or
mail delivery. Users can correct their details and save their own notice and
acknowledgment as text. The identified contract's receipt and end remain available
through the confirmed email and protected Account confirmation.

The private implementation owns identification, the transaction, immutable
cancellation evidence and the existing subscription outbox. Cancellation and
receipt enqueue commit together. It immediately attempts the relevant receipt
through the provider-neutral mail transport, in the page language. SMTP failure
leaves durable retry state and a stable Message-ID; acceptance is not rolled
back by SMTP or payment-provider failure. Captured transport acceptance is not
proof of external delivery, and a crash after SMTP acceptance can resend the
same Message-ID.

The accepted statutory end is frozen from local paid-period evidence (or receipt
time when there is no remaining paid period). Provider synchronization uses that
end, or terminates when it has passed. A late invoice cannot create a term beyond
that accepted end. Such outside-contract invoices remain durably unprocessed;
this implementation does not silently grant an extension or invent a refund.
Existing #107 authenticated cancellation retains its prior paid-before-notice
reconciliation behavior. Existing paid grants are not shortened or reset.

Provider synchronization no longer holds the cancellation intake lock during
network I/O. A bounded in-flight initial activation remains serialized with
intake to preserve its billing fence; intake allows the existing 30-second
activation transaction to finish/roll back and records the original receipt
clock. Repeated/concurrent notices neither create another receipt event nor
reschedule the accepted end.

The legal entrance bypasses Account/Quota and shared business-budget accounting,
including limiter recovery failure. It retains trusted-origin CSRF protection,
an 8 KiB body bound, strict schema limits and durable per-contract mail
deduplication. Unmatched/repeated intake digests expire after 24 hours; the first
accepted cancellation has immutable retained operation evidence. No raw IP,
unverified recipient mailing or broad anonymous Account access is introduced.

## Deployment and pin handoff

The static site's shared footer accepts
`SOURCE_TASTER_CANCELLATION_SERVICE_ORIGIN`. Publication requires a configured
HTTPS service origin; preview additionally permits loopback HTTP. A preview with
no configured commerce service has no active cancellation destination. Hosted
web uses its existing `VITE_SOURCE_TASTER_SERVICE_URL`. Configure both to the
actual private service before publication. Standalone has no subscription sale.

All five committed private pins still point to published
`ba42c6e82937241277c1653e800be944b7e0b932`: server internal/service/verification,
web service and `scripts/evidence.ts`. That published version includes #109 but
not #108. Local acceptance uses only the assigned public checkout through
uncommitted private workspace/lock overrides. Parent publication must precede
repinning all five locations to the published #108 public head, normal lockfile
regeneration, frozen installation and installed-byte comparison. No local path
or unreachable SHA was committed. A canonical install on the inherited pins is
not claimed to contain the new cancellation transport.

## Validation

All database tests use real isolated PostgreSQL. Both programs and real browser
clients run; external payment/VIES/Billit/mail and time are synthetic at their
approved adapter seams. The inherited actual Saxon and hash-pinned official
rules provide narrow Schematron validation, not additional legal qualification.

| Check | Result |
| --- | --- |
| Integrated private cancellation/subscription/commerce/abuse/business-tax HTTP | 46/46 |
| Final oversized-request Problem Details case | 1/1 |
| Integrated private DE/EN cancellation, Order, VAT and Plan browser flows | 8/8 |
| Integrated actual-program DE/EN public web, all site layouts, signed-in/out and failed-Account forwarding | 2/2 |
| Integrated actual-program current authority, SSE, deletion and fences | 33/33 |
| Final actual-program pack/Pro Quota and cancellation commerce cases | 2/2 |

The earlier 10/10 both-program Quota/commerce run preceded #109 integration and
remains historical evidence. No new full private-suite run is claimed for #108;
the focused 46 plus the final 413 case and listed client/authority regressions
are the checks performed here.

Public affected typechecks, focused ESLint, DE/EN checks, web/server/website
builds pass. Private typecheck, full lint, DE/EN checks and builds pass. Four
contract trees, public catalog and private Prisma reproduce byte-for-byte; the
private catalog also reproduces after the final error-message addition.
Controlled Pagefind was cloned from the existing task cache using APFS and
verified normally against source/tool/artifact hashes before the ordinary site
build. No substitute browser index or native-build bypass was used. Release
refusal remains **exit 78**: no load report, uncalibrated, no Measured
configuration, no measurement location.

Red/green logs include missing public HTTP route (404), wrong German Operator
locale, contract-end extension on delayed invoice, slow provider holding the
legal-intake lock, missing correction action after receipt, and plain-text 413
instead of the declared Problem Details response. Setup failures are retained:
initial missing public dependencies; an over-broad delay fixture timeout;
Preferences URL/port mistakes; and an early browser assertion that closed its
fixture before the second response. These failures are not renamed as passes.
The initial workspace-override stash apply conflicted with the newer lockfile;
original bytes were preserved and the lock was regenerated normally.

Commands, source ancestry, log hashes, override hashes, backup/stash receipts and
cleanup are in [the evidence manifest](../evidence/108-consumer-cancellation.json).
The detailed private reproduction and limitations are in `docs/validation-108.md`
in SOURCE106. Logs reside in this checkout's `.tmp/spec-70-orchestration/108-*`.

## Retained gates and cleanup

No live VIES, Billit, payment or mail call, merchant approval, final wording,
legal/tax/retention qualification, security assessment, native-browser
qualification or deployment readiness is claimed. CSS zoom, axe and Chromium
fixtures do not qualify Q01. Better Auth 1.7.14, inherited Selected/dependency and
minimatch/advisory gates, source rights, calibration/Measured activation, real
load, legal/tax, security, browser and deployment gates remain. #112/#113 and the
whole-spec final review remain separate. No push, PR, issue mutation, nested
agent, shell worktree, release/activation or scheduled-job change occurred; the
five-hour retry job was left enabled.

The exact owned `st108-owned-pg` container
`61f19278f58c9c537695782c8b5d01334fc22ff4b357d29e92b5e03606fd5142` was removed
only after identity verification and zero other client backends. Ports
5501/5502/5503/5442/55421 are free. Test processes and their own databases/profiles
were cleaned up. Source histories, two original override backups/stashes, logs
and verified tool caches remain. No unrelated resource was cleaned up.
