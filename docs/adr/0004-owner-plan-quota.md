# Hold Plan and Quota on a separate Owner and derive the balance from an immutable Quota journal

The client accepted this decision on 24 October 2026 in [Owner, Plan and Quota model](https://github.com/jeffnawroth/source-taster/issues/13). It fills the Owner and Quota seams of [ADR-0003](0003-system-architecture.md).

- An Account signs in. An Owner holds Plan, Quota and stored Checks.
- Each Owner has one base Plan plus any number of time-bounded grants. All Quota movements are booked in an append-only journal per Owner, and every balance is derived from that journal.

This lets organizations become Owners later without data migration (FA-ERW-01, FA-ERW-02). It also makes payment retries, restores and Operator corrections reconcilable. The cost is a ledger in place of a simple counter.

This ADR fixes the model and the commercial rules the client chose. These belong to other tickets:

- Provider mechanics: [Payment provider and tax model](https://github.com/jeffnawroth/source-taster/issues/18)
- Billing on cancellation, failure and Data source outage: [Check and Reference model and lifecycle](https://github.com/jeffnawroth/source-taster/issues/14)
- Sign-in mechanics: [Authentication and roles](https://github.com/jeffnawroth/source-taster/issues/23)

## Owner, Account and Guest

- **Owner and Account are separate.**
  - Confirming an Account's e-mail address creates exactly one personal Owner for it.
  - Accounts never hold Quota.
  - A later organization is another Owner, and its members' Accounts act for it.
- **Guest.**
  - Each client environment (the web app and the extension) holds its own random Guest ID, so one browser can receive the Guest Quota twice.
  - The FA-BTR-04 limits for all Guests and per origin bound abuse.
  - A Guest has only the daily Guest Quota: no Plan, no purchases and no grants.
  - Nothing transfers on registration, because FA-KTO-07 is deferred.
  - This reading of "per browser" in FA-KTO-15 is logged on the map as a requirements interpretation.

## Entitlement

- **One base Plan plus grants.** Every Owner has exactly one base Plan, Free or Pro. Additional grants are:
  - Check packs;
  - Operator credits, with a validity the Operator sets (default 30 days);
  - the time-limited Pro upgrade (FA-BTR-03).
- **Features and Quota.**
  - Features are the union of all valid grants: a Check pack or the Pro upgrade unlocks the paid features.
  - Available Quota is the sum of all valid grants, minus debits and open reservations.
  - Pro Owners may also buy Check packs.
  - The Pro upgrade gives Pro features and the monthly Pro Quota. It reverts by itself, without a charge.
- **Periods.**

  | Grant | Period |
  |---|---|
  | Guest | Calendar day, Europe/Berlin |
  | Free | Calendar month, Europe/Berlin |
  | Pro | Each paid subscription period |
  | Check pack | 30 days (initial value) from activation |

  Unused Quota expires and never carries over.
- **Activation and withdrawal (FA-KTO-23).** A paid grant becomes active at confirmed payment only if the consumer separately consents to the immediate start. Without consent, it becomes active when the withdrawal period ends, or earlier on later consent. A withdrawal before activation means the grant never starts. Payment provider and tax model decides whether this shifts the subscription billing date. This rule needs legal review.

## Quota journal and consumption

- **Journal.** Every movement is an immutable entry per Owner and grant: credit, reservation, debit, release, expiry or Operator correction. Each debit records the acting Account as actor. The journal serves:
  - the Operator's consumption view (FA-BTR-01);
  - per-member consumption later (FA-ORG-05);
  - audit;
  - reconciliation after a restore.
- **Allocation order (example below).** A reservation draws from the grant that expires first. When two grants expire at the same time, the base Plan comes before Check packs and credits.
  - Example: a Pro Owner has used 600 of 1,000. They buy a Check pack on day 20, valid until day 50, and Pro renews on day 30.
  - The remaining 400 Pro References are consumed first, then the Check pack.
- **Concurrency and retries.**
  - A reservation is taken atomically against the available balance, so a second parallel Check sees the reduced balance.
  - Every debit carries a unique key of Check and Reference, so a job retry never debits twice.
- **Reservations.**
  - A reservation lives while its Check is active. It is extended with the Check's lease, up to a hard cap of 2 hours; about 30 minutes is expected for 1,000 References.
  - When a reservation expires, its remainder is released. A late debit is booked only up to the available balance, and any excess is forgiven. Quota never becomes negative.
  - A reservation stays bound to the grants it was drawn from. A Check started just before a period boundary is booked against the old period and never draws from the new one automatically.
- **Free Re-checks (FA-STR-11, FA-KTO-11).** Checking an existing Reference slot of the same Check again after a correction is free, as often as the user likes, for as long as the Check exists. The request limits of FA-BTR-04 bound abuse.
  - Added References are billed.
  - Starting an earlier Check again from History (FA-ERG-22) is billed like a new Check.
- **Display, warnings and partial Checks.**
  - Available Quota is shown in total and per grant with its expiry date.
  - The 80 % and 100 % warnings (FA-KTO-12) use the sum of all currently valid grants. For example, Free 100 plus a Check pack of 300 gives 400, so the 80 % warning comes at 320.
  - When Quota is insufficient (FA-KTO-13), this model fixes only the offered amount: as many References as are available. Which References are selected belongs to Check and Reference model and lifecycle.

## Plan changes

- **Free to Pro.** Pro starts at activation with its full Quota, without proration. The remaining Free Quota lapses.
- **Check pack on Free.** The Free Quota continues alongside the Check pack.
- **Cancelling Pro** is the only downgrade (FA-KTO-26).
  - Pro stays until the end of the paid period. The Owner is then Free.
  - The Owner receives the full 100 for the rest of that calendar month, without proration.
  - Each renewed paid period creates a new Pro grant.
- **History after paid features end** (FA-KTO-16, FA-UEB-11).
  - The last five Checks younger than 30 days stay usable.
  - All other stored Checks are locked: they stay visible with a notice about the Plans until the Owner upgrades again, and are deleted at the latest on their original deletion date.
  - The user can delete them at any time.
- **Operator Plan changes (FA-KTO-10, FA-BTR-02).** Changed quotas and scope apply from the next period and to new purchases. Running periods and bought Check packs keep their values. Credits and the Pro upgrade take effect immediately.

## Payment effects

- **Idempotency.** A paid grant is keyed on the provider's business object, the invoice or subscription period, not on the webhook delivery.
- **Reconciliation.** A periodic job, also run after every restore, creates missing grants and reports surplus grants to the Operator.
- **Failed renewal.** No new Pro grant is created without payment. While the provider retries, the Owner is on Free features and Quota, and the failed-payment e-mail is sent (FA-KTO-50). When payment succeeds, the Pro period starts.
- **Refund.** The Operator initiates refunds at the provider. The unused remainder of the refunded grant is withdrawn immediately, but consumed Quota is never reclaimed. Paid features end when no other grant provides them. The statutory basis needs legal review.
- **Chargeback.** The unused remainder is withdrawn and the case appears in the Operator's account view. The Account is not blocked automatically.

## Blocking and deletion

- **Blocking (FA-BTR-03)** affects the Account's sign-in and its personal Owner.
  - Running Checks are cancelled under the lifecycle rules, and their reservations are released.
  - Grants are kept, but their periods keep running.
  - The subscription continues until the Operator ends it.
  - Later, blocking a member's Account does not block an organization Owner.
- **Account deletion (FA-KTO-04)** extends ADR-0003's sequence:
  1. Before deletion, the notice also names any active subscription and the remaining Quota.
  2. The service ends the subscription at the provider immediately. If the provider is unreachable, deletion is blocked and retried.
  3. The verification program deletes the Owner and writes the tombstone.
  4. The service deletes the Account.

  The paid remaining term and Check packs lapse without a pro-rata refund. This needs legal review.

## Organizations later

- **Joining (FA-ERW-02).** When an Account joins an organization, only a membership (Account, organization Owner, role) is created. The personal Owner keeps its Plan, grants and History unchanged. A personal Pro subscription continues independently.
- **Checks.** Every Check belongs to exactly one Owner, chosen at start. Its debits go to that Owner's grants and record the acting Account. This is the basis for shared Quota with per-member consumption (FA-ORG-05).
- **Annual subscriptions (FA-KTO-32)** and the Pro trial (FA-KTO-30) later become further grant validity periods.

## Considered options

- **Quota held on the Account**, rejected because organizations would need migration.
- **A single mutable counter per period**, rejected because webhook retries, restores and corrections could not be reconciled.
- **One shared Guest ID across web app and extension**, rejected for the pairing mechanism it would need between the two environments for a small daily Quota.
- **Paid grants keyed on webhook delivery**, rejected because a provider redelivery or a restore could grant twice.
- **Negative balances for late debits**, rejected in favor of forgiving the excess.
- **Pro proration and carry-over**, rejected for simplicity.
- **Pruning History on downgrade**, rejected because users would lose Checks.
- **Keeping all History usable after a downgrade**, rejected because it conflicts with FA-KTO-16.
- **A per-Reference cap on free Re-checks**, rejected because it would be a new initial value.
- **A grace period or immediate Pro Quota on failed renewal**, rejected.
- **Automatic blocking on chargeback**, rejected.
- **Pro-rata refund on deletion**, rejected.

## Consequences

- **Locked History is stored but cannot be opened.** This costs data minimization, bounded by the original deletion date and user deletion.
- **Legal review** (FA-UEB-23):
  - delayed activation under FA-KTO-23;
  - refunds;
  - no pro-rata refund on deletion.
- **Handed-off interfaces:**
  - [Payment provider and tax model](https://github.com/jeffnawroth/source-taster/issues/18):
    - consent capture and delayed activation, including the subscription billing date;
    - business-object keys;
    - dunning retries;
    - refund and chargeback events;
    - immediate cancellation on deletion.
  - [Check and Reference model and lifecycle](https://github.com/jeffnawroth/source-taster/issues/14):
    - commit on cancellation, failure and outage;
    - which References a partial Check takes;
    - what defines a Reference slot under correction.
  - [Authentication and roles](https://github.com/jeffnawroth/source-taster/issues/23):
    - Account confirmation creating the personal Owner;
    - Guest ID per environment;
    - blocking scope.
  - [Operator tools without a dedicated interface](https://github.com/jeffnawroth/source-taster/issues/24):
    - credits with validity;
    - the Pro upgrade;
    - refunds;
    - chargeback cases;
    - surplus-grant reports;
    - Plan edits.
  - [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22): running grant and reservation reconciliation after a restore.
